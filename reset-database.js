const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvironmentVariables() {
  log('🔧 Checking environment variables...', 'cyan');
  
  if (!process.env.DATABASE_URL) {
    // Check if individual components are provided
    const individualVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    const missingVars = individualVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      log('❌ Missing required environment variables:', 'red');
      log(`   Either provide DATABASE_URL or all of: ${individualVars.join(', ')}`, 'yellow');
      log(`   Missing: ${missingVars.join(', ')}`, 'red');
      process.exit(1);
    } else {
      const dbHost = process.env.DB_HOST;
      const dbPort = process.env.DB_PORT || '5432';
      const dbName = process.env.DB_NAME;
      const dbUser = process.env.DB_USER;
      const dbPassword = process.env.DB_PASSWORD;
      
      process.env.DATABASE_URL = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
      log('✅ DATABASE_URL constructed from individual components', 'green');
    }
  } else {
    log('✅ DATABASE_URL found', 'green');
  }
  
  // Extract database name for reset operations
  const url = new URL(process.env.DATABASE_URL);
  return {
    databaseName: url.pathname.substring(1), // Remove leading slash
    adminUrl: `postgresql://${url.username}:${url.password}@${url.host}/postgres`
  };
}

function testDatabaseConnection() {
  log('🔌 Testing database connection...', 'cyan');
  
  return new Promise((resolve, reject) => {
    const testCommand = `psql "${process.env.DATABASE_URL}" -c "SELECT version();"`;
    
    exec(testCommand, (error, stdout, stderr) => {
      if (error) {
        log('⚠️  Database connection failed (this is expected if resetting):', 'yellow');
        log(stderr || error.message, 'yellow');
        resolve(); // Continue anyway for reset
        return;
      }
      
      log('✅ Database connection successful', 'green');
      resolve();
    });
  });
}

function terminateActiveConnections(adminUrl, databaseName) {
  log('🔌 Terminating active connections...', 'cyan');
  
  return new Promise((resolve, reject) => {
    const terminateCommand = `psql "${adminUrl}" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${databaseName}' AND pid <> pg_backend_pid();"`;
    
    exec(terminateCommand, (error, stdout, stderr) => {
      if (error) {
        log('⚠️  Could not terminate connections (this may be expected):', 'yellow');
        log(stderr || error.message, 'yellow');
        resolve(); // Continue anyway
        return;
      }
      
      log('✅ Active connections terminated', 'green');
      resolve();
    });
  });
}

function dropDatabase(adminUrl, databaseName) {
  log('🗑️  Dropping existing database...', 'cyan');
  
  return new Promise((resolve, reject) => {
    const dropCommand = `psql "${adminUrl}" -c "DROP DATABASE IF EXISTS \\"${databaseName}\\""`;
    
    exec(dropCommand, (error, stdout, stderr) => {
      if (error) {
        if (stderr.includes('does not exist')) {
          log('ℹ️  Database did not exist', 'yellow');
          resolve();
          return;
        }
        log('❌ Failed to drop database:', 'red');
        log(stderr || error.message, 'red');
        reject(error);
        return;
      }
      
      log('✅ Database dropped successfully', 'green');
      resolve();
    });
  });
}

function createDatabase(adminUrl, databaseName) {
  log('🏗️  Creating fresh database...', 'cyan');
  
  return new Promise((resolve, reject) => {
    const createCommand = `psql "${adminUrl}" -c "CREATE DATABASE \\"${databaseName}\\""`;
    
    exec(createCommand, (error, stdout, stderr) => {
      if (error) {
        if (stderr.includes('already exists')) {
          log('ℹ️  Database already exists', 'yellow');
          resolve();
          return;
        }
        log('❌ Failed to create database:', 'red');
        log(stderr || error.message, 'red');
        reject(error);
        return;
      }
      
      log('✅ Fresh database created', 'green');
      resolve();
    });
  });
}

function executeMasterSql() {
  log('📄 Loading and executing master.sql schema...', 'cyan');
  
  const masterSqlPath = path.join(__dirname, 'src', 'migrations', 'master.sql');
  
  if (!fs.existsSync(masterSqlPath)) {
    throw new Error(`Master SQL file not found: ${masterSqlPath}`);
  }
  
  return new Promise((resolve, reject) => {
    const sqlCommand = `psql "${process.env.DATABASE_URL}" -f "${masterSqlPath}"`;
    
    const child = exec(sqlCommand, (error, stdout, stderr) => {
      if (error) {
        log('❌ Schema execution failed:', 'red');
        log(stderr || error.message, 'red');
        reject(error);
        return;
      }
      
      log('✅ Master schema executed successfully', 'green');
      resolve({ stdout, stderr });
    });
    
    // Stream output in real-time for debugging
    child.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    child.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}

function verifySetup() {
  log('🔍 Verifying setup...', 'cyan');
  
  return new Promise((resolve, reject) => {
    const verifyCommand = `psql "${process.env.DATABASE_URL}" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;"`;
    
    exec(verifyCommand, (error, stdout, stderr) => {
      if (error) {
        log('❌ Verification failed:', 'red');
        log(stderr || error.message, 'red');
        reject(error);
        return;
      }
      
      log('✅ Database verification completed', 'green');
      
      // Parse and display tables
      const lines = stdout.split('\n').filter(line => line.trim() && !line.includes('table_name') && !line.includes('---'));
      log(`✅ Tables created: ${lines.length - 2}`, 'green'); // Subtract header lines
      lines.forEach(line => {
        const tableName = line.trim();
        if (tableName && tableName !== '(' && tableName !== ')') {
          log(`   - ${tableName}`, 'cyan');
        }
      });
      
      resolve();
    });
  });
}

function checkUsers() {
  log('👥 Checking created users...', 'cyan');
  
  return new Promise((resolve, reject) => {
    const usersCommand = `psql "${process.env.DATABASE_URL}" -c "SELECT email, role FROM users ORDER BY role;"`;
    
    exec(usersCommand, (error, stdout, stderr) => {
      if (error) {
        log('⚠️  Could not check users:', 'yellow');
        log(stderr || error.message, 'yellow');
        resolve();
        return;
      }
      
      const lines = stdout.split('\n').filter(line => line.includes('@'));
      log(`✅ Users created: ${lines.length}`, 'green');
      lines.forEach(line => {
        const parts = line.split('|');
        if (parts.length >= 2) {
          const email = parts[0].trim();
          const role = parts[1].trim();
          log(`   - ${email} (${role})`, 'cyan');
        }
      });
      
      resolve();
    });
  });
}

async function resetDatabase() {
  try {
    log('🗑️  Starting Database Reset...', 'bright');
    log('===============================', 'bright');
    
    const { databaseName, adminUrl } = checkEnvironmentVariables();
    
    log(`📊 Target Database: ${databaseName}`, 'cyan');
    log(`🔗 Connection: ${process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@')}`, 'cyan');
    
    await testDatabaseConnection();
    await terminateActiveConnections(adminUrl, databaseName);
    await dropDatabase(adminUrl, databaseName);
    await createDatabase(adminUrl, databaseName);
    await executeMasterSql();
    await verifySetup();
    await checkUsers();

    log('\n🎉 Database Reset Completed Successfully!', 'green');
    log('=========================================', 'green');
    log('✅ Database dropped and recreated', 'green');
    log('✅ Complete schema applied', 'green');
    log('✅ Seed data loaded', 'green');
    log('✅ Document tracking system ready', 'green');
    log('\n🔐 Default Login Credentials:', 'cyan');
    log('• admin@ywc.com / admin123', 'yellow');
    log('• coach@ywc.com / coach123', 'yellow');
    log('• client@ywc.com / client123', 'yellow');

  } catch (error) {
    log('\n💥 Database reset failed:', 'red');
    log(error.message, 'red');
    throw error;
  }
}

// Run reset if called directly
if (require.main === module) {
  resetDatabase().catch(error => {
    console.error('💥 Reset failed:', error.message);
    process.exit(1);
  });
}

module.exports = { resetDatabase }; 