#!/usr/bin/env node

/**
 * YWC Financial Forms Database Setup Script
 * 
 * This script automatically sets up the database using the master.sql file.
 * It reads environment variables for database connection and executes the schema.
 */

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

function checkPrerequisites() {
  log('\n🔍 Checking prerequisites...', 'cyan');
  
  // Check if psql is available
  return new Promise((resolve, reject) => {
    exec('psql --version', (error, stdout, stderr) => {
      if (error) {
        log('❌ PostgreSQL psql not found. Please install PostgreSQL.', 'red');
        reject(error);
        return;
      }
      log(`✅ PostgreSQL found: ${stdout.trim()}`, 'green');
      resolve();
    });
  });
}

function checkEnvironmentVariables() {
  log('\n🔧 Checking environment variables...', 'cyan');
  
  const requiredVars = ['DATABASE_URL'];
  const optionalVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  
  let hasError = false;
  
  if (!process.env.DATABASE_URL) {
    // Check if individual components are provided
    const individualVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    const missingVars = individualVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      log('❌ Missing required environment variables:', 'red');
      log(`   Either provide DATABASE_URL or all of: ${individualVars.join(', ')}`, 'yellow');
      log(`   Missing: ${missingVars.join(', ')}`, 'red');
      hasError = true;
    } else {
      const dbHost = process.env.DB_HOST || 'localhost';
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
  
  if (hasError) {
    log('\n💡 Create a .env file with:', 'yellow');
    log('DATABASE_URL="postgresql://username:password@localhost:5432/database_name"', 'yellow');
    log('or individual components:', 'yellow');
    log('DB_HOST=localhost', 'yellow');
    log('DB_PORT=5432', 'yellow');
    log('DB_NAME=ywc_financial_forms', 'yellow');
    log('DB_USER=your_username', 'yellow');
    log('DB_PASSWORD=your_password', 'yellow');
    process.exit(1);
  }
}

function checkMasterSqlFile() {
  log('\n📄 Checking master.sql file...', 'cyan');
  
  const masterSqlPath = path.join(__dirname, 'src', 'models', 'master.sql');
  
  if (!fs.existsSync(masterSqlPath)) {
    log('❌ master.sql file not found at: ' + masterSqlPath, 'red');
    process.exit(1);
  }
  
  log('✅ master.sql file found', 'green');
  return masterSqlPath;
}

function testDatabaseConnection() {
  log('\n🔌 Testing database connection...', 'cyan');
  
  return new Promise((resolve, reject) => {
    const testCommand = `psql "${process.env.DATABASE_URL}" -c "SELECT version();"`;
    
    exec(testCommand, (error, stdout, stderr) => {
      if (error) {
        log('❌ Database connection failed:', 'red');
        log(stderr || error.message, 'red');
        log('\n💡 Make sure:', 'yellow');
        log('1. PostgreSQL is running', 'yellow');
        log('2. Database exists', 'yellow');
        log('3. User has correct permissions', 'yellow');
        log('4. Connection string is correct', 'yellow');
        reject(error);
        return;
      }
      
      log('✅ Database connection successful', 'green');
      resolve();
    });
  });
}

function executeMasterSql(masterSqlPath) {
  log('\n🚀 Executing master.sql schema...', 'cyan');
  log('This will create tables, indexes, triggers, and seed data...', 'yellow');
  
  return new Promise((resolve, reject) => {
    const sqlCommand = `psql "${process.env.DATABASE_URL}" -f "${masterSqlPath}"`;
    
    const child = exec(sqlCommand, (error, stdout, stderr) => {
      if (error) {
        log('❌ Schema execution failed:', 'red');
        log(stderr || error.message, 'red');
        reject(error);
        return;
      }
      
      resolve({ stdout, stderr });
    });
    
    // Stream output in real-time
    child.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    child.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}

function verifySetup() {
  log('\n✅ Verifying database setup...', 'cyan');
  
  return new Promise((resolve, reject) => {
    const verifyCommand = `psql "${process.env.DATABASE_URL}" -c "SELECT count(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';"`;
    
    exec(verifyCommand, (error, stdout, stderr) => {
      if (error) {
        log('❌ Verification failed:', 'red');
        log(stderr || error.message, 'red');
        reject(error);
        return;
      }
      
      log('✅ Database verification completed', 'green');
      log(stdout, 'cyan');
      resolve();
    });
  });
}

async function main() {
  try {
    log('🎯 YWC Financial Forms Database Setup', 'bright');
    log('=====================================', 'bright');
    
    await checkPrerequisites();
    checkEnvironmentVariables();
    const masterSqlPath = checkMasterSqlFile();
    await testDatabaseConnection();
    await executeMasterSql(masterSqlPath);
    await verifySetup();
    
    log('\n🎉 Database setup completed successfully!', 'green');
    log('=====================================', 'green');
    log('\n📋 What was created:', 'cyan');
    log('• Complete database schema', 'green');
    log('• Performance indexes', 'green');
    log('• Auto-update triggers', 'green');
    log('• Sample seed data', 'green');
    log('• Default users (admin, coach, client)', 'green');
    
    log('\n🔐 Default login credentials:', 'cyan');
    log('• Admin: admin@ywc.com / admin123', 'yellow');
    log('• Coach: coach@ywc.com / coach123', 'yellow');
    log('• Client: client@ywc.com / client123', 'yellow');
    
    log('\n🚀 Next steps:', 'cyan');
    log('1. Start your API server: npm start', 'yellow');
    log('2. Test the connection: curl http://localhost:3000/health', 'yellow');
    log('3. Import Postman collection from src/postman/', 'yellow');
    log('4. Run API tests: node test_complete_api.js', 'yellow');
    
  } catch (error) {
    log('\n💥 Setup failed:', 'red');
    log(error.message, 'red');
    log('\n📖 For help, check:', 'yellow');
    log('• src/models/README.md', 'yellow');
    log('• API_DOCUMENTATION.md', 'yellow');
    process.exit(1);
  }
}

// Handle script arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log('YWC Financial Forms Database Setup Script', 'bright');
  log('', 'reset');
  log('Usage: node setup-database.js [options]', 'cyan');
  log('', 'reset');
  log('Options:', 'yellow');
  log('  --help, -h     Show this help message', 'yellow');
  log('  --force        Skip confirmation prompts', 'yellow');
  log('', 'reset');
  log('Environment Variables:', 'yellow');
  log('  DATABASE_URL   Complete PostgreSQL connection string', 'yellow');
  log('  DB_HOST        Database host (default: localhost)', 'yellow');
  log('  DB_PORT        Database port (default: 5432)', 'yellow');
  log('  DB_NAME        Database name', 'yellow');
  log('  DB_USER        Database username', 'yellow');
  log('  DB_PASSWORD    Database password', 'yellow');
  log('', 'reset');
  log('Examples:', 'cyan');
  log('  node setup-database.js', 'cyan');
  log('  DATABASE_URL="postgresql://user:pass@localhost/db" node setup-database.js', 'cyan');
  process.exit(0);
}

// Run the setup
main(); 