const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'ywc',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ywc',
  password: process.env.DB_PASSWORD || 'yourwealthcoach',
  port: process.env.DB_PORT || 5432,
};

// Admin connection (to drop/create database)
const adminConfig = {
  ...dbConfig,
  database: 'postgres' // Connect to postgres database to manage other databases
};

async function resetDatabase() {
  const adminPool = new Pool(adminConfig);
  let targetPool = null;

  try {
    console.log('🗑️  Starting Database Reset...');
    console.log('===============================');
    console.log(`📊 Target Database: ${dbConfig.database}`);
    console.log(`🏠 Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`👤 User: ${dbConfig.user}`);

    // Step 1: Terminate active connections
    console.log('\n🔌 Terminating active connections...');
    await adminPool.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = $1 AND pid <> pg_backend_pid()
    `, [dbConfig.database]);
    console.log('✅ Active connections terminated');

    // Step 2: Drop the database
    console.log('\n🗑️  Dropping existing database...');
    try {
      await adminPool.query(`DROP DATABASE IF EXISTS "${dbConfig.database}"`);
      console.log('✅ Database dropped successfully');
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('ℹ️  Database did not exist');
      } else {
        throw error;
      }
    }

    // Step 3: Create fresh database
    console.log('\n🏗️  Creating fresh database...');
    await adminPool.query(`CREATE DATABASE "${dbConfig.database}" OWNER "${dbConfig.user}"`);
    console.log('✅ Fresh database created');

    // Step 4: Connect to the new database
    console.log('\n🔗 Connecting to fresh database...');
    targetPool = new Pool(dbConfig);
    const client = await targetPool.connect();
    console.log('✅ Connected to fresh database');
    client.release();

    // Step 5: Read and execute master.sql
    console.log('\n📄 Loading master.sql schema...');
    const masterSqlPath = path.join(__dirname, 'src', 'models', 'master.sql');
    
    if (!fs.existsSync(masterSqlPath)) {
      throw new Error(`Master SQL file not found: ${masterSqlPath}`);
    }
    
    const masterSql = fs.readFileSync(masterSqlPath, 'utf8');
    console.log('✅ Master SQL loaded');

    console.log('\n🚀 Executing master schema...');
    await targetPool.query(masterSql);
    console.log('✅ Master schema executed successfully');

    // Step 6: Verify setup
    console.log('\n🔍 Verifying setup...');
    
    // Check tables
    const tableResult = await targetPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`✅ Tables created: ${tableResult.rows.length}`);
    tableResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Check users
    const userResult = await targetPool.query('SELECT email, role FROM users ORDER BY role');
    console.log(`\n✅ Users created: ${userResult.rows.length}`);
    userResult.rows.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    // Check form configurations
    const configResult = await targetPool.query('SELECT config_id, name FROM form_configurations');
    console.log(`\n✅ Form configurations: ${configResult.rows.length}`);
    configResult.rows.forEach(config => {
      console.log(`   - ${config.config_id}: ${config.name}`);
    });

    console.log('\n🎉 Database Reset Completed Successfully!');
    console.log('=========================================');
    console.log('✅ Database dropped and recreated');
    console.log('✅ Complete schema applied');
    console.log('✅ Seed data loaded');
    console.log('✅ Document tracking system ready');
    console.log('\n🔐 Default Login Credentials:');
    console.log('• admin@ywc.com / admin123');
    console.log('• coach@ywc.com / coach123');
    console.log('• client@ywc.com / client123');

  } catch (error) {
    console.error('\n❌ Database reset failed:', error.message);
    console.error('Full error:', error);
    throw error;
  } finally {
    if (adminPool) await adminPool.end();
    if (targetPool) await targetPool.end();
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