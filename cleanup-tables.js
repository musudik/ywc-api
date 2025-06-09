const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'ywc',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ywc',
  password: process.env.DB_PASSWORD || 'yourwealthcoach',
  port: process.env.DB_PORT || 5432,
});

async function cleanupTables() {
  try {
    console.log('🧹 Starting Table Cleanup...');
    console.log('============================');

    // Step 1: Get all tables in the public schema
    console.log('\n📋 Discovering existing tables...');
    const tableResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    if (tableResult.rows.length === 0) {
      console.log('ℹ️  No tables found to clean');
    } else {
      console.log(`Found ${tableResult.rows.length} tables:`);
      tableResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });

      // Step 2: Drop all tables with CASCADE to handle foreign keys
      console.log('\n🗑️  Dropping all tables...');
      for (const row of tableResult.rows) {
        try {
          await pool.query(`DROP TABLE IF EXISTS "${row.table_name}" CASCADE`);
          console.log(`   ✅ Dropped ${row.table_name}`);
        } catch (error) {
          console.log(`   ⚠️  Failed to drop ${row.table_name}: ${error.message}`);
        }
      }
    }

    // Step 3: Drop all functions/triggers that might exist
    console.log('\n🔧 Cleaning up functions and triggers...');
    try {
      await pool.query('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE');
      await pool.query('DROP FUNCTION IF EXISTS update_form_documents_updated_at() CASCADE');
      console.log('✅ Functions cleaned up');
    } catch (error) {
      console.log('⚠️  Some functions may not have existed');
    }

    // Step 4: Drop extensions if needed (optional)
    console.log('\n🔌 Checking extensions...');
    const extResult = await pool.query(`
      SELECT extname FROM pg_extension WHERE extname = 'uuid-ossp'
    `);
    
    if (extResult.rows.length > 0) {
      console.log('ℹ️  UUID extension exists (keeping it)');
    } else {
      console.log('ℹ️  UUID extension not found');
    }

    // Step 5: Execute master.sql
    console.log('\n📄 Loading master.sql schema...');
    const masterSqlPath = path.join(__dirname, 'src', 'models', 'master.sql');
    
    if (!fs.existsSync(masterSqlPath)) {
      throw new Error(`Master SQL file not found: ${masterSqlPath}`);
    }
    
    const masterSql = fs.readFileSync(masterSqlPath, 'utf8');
    console.log('✅ Master SQL loaded');

    console.log('\n🚀 Executing master schema...');
    await pool.query(masterSql);
    console.log('✅ Master schema executed successfully');

    // Step 6: Verify new setup
    console.log('\n🔍 Verifying new setup...');
    
    const newTableResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`✅ Tables recreated: ${newTableResult.rows.length}`);
    newTableResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Verify users
    const userResult = await pool.query('SELECT email, role FROM users ORDER BY role');
    console.log(`\n✅ Users: ${userResult.rows.length}`);
    userResult.rows.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    console.log('\n🎉 Table Cleanup Completed Successfully!');
    console.log('=======================================');
    console.log('✅ All tables dropped and recreated');
    console.log('✅ Schema applied fresh');
    console.log('✅ Seed data reloaded');
    console.log('✅ Ready for fresh start');

  } catch (error) {
    console.error('\n❌ Table cleanup failed:', error.message);
    console.error('Full error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupTables().catch(error => {
    console.error('💥 Cleanup failed:', error.message);
    process.exit(1);
  });
}

module.exports = { cleanupTables }; 