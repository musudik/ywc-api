const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ywc',
  user: process.env.DB_USER || 'ywc',
  password: process.env.DB_PASSWORD || 'yourwealthcoach',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(dbConfig);

async function setupDatabase() {
  try {
    console.log('🗄️  Setting up YWC Database...');
    console.log(`📊 Connecting to database: ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`);
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    client.release();
    
    // Read master.sql file
    const masterSqlPath = path.join(__dirname, '..', 'src', 'models', 'master.sql');
    
    if (!fs.existsSync(masterSqlPath)) {
      throw new Error(`Master SQL file not found: ${masterSqlPath}`);
    }
    
    const masterSql = fs.readFileSync(masterSqlPath, 'utf8');
    console.log('📄 Master SQL file loaded successfully');
    
    // Execute the master SQL
    console.log('🚀 Executing database schema...');
    await pool.query(masterSql);
    console.log('✅ Database schema created successfully');
    
    // Update applicantconfig constraint to include more values
    console.log('🔧 Updating applicantconfig constraint...');
    try {
      await pool.query('ALTER TABLE form_configurations DROP CONSTRAINT IF EXISTS chk_applicantconfig_valid');
      await pool.query(`
        ALTER TABLE form_configurations 
        ADD CONSTRAINT chk_applicantconfig_valid 
        CHECK (applicantconfig IN (
          'single', 'joint', 'family', 'business', 'individual', 'multiple',
          'dual-primary-secondary', 'dual', 'primary-secondary', 'couple',
          'married-joint', 'partners', 'co-applicants'
        ))
      `);
      console.log('✅ Applicantconfig constraint updated with extended values');
    } catch (error) {
      console.log('⚠️  Constraint update warning:', error.message);
    }
    
    // Verify table creation
    console.log('🔍 Verifying database setup...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Created tables:');
    tables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    // Verify indexes
    const indexes = await pool.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname NOT LIKE '%_pkey'
      ORDER BY tablename, indexname
    `);
    
    console.log('📊 Created indexes:');
    indexes.rows.forEach(row => {
      console.log(`  ✓ ${row.tablename}.${row.indexname}`);
    });
    
    // Test basic operations
    console.log('🧪 Testing basic operations...');
    
    // Test users table
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`  ✓ Users table: ${userCount.rows[0].count} records`);
    
    // Test form_configurations table
    const configCount = await pool.query('SELECT COUNT(*) FROM form_configurations');
    console.log(`  ✓ Form configurations table: ${configCount.rows[0].count} records`);
    
    // Test form_submissions table
    const submissionCount = await pool.query('SELECT COUNT(*) FROM form_submissions');
    console.log(`  ✓ Form submissions table: ${submissionCount.rows[0].count} records`);
    
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('📝 Database Information:');
    console.log(`  Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`  Database: ${dbConfig.database}`);
    console.log(`  User: ${dbConfig.user}`);
    console.log(`  Tables: ${tables.rows.length}`);
    console.log(`  Indexes: ${indexes.rows.length}`);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    if (error.detail) {
      console.error(`   Detail: ${error.detail}`);
    }
    throw error;
  } finally {
    await pool.end();
  }
}

// Handle command line execution
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✨ Database setup script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup script failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase }; 