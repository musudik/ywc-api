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

async function runMigration() {
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add_form_documents_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Starting form_documents table migration...');
    
    // Execute the migration
    await pool.query(sql);
    
    console.log('✅ Form documents table migration completed successfully!');
    console.log('Created:');
    console.log('- form_documents table');
    console.log('- Foreign key constraint to form_submissions');
    console.log('- Performance indexes');
    console.log('- Updated_at trigger');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration(); 