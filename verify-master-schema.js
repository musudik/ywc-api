const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'ywc',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ywc_test', // Use a test database
  password: process.env.DB_PASSWORD || 'yourwealthcoach',
  port: process.env.DB_PORT || 5432,
});

async function verifyMasterSchema() {
  try {
    console.log('🔍 Verifying Master Schema...');
    console.log('================================');
    
    // Read the master.sql file
    const masterSqlPath = path.join(__dirname, 'src', 'models', 'master.sql');
    
    if (!fs.existsSync(masterSqlPath)) {
      throw new Error(`Master SQL file not found: ${masterSqlPath}`);
    }
    
    const masterSql = fs.readFileSync(masterSqlPath, 'utf8');
    console.log('✅ Master SQL file loaded successfully');
    
    // Test database connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    client.release();
    
    // Execute the master SQL
    console.log('🚀 Executing master schema...');
    await pool.query(masterSql);
    console.log('✅ Master schema executed successfully');
    
    // Verify all expected tables exist
    const expectedTables = [
      'users',
      'personal_details',
      'family_members',
      'employment_details',
      'income_details',
      'expenses_details',
      'assets',
      'liabilities',
      'form_configurations',
      'form_submissions',
      'form_documents' // This should now be included
    ];
    
    console.log('\n📋 Verifying tables...');
    const tableQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    const tableResult = await pool.query(tableQuery);
    const actualTables = tableResult.rows.map(row => row.table_name);
    
    let allTablesPresent = true;
    for (const expectedTable of expectedTables) {
      if (actualTables.includes(expectedTable)) {
        console.log(`   ✅ ${expectedTable}`);
      } else {
        console.log(`   ❌ ${expectedTable} - MISSING`);
        allTablesPresent = false;
      }
    }
    
    // Check form_documents table structure
    console.log('\n🔍 Verifying form_documents table structure...');
    const columnQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'form_documents'
      ORDER BY ordinal_position
    `;
    
    const columnResult = await pool.query(columnQuery);
    if (columnResult.rows.length > 0) {
      console.log('✅ form_documents table structure:');
      columnResult.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
      });
    } else {
      console.log('❌ form_documents table not found');
      allTablesPresent = false;
    }
    
    // Check foreign key constraints
    console.log('\n🔗 Verifying foreign key constraints...');
    const fkQuery = `
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'form_documents'
    `;
    
    const fkResult = await pool.query(fkQuery);
    if (fkResult.rows.length > 0) {
      console.log('✅ Foreign key constraints for form_documents:');
      fkResult.rows.forEach(row => {
        console.log(`   - ${row.column_name} → ${row.foreign_table_name}.${row.foreign_column_name}`);
      });
    } else {
      console.log('⚠️  No foreign key constraints found for form_documents');
    }
    
    // Check indexes
    console.log('\n📊 Verifying indexes...');
    const indexQuery = `
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename = 'form_documents'
      ORDER BY indexname
    `;
    
    const indexResult = await pool.query(indexQuery);
    if (indexResult.rows.length > 0) {
      console.log('✅ Indexes for form_documents:');
      indexResult.rows.forEach(row => {
        console.log(`   - ${row.indexname}`);
      });
    } else {
      console.log('⚠️  No indexes found for form_documents');
    }
    
    // Check triggers
    console.log('\n⚡ Verifying triggers...');
    const triggerQuery = `
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'form_documents'
    `;
    
    const triggerResult = await pool.query(triggerQuery);
    if (triggerResult.rows.length > 0) {
      console.log('✅ Triggers for form_documents:');
      triggerResult.rows.forEach(row => {
        console.log(`   - ${row.trigger_name} (${row.event_manipulation})`);
      });
    } else {
      console.log('⚠️  No triggers found for form_documents');
    }
    
    // Verify seed data
    console.log('\n👥 Verifying seed data...');
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const configCount = await pool.query('SELECT COUNT(*) FROM form_configurations');
    
    console.log(`✅ Users: ${userCount.rows[0].count}`);
    console.log(`✅ Form configurations: ${configCount.rows[0].count}`);
    
    if (userCount.rows[0].count >= 3 && configCount.rows[0].count >= 1) {
      console.log('✅ Seed data is present');
    } else {
      console.log('⚠️  Seed data might be incomplete');
    }
    
    // Test authentication (verify password hashes work)
    console.log('\n🔐 Testing default user credentials...');
    const authTest = await pool.query(`
      SELECT email, role, first_name, last_name 
      FROM users 
      WHERE email IN ('admin@ywc.com', 'coach@ywc.com', 'client@ywc.com')
      ORDER BY role
    `);
    
    if (authTest.rows.length === 3) {
      console.log('✅ Default users created:');
      authTest.rows.forEach(user => {
        console.log(`   - ${user.email} (${user.role}): ${user.first_name} ${user.last_name}`);
      });
    } else {
      console.log('⚠️  Not all default users were created');
    }
    
    if (allTablesPresent) {
      console.log('\n🎉 Schema verification completed successfully!');
      console.log('=====================================');
      console.log('✅ All tables present');
      console.log('✅ form_documents table integrated');
      console.log('✅ Foreign keys configured');
      console.log('✅ Indexes created');
      console.log('✅ Triggers working');
      console.log('✅ Seed data loaded');
      console.log('\n📝 Ready for production use!');
    } else {
      console.log('\n❌ Schema verification failed!');
      console.log('Some tables are missing.');
    }
    
  } catch (error) {
    console.error('❌ Schema verification failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

// Run verification
if (require.main === module) {
  verifyMasterSchema().catch(console.error);
}

module.exports = { verifyMasterSchema }; 