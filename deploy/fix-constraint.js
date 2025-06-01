const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ywc',
  user: process.env.DB_USER || 'ywc',
  password: process.env.DB_PASSWORD || 'yourwealthcoach',
});

async function fixConstraint() {
  try {
    console.log('🔧 Fixing applicantconfig constraint...');
    
    // Drop existing constraint
    await pool.query('ALTER TABLE form_configurations DROP CONSTRAINT IF EXISTS chk_applicantconfig_valid');
    
    // Add updated constraint with more values
    await pool.query(`
      ALTER TABLE form_configurations 
      ADD CONSTRAINT chk_applicantconfig_valid 
      CHECK (applicantconfig IN (
        'single', 'joint', 'family', 'business', 'individual', 'multiple',
        'dual-primary-secondary', 'dual', 'primary-secondary', 'couple',
        'married-joint', 'partners', 'co-applicants'
      ))
    `);
    
    console.log('✅ Constraint updated successfully!');
    console.log('💡 Now supports values: single, joint, family, business, individual, multiple, dual-primary-secondary, dual, primary-secondary, couple, married-joint, partners, co-applicants');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixConstraint(); 