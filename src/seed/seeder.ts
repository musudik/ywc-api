// Comprehensive Database Seeder for YWC Financial Forms API
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  log('❌ Missing required environment variables:', 'red');
  log(`   Missing: ${missingEnvVars.join(', ')}`, 'red');
  log('💡 Please set these environment variables before running the seed script', 'yellow');
  log('💡 Example: npm run seed', 'yellow');
  process.exit(1);
}

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 15000,
  max: 5, // Limited pool for seeding
};

const pool = new Pool(dbConfig);

interface User {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'COACH' | 'CLIENT' | 'GUEST';
  coach_id?: string;
}

async function resetTables(): Promise<void> {
  log('🗑️  Resetting database tables...', 'cyan');
  
  const client = await pool.connect();
  
  try {
    // Clear tables in proper order (considering foreign key constraints)
    const tablesToClear = [
      'form_documents',
      'form_submissions',
      'form_configurations',
      'liabilities',
      'assets',
      'expenses_details',
      'income_details',
      'employment_details',
      'family_members',
      'personal_details',
      'users'
    ];

    for (const table of tablesToClear) {
      try {
        await client.query(`DELETE FROM ${table}`);
        log(`   ✓ Cleared ${table}`, 'green');
      } catch (error: any) {
        if (error.message.includes('does not exist')) {
          log(`   ⚠️  Table ${table} does not exist, skipping`, 'yellow');
        } else {
          log(`   ❌ Failed to clear ${table}: ${error.message}`, 'red');
        }
      }
    }
    
    log('✅ Database tables reset completed', 'green');
  } finally {
    client.release();
  }
}

async function seedUsers(): Promise<void> {
  log('👥 Seeding users...', 'cyan');
  
  const client = await pool.connect();
  
  try {
    // Hash the default password (all users use same password for simplicity)
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const hashedPasswordCoach = await bcrypt.hash('coach123', 10);
    const hashedPasswordClient = await bcrypt.hash('client123', 10);
    log('🔐 Password hashed successfully', 'green');

    // Define users to seed with fixed UUIDs for consistency
    const users: User[] = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'admin@ywc.com',
        password: hashedPassword,
        first_name: 'System',
        last_name: 'Admin',
        role: 'ADMIN'
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'coach@ywc.com',
        password: hashedPasswordCoach,
        first_name: 'Default',
        last_name: 'Coach',
        role: 'COACH'
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'client@ywc.com',
        password: hashedPasswordClient,
        first_name: 'Test',
        last_name: 'Client',
        role: 'CLIENT'
      }
    ];

    // Insert users
    for (const user of users) {
      await client.query(`
        INSERT INTO users (id, email, password, first_name, last_name, role, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (email) DO UPDATE SET
          password = EXCLUDED.password,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          role = EXCLUDED.role,
          updated_at = CURRENT_TIMESTAMP
      `, [user.id, user.email, user.password, user.first_name, user.last_name, user.role]);
      
      log(`   ✓ Created user: ${user.email} (${user.role})`, 'green');
    }

    // Set coach-client relationship
    log('🔗 Setting coach-client relationship...', 'cyan');
    await client.query(`
      UPDATE users 
      SET coach_id = '22222222-2222-2222-2222-222222222222' 
      WHERE email = 'client@ywc.com'
    `);
    log('   ✓ Client assigned to coach', 'green');

  } finally {
    client.release();
  }
}

async function seedFormConfigurations(): Promise<void> {
  log('📋 Seeding form configurations...', 'cyan');
  
  const client = await pool.connect();
  
  try {
    // Sample form configuration for testing
    const formConfig = {
      id: '44444444-4444-4444-4444-444444444444',
      config_id: 'sample_financial_form_1748618592.017441',
      created_by_id: '22222222-2222-2222-2222-222222222222', // Coach ID
      name: 'Sample Financial Form',
      form_type: 'financial_assessment',
      description: 'Default financial assessment form for testing document uploads',
      applicantconfig: 'single'
    };

    await client.query(`
      INSERT INTO form_configurations (id, config_id, created_by_id, name, form_type, description, applicantconfig, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (config_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP
    `, [
      formConfig.id,
      formConfig.config_id,
      formConfig.created_by_id,
      formConfig.name,
      formConfig.form_type,
      formConfig.description,
      formConfig.applicantconfig
    ]);
    
    log(`   ✓ Created form configuration: ${formConfig.name}`, 'green');
  } finally {
    client.release();
  }
}

async function verifySeeding(): Promise<void> {
  log('🔍 Verifying seeded data...', 'cyan');
  
  const client = await pool.connect();
  
  try {
    // Check users
    const userResult = await client.query(`
      SELECT email, role, first_name, last_name, coach_id 
      FROM users 
      ORDER BY role, email
    `);
    
    log('\n📋 Seeded users:', 'bright');
    userResult.rows.forEach(user => {
      const coachInfo = user.coach_id ? ` (Coach: ${user.coach_id})` : '';
      log(`   - ${user.email} (${user.role}) - ${user.first_name} ${user.last_name}${coachInfo}`, 'cyan');
    });

    // Check form configurations
    const configResult = await client.query('SELECT config_id, name, form_type FROM form_configurations');
    log('\n📋 Seeded form configurations:', 'bright');
    configResult.rows.forEach(config => {
      log(`   - ${config.config_id}: ${config.name} (${config.form_type})`, 'cyan');
    });

    log(`\n📊 Total users: ${userResult.rows.length}`, 'bright');
    log(`📊 Total form configurations: ${configResult.rows.length}`, 'bright');
    
  } finally {
    client.release();
  }
}

const seedData = async (reset: boolean = false): Promise<void> => {
  try {
    log('🌱 Starting comprehensive database seeding...', 'bright');
    log('===============================================', 'bright');
    log(`📊 Database: ${dbConfig.database}`, 'cyan');
    log(`🏠 Host: ${dbConfig.host}:${dbConfig.port}`, 'cyan');

    // Test connection
    const client = await pool.connect();
    log('✅ Database connected successfully', 'green');
    client.release();

    // Reset tables if requested
    if (reset) {
      await resetTables();
    }
    
    // Seed data
    await seedUsers();
    await seedFormConfigurations();
    
    // Verify seeding
    await verifySeeding();
    
    log('\n🎉 Database seeding completed successfully!', 'green');
    log('===========================================', 'green');
    log('\n🔐 Default login credentials:', 'bright');
    log('• admin@ywc.com / admin123 (ADMIN)', 'yellow');
    log('• coach@ywc.com / admin123 (COACH)', 'yellow');
    log('• client@ywc.com / admin123 (CLIENT)', 'yellow');
    log('\nNote: All users use the same password for development', 'yellow');
    
  } catch (error: any) {
    log('\n❌ Seeding error:', 'red');
    log(error.message, 'red');
    throw error;
  } finally {
    await pool.end();
  }
};

// Run seeder if this file is executed directly
if (require.main === module) {
  // Check for --reset flag
  const shouldReset = process.argv.includes('--reset');
  
  seedData(shouldReset)
    .then(() => {
      log('\n✅ Seeding process completed successfully', 'green');
      process.exit(0);
    })
    .catch((error) => {
      log('\n💥 Seeding process failed:', 'red');
      log(error.message, 'red');
      process.exit(1);
    });
}

export default seedData; 