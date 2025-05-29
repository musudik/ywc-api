// Database seeder for PostgreSQL with roles and users
import { pool } from '../config/db';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const seedData = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Create roles first
    await seedRoles();
    
    // Create users
    await seedUsers();
    
    console.log('✅ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

const seedRoles = async (): Promise<void> => {
  console.log('📋 Seeding roles...');
  
  const roles = [
    {
      name: 'ADMIN',
      description: 'Administrator with full access',
      permissions: [
        'MANAGE_USERS',
        'CREATE_COACHES',
        'MANAGE_ROLES',
        'MANAGE_CLIENTS',
        'MANAGE_COACHES',
        'MANAGE_CONTENT',
        'VIEW_REPORTS'
      ]
    },
    {
      name: 'COACH',
      description: 'Financial coach who manages clients',
      permissions: [
        'CREATE_CLIENTS',
        'MANAGE_OWN_CLIENTS',
        'VIEW_CLIENT_DATA',
        'CREATE_REPORTS'
      ]
    },
    {
      name: 'CLIENT',
      description: 'End user of the platform',
      permissions: [
        'VIEW_OWN_DATA',
        'UPDATE_PROFILE',
        'REQUEST_SERVICES'
      ]
    },
    {
      name: 'GUEST',
      description: 'Unregistered or limited access user',
      permissions: [
        'VIEW_PUBLIC_CONTENT'
      ]
    }
  ];

  for (const role of roles) {
    const checkQuery = 'SELECT id FROM roles WHERE name = $1';
    const existingRole = await pool.query(checkQuery, [role.name]);
    
    if (existingRole.rows.length === 0) {
      const insertQuery = `
        INSERT INTO roles (id, name, description, permissions)
        VALUES ($1, $2, $3, $4)
      `;
      
      await pool.query(insertQuery, [
        uuidv4(),
        role.name,
        role.description,
        role.permissions
      ]);
      
      console.log(`   ✓ Created role: ${role.name}`);
    } else {
      console.log(`   → Role already exists: ${role.name}`);
    }
  }
};

const seedUsers = async (): Promise<void> => {
  console.log('👥 Seeding users...');
  
  const users = [
    {
      email: 'admin@ywc.com',
      password: 'admin123',
      first_name: 'System',
      last_name: 'Administrator',
      role: 'ADMIN'
    },
    {
      email: 'coach@ywc.com',
      password: 'coach123',
      first_name: 'John',
      last_name: 'Coach',
      role: 'COACH'
    },
    {
      email: 'client@ywc.com',
      password: 'client123',
      first_name: 'Jane',
      last_name: 'Client',
      role: 'CLIENT'
    }
  ];

  for (const user of users) {
    const checkQuery = 'SELECT id FROM users WHERE email = $1';
    const existingUser = await pool.query(checkQuery, [user.email]);
    
    if (existingUser.rows.length === 0) {
      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      const insertQuery = `
        INSERT INTO users (id, email, password, first_name, last_name, role, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      
      await pool.query(insertQuery, [
        uuidv4(),
        user.email,
        hashedPassword,
        user.first_name,
        user.last_name,
        user.role,
        true
      ]);
      
      console.log(`   ✓ Created user: ${user.email} (${user.role})`);
    } else {
      console.log(`   → User already exists: ${user.email}`);
    }
  }
};

// Run seeder if this file is executed directly
if (require.main === module) {
  seedData();
}

export default seedData; 