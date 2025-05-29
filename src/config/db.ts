import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection configuration
const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ywc',
  user: process.env.DB_USER || 'ywc',
  password: process.env.DB_PASSWORD || 'yourwealthcoach',
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
};

// Create PostgreSQL connection pool
const pool = new Pool(dbConfig);

// Database connection function
const connectDB = async (): Promise<void> => {
  try {
    // Test the connection
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully');
    console.log(`📊 Database: ${dbConfig.database}`);
    console.log(`🏠 Host: ${dbConfig.host}:${dbConfig.port}`);
    
    // Release the client back to pool
    client.release();
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Export pool for use in services
export { pool };
export default connectDB; 