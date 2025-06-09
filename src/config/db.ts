import { Pool, PoolConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('💡 Please set these environment variables before starting the application');
  process.exit(1);
}

// PostgreSQL connection configuration (optimized for Neon)
const dbConfig: PoolConfig = {
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  max: 10, // maximum number of clients in the pool (reduced for Neon)
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 15000, // increased timeout for Neon cold starts (15 seconds)
  ssl: {
    rejectUnauthorized: false,
  },
};

// Create PostgreSQL connection pool
const pool = new Pool(dbConfig);

// Database connection function
const connectDB = async (): Promise<void> => {
  try {
    // Test the connection
    const client = await pool.connect();
    console.log("✅ PostgreSQL connected successfully");
    console.log(`📊 Database: ${dbConfig.database}`);
    console.log(`🏠 Host: ${dbConfig.host}:${dbConfig.port}`);

    // Release the client back to pool
    client.release();
  } catch (error) {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  }
};

// Export pool for use in services
export { pool };
export default connectDB;
