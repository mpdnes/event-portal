import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'pd_portal',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err: any) => {
  console.error('⚠️  Database connection error:', err.code, err.message);
  if (err.code === 'ECONNREFUSED') {
    console.error('   → Cannot connect to PostgreSQL at', `${process.env.DB_HOST}:${process.env.DB_PORT}`);
  } else if (err.code === '3D000') {
    console.error('   → Database "' + process.env.DB_NAME + '" does not exist');
  } else if (err.code === '28P01') {
    console.error('   → Authentication failed for user "' + process.env.DB_USER + '"');
  }
  // Don't exit - allow server to start for development
});

export default pool;
