import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create pool without database first (for initialization)
const createPool = (database = null) => {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
  
  if (database) {
    config.database = database;
  }
  
  return mysql.createPool(config);
};

// Create pool with database
const pool = createPool(process.env.DB_NAME || 'scx_canteen');

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('Connected to MySQL database');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
  });

export default pool;
export { createPool };

