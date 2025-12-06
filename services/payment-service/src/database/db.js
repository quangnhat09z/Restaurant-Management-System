const mysql = require('mysql2/promise');
const path = require('path');

// Load .env từ backend root
require('dotenv').config({ path: path.join(__dirname, '../../../../.env') });

// Xác định config database dựa trên DEV_USER
const DEV_USER = process.env.DEV_USER || 'THANG';

const dbConfig = {
  host: process.env[`DB_HOST_${DEV_USER}`] || 'localhost',
  user: process.env[`DB_USER_${DEV_USER}`] || 'root',
  password: process.env[`DB_PASSWORD_${DEV_USER}`] || '',
  database: 'restaurant',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log(`📊 Payment Service connecting to DB as: ${DEV_USER}`);
console.log(`🔗 DB Host: ${dbConfig.host}:${dbConfig.port}`);

const pool = mysql.createPool(dbConfig);

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Payment Service DB connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Payment Service DB connection failed:', err.message);
  });

module.exports = pool;