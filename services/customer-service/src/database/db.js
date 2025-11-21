// services/user-service/src/database/db.js
const mysql = require('mysql2/promise');
const env = require('../../../../Backend/environment.js');
const database = 'restaurant_user';

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ User DB connected successfully');
    const [tables] = await pool.query('SHOW TABLES;');
    console.log('📋 Tables:', tables);
    connection.release();
  } catch (err) {
    console.error('❌ User DB connection failed:', err.message);
    process.exit(1);
  }
})();
module.exports = pool;
