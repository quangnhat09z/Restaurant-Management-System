// services/menu-service/src/database/db.js
// ===================================
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '09022005',
  database: process.env.DB_NAME || 'restaurant_menu',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Dung async, await de cho vi du trong truong hop bang co nhieu du lieu
// can nhieu thoi gian de truy van.
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');

    const [tables] = await pool.query('SHOW TABLES;');
    console.log('📋 Tables:', tables);

    connection.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
})();

module.exports = pool;
