// services/order-service/src/database/db.js
// ===================================
const mysql = require('mysql2/promise');

const env = require('../../../../Backend/environment.js');
const database = 'restaurant_orders';
console.log('devUser :', env.DB_HOST);


const pool = mysql.createPool({
  host: env.DB_HOST ,
  port: env.DB_PORT ,
  user: env.DB_USER ,
  password: env.DB_PASSWORD,
  database: database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test connection
pool
  .getConnection()
  .then((connection) => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

module.exports = pool;
``