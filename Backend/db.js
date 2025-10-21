const mysql = require('mysql2/promise');

const mysqlpool = mysql.createPool({
    host: 'localhost',      
    user: 'root',           
    password: '09022005',
    database: 'restaurant',
    port: 3306             
});

mysqlpool.query('show tables;')
.then((data) => console.log('Database connected:', data))
.catch((err) => console.error('DB connection failed:\n', err));

module.exports = mysqlpool;

// Đang chạy ngoài docker