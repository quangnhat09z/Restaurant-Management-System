const mysql = require('mysql2/promise');
const env = require('../../Backend/environment');
(async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: env.DB_PASSWORD,
    database: 'restaurant_user',
  });

  const batchSize = 10000; // số user chèn 1 lần
  const total = 100000; // 1 tram nghin user =)))

  for (let i = 1; i <= total; i += batchSize) {
    const values = [];
    for (let j = i; j < i + batchSize && j <= total; j++) {
      values.push([
        `User${j}`,
        `user${j}@example.com`,
        `090${String(j).padStart(7, '0')}`,
        'password123',
        `Address ${j}`,
        'user',
        true,
      ]);
    }

    const sql = `INSERT INTO user (userName, email, contactNumber, password, address, role, isActive)
                 VALUES ?`;
    await connection.query(sql, [values]);
    console.log(`Inserted ${Math.min(i + batchSize - 1, total)} users`);
  }

  await connection.end();
})();
