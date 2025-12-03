const mysql = require('mysql2/promise');
const env = require('../../Backend/environment');
const bcrypt = require('bcrypt');
(async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: env.DB_PASSWORD,
    database: 'restaurant_user',
  });

  const batchSize = 500; // số user chèn 1 lần
  const total = 10000; // 1  nghin user =)))
  const plainPassword = 'password1@';

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  for (let i = 1; i <= total; i += batchSize) {
    const values = [];
    for (let j = i; j < i + batchSize && j <= total; j++) {
      values.push([
        `User${j}`,
        `user${j}@example.com`,
        `090${String(j).padStart(7, '0')}`,
        hashedPassword,
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
