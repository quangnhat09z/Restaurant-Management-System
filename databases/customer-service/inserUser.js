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
  const total = 10000; // 10k user
  const plainPassword = 'password1@';

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  console.log('🔄 [INSERT] Starting to insert users into user_write...');

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

    const sql = `INSERT INTO user_write (userName, email, contactNumber, password, address, role, isActive)
                 VALUES ?`;
    await connection.query(sql, [values]);
    const inserted = Math.min(i + batchSize - 1, total);
    console.log(`✅ Inserted ${inserted} users into user_write`);
  }

  console.log('\n🔄 [SYNC] Syncing data from user_write to user_read...');

  // Sync từ write sang read
  const syncSql = `
    INSERT INTO user_read (userID, userName, email, contactNumber, address, role, isActive, createdAt, updatedAt)
    SELECT userID, userName, email, contactNumber, address, role, isActive, createdAt, updatedAt
    FROM user_write
  `;
  await connection.query(syncSql);
  console.log(`✅ Synced ${total} users from user_write to user_read`);

  console.log('\n🔄 [ADMIN] Setting user 1 as admin...');
  await connection.query(
    `UPDATE user_write SET role = 'admin' WHERE userID = 1`
  );
  await connection.query(
    `UPDATE user_read SET role = 'admin' WHERE userID = 1`
  );
  console.log('✅ User 1 is now admin');

  await connection.end();
  console.log('\n✅ [COMPLETE] Database initialization finished!');
})();
