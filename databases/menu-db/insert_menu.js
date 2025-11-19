// Chay file nay sau khi tao database nhe
// cd den folder menu-db, sau do chay node insert_menu.js
const fs = require('fs');
const mysql = require('mysql2/promise');

(async () => {
  // Thay password de phu hop ae nhe
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'restaurant_menu',
  });

  const data = JSON.parse(fs.readFileSync('./recipes_price.json', 'utf8'));

  for (const recipe of data) {
    await connection.execute(
      `INSERT INTO recipes 
      (id, name, ingredients, instructions, prepTimeMinutes, cookTimeMinutes, servings, difficulty, cuisine, caloriesPerServing, tags, userId, image, rating, reviewCount, mealType, price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recipe.id,
        recipe.name,
        JSON.stringify(recipe.ingredients),
        JSON.stringify(recipe.instructions),
        recipe.prepTimeMinutes,
        recipe.cookTimeMinutes,
        recipe.servings,
        recipe.difficulty,
        recipe.cuisine,
        recipe.caloriesPerServing,
        JSON.stringify(recipe.tags),
        recipe.userId,
        recipe.image,
        recipe.rating,
        recipe.reviewCount,
        JSON.stringify(recipe.mealType),
        recipe.price,
      ]
    );
  }

  console.log('✅ Dữ liệu đã được import thành công!');
  await connection.end();
})();
