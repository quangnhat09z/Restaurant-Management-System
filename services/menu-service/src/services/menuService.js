const pool = require('../database/db');

async function getAllMenus(page, limit) {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const offset = (pageNum - 1) * limitNum;

  // Lấy dữ liệu phân trang
  const [rows] = await pool.query('SELECT * FROM recipes LIMIT ? OFFSET ?', [
    parseInt(limit),
    parseInt(offset),
  ]);

  // Đếm tổng số bản ghi
  const [[{ total }]] = await pool.query(
    'SELECT COUNT(*) AS total FROM recipes'
  );

  const totalPages = Math.ceil(total / limit);

  return {
    data: rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      limit: parseInt(limit),
    },
  };
}

async function getMenuById(id) {
  const [rows] = await pool.query('SELECT * FROM recipes WHERE id = ?', [id]);
  return rows[0];
}

async function createMenu(menuData) {
  const {
    id,
    name,
    ingredients,
    instructions,
    prepTimeMinutes,
    cookTimeMinutes,
    servings,
    difficulty,
    cuisine,
    caloriesPerServing,
    tags,
    userId,
    image,
    rating,
    reviewCount,
    mealType,
    price,
  } = menuData;

  const [result] = await pool.query(
    `INSERT INTO recipes
    (id, name, ingredients, instructions, prepTimeMinutes, cookTimeMinutes,
    servings, difficulty, cuisine, caloriesPerServing, tags, userId, image,
    rating, reviewCount, mealType, price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      name,
      JSON.stringify(ingredients),
      JSON.stringify(instructions),
      prepTimeMinutes,
      cookTimeMinutes,
      servings,
      difficulty,
      cuisine,
      caloriesPerServing,
      JSON.stringify(tags),
      userId,
      image,
      rating,
      reviewCount,
      JSON.stringify(mealType),
      price,
    ]
  );

  return result.insertId;
}

async function updateMenu(id, data) {
  const fields = Object.keys(data)
    .map((key) => `${key} = ?`)
    .join(', ');
  const values = Object.values(data);

  await pool.query(`UPDATE recipes SET ${fields} WHERE id = ?`, [
    ...values,
    id,
  ]);
  return { id, ...data };
}

async function deleteMenu(id) {
  await pool.query('DELETE FROM recipes WHERE id = ?', [id]);
}



module.exports = {
  getAllMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
};
