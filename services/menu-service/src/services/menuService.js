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

// menuService.js - Cải tiến
async function filterMenus(filters) {
  // Whitelist các field được phép filter
  const ALLOWED_FIELDS = [
    'name', 'cuisine', 'difficulty', 'prepTimeMinutes', 
    'cookTimeMinutes', 'servings', 'caloriesPerServing', 
    'rating', 'price', 'userId'
  ];

  let query = 'SELECT * FROM recipes WHERE 1=1';
  const values = [];

  for (const [key, value] of Object.entries(filters)) {
    if (['page', 'limit'].includes(key)) continue;

    // Xác định field thực tế
    let field = key;
    let operator = '=';
    
    if (key.endsWith('_gte')) {
      field = key.replace('_gte', '');
      operator = '>=';
    } else if (key.endsWith('_lte')) {
      field = key.replace('_lte', '');
      operator = '<=';
    } else if (key.endsWith('_gt')) {
      field = key.replace('_gt', '');
      operator = '>';
    } else if (key.endsWith('_lt')) {
      field = key.replace('_lt', '');
      operator = '<';
    }

    // Validate field name (chống SQL injection)
    if (!ALLOWED_FIELDS.includes(field)) {
      console.warn(`⚠️ Ignored invalid field: ${field}`);
      continue;
    }

    // Xử lý LIKE search
    if (['name', 'cuisine', 'difficulty'].includes(field)) {
      query += ` AND ${field} LIKE ?`;
      values.push(`%${value}%`);
    } else {
      query += ` AND ${field} ${operator} ?`;
      values.push(value);
    }
  }

  // Thêm pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const offset = (page - 1) * limit;

  query += ' LIMIT ? OFFSET ?';
  values.push(limit, offset);

  const [rows] = await pool.query(query, values);
  
  // Lấy total count
  const countQuery = query.split('LIMIT')[0];
  const [[{ total }]] = await pool.query(
    countQuery.replace('SELECT *', 'SELECT COUNT(*) as total'),
    values.slice(0, -2)
  );

  return {
    data: rows,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      limit
    }
  };
}

module.exports = {
  getAllMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
  filterMenus,
};
