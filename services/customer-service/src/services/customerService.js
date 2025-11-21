const pool = require('../database/db');
const bcrypt = require('bcrypt');

// =================== Đăng ký người dùng ===================
exports.registerUser = async (userData) => {
  const { userName, email, contactNumber, password, address } = userData;

  if (!password) throw new Error('Password is required');

  // Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    `INSERT INTO user (userName, email, contactNumber, password, address, role, isActive, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, 'user', TRUE, NOW(), NOW())`,
    [userName, email, contactNumber, hashedPassword, address]
  );

  return result.insertId;
};

// =================== Đăng nhập người dùng ===================
exports.loginUser = async ({ email, password }) => {
  const [rows] = await pool.query(
    `SELECT * FROM user WHERE email = ? AND isActive = TRUE`,
    [email]
  );
  const user = rows[0];

  if (!user) throw new Error('User not found or account inactive');

  // So sánh mật khẩu hash
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error('Invalid password');

  // Cập nhật lastLogin
  await pool.query(`UPDATE user SET lastLogin = NOW() WHERE userID = ?`, [
    user.userID,
  ]);

  return user;
};

// =================== Lấy danh sách người dùng ===================
exports.getAllUsers = async () => {
  const [rows] = await pool.query(`SELECT * FROM user`);
  return rows;
};

// =================== Lấy người dùng theo ID ===================
exports.getUserById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM user WHERE userID = ?`, [id]);
  return rows[0];
};

// =================== Lấy người dùng theo email ===================
exports.getUserByEmail = async (email) => {
  const [rows] = await pool.query(`SELECT * FROM user WHERE email = ?`, [
    email,
  ]);
  return rows[0];
};

// =================== Cập nhật thông tin người dùng ===================
exports.updateUser = async (id, data) => {
  // Loại bỏ field undefined
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined) delete data[key];
  });

  if (Object.keys(data).length === 0) {
    throw new Error('No valid fields provided for update');
  }

  // Tạo truy vấn động
  const fields = Object.keys(data)
    .map((key) => `${key} = ?`)
    .join(', ');
  const values = Object.values(data);

  const [result] = await pool.query(
    `UPDATE user SET ${fields}, updatedAt = NOW() WHERE userID = ?`,
    [...values, id]
  );

  return result;
};

// =================== Xóa người dùng ===================
exports.deleteUser = async (id) => {
  const [result] = await pool.query(`DELETE FROM user WHERE userID = ?`, [id]);
  return result;
};

// =================== Kiểm tra role của người dùng ===================
exports.getUserRole = async (id) => {
  const [rows] = await pool.query(`SELECT role FROM user WHERE userID = ?`, [
    id,
  ]);
  return rows[0]?.role || null;
};

// =================== Cập nhật trạng thái active ===================
exports.updateUserStatus = async (id, isActive) => {
  const [result] = await pool.query(
    `UPDATE user SET isActive = ?, updatedAt = NOW() WHERE userID = ?`,
    [isActive, id]
  );
  return result;
};
