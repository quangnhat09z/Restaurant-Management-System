const pool = require('../database/db');
const bcrypt = require('bcrypt');
const cqrsService = require('./cqrsService');

// =================== Đăng ký người dùng ===================
exports.registerUser = async (userData) => {
  const { userName, email, contactNumber, password, address } = userData;

  if (!password) throw new Error('Password is required');

  // Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash(password, 10);

  // Ghi vào Write Store (CQRS)
  const userID = await cqrsService.writeUser({
    userName,
    email,
    contactNumber,
    password: hashedPassword,
    address,
    role: 'user',
  });

  return userID;
};

// =================== Đăng nhập người dùng ===================
exports.loginUser = async ({ email, password }) => {
  // Đọc từ Read Store (tối ưu cho query)
  const user = await cqrsService.readUserByEmail(email);

  if (!user) throw new Error('User not found or account inactive');

  // Lấy password từ Write Store để so sánh
  const [writeRows] = await pool.query(
    `SELECT password FROM user_write WHERE userID = ? AND isActive = TRUE`,
    [user.userID]
  );
  const writeUser = writeRows[0];

  if (!writeUser) throw new Error('User not found in write store');

  // So sánh mật khẩu hash
  const isPasswordValid = await bcrypt.compare(password, writeUser.password);
  if (!isPasswordValid) throw new Error('Invalid password');

  // Cập nhật lastLogin vào Write Store
  await cqrsService.updateWriteUser(user.userID, {
    lastLogin: new Date(),
  });

  return user;
};

// =================== Lấy danh sách người dùng ===================
exports.getAllUsers = async (page = 1, limit = 10, filters = {}) => {
  return await cqrsService.readAllUsers(page, limit, filters);
};

// =================== Lấy người dùng theo ID ===================
exports.getUserById = async (id) => {
  return await cqrsService.readUserById(id);
};

// =================== Lấy người dùng theo email ===================
exports.getUserByEmail = async (email) => {
  return await cqrsService.readUserByEmail(email);
};

// =================== Cập nhật thông tin người dùng ===================
exports.updateUser = async (id, data) => {
  return await cqrsService.updateWriteUser(id, data);
};

// =================== Xóa người dùng ===================
exports.deleteUser = async (id) => {
  return await cqrsService.deleteWriteUser(id);
};

// =================== Kiểm tra role của người dùng ===================
exports.getUserRole = async (id) => {
  const user = await cqrsService.readUserById(id);
  return user?.role || null;
};

// =================== Cập nhật trạng thái active ===================
exports.updateUserStatus = async (id, isActive) => {
  return await cqrsService.updateWriteUser(id, { isActive });
};
