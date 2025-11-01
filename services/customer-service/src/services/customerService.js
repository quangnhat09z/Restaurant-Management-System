const pool = require('../database/db'); // đảm bảo file db.js nằm trong thư mục /database
const bcrypt = require('bcrypt');

// =================== Đăng ký khách hàng ===================
exports.registerCustomer = async (customerData) => {
  const { customerName, Email, ContactNumber, Password, Address } = customerData;

  // Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash(Password, 10);

  const [result] = await pool.query(
    `INSERT INTO customer (customerName, Email, ContactNumber, Password, Address, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
    [customerName, Email, ContactNumber, hashedPassword, Address]
  );

  return result.insertId;
};

// =================== Đăng nhập khách hàng ===================
exports.loginCustomer = async (Email, Password) => {
  const [rows] = await pool.query(`SELECT * FROM customer WHERE Email = ?`, [Email]);
  const customer = rows[0];

  if (!customer) throw new Error('Customer not found');

  const isPasswordValid = await bcrypt.compare(Password, customer.Password);
  if (!isPasswordValid) throw new Error('Invalid password');

  return customer;
};

// =================== Lấy danh sách khách hàng ===================
exports.getAllCustomers = async () => {
  const [rows] = await pool.query(`SELECT * FROM customer`);
  return rows;
};

// =================== Lấy khách hàng theo ID ===================
exports.getCustomerById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM customer WHERE CustomerID = ?`, [id]);
  return rows[0];
};

// =================== Cập nhật thông tin khách hàng ===================
exports.updateCustomer = async (id, data) => {
  // 🧹 Xóa các field có giá trị undefined để tránh lỗi "Bind parameters must not contain undefined"
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined) delete data[key];
  });

  // Nếu không có trường hợp lệ => báo lỗi
  if (Object.keys(data).length === 0) {
    throw new Error('No valid fields provided for update');
  }

  // Tạo truy vấn động
  const fields = Object.keys(data).map((key) => `${key} = ?`).join(', ');
  const values = Object.values(data);

  const [result] = await pool.query(
    `UPDATE customer SET ${fields}, updatedAt = NOW() WHERE CustomerID = ?`,
    [...values, id]
  );

  return result;
};

// =================== Xóa khách hàng ===================
exports.deleteCustomer = async (id) => {
  const [result] = await pool.query(`DELETE FROM customer WHERE CustomerID = ?`, [id]);
  return result;
};
