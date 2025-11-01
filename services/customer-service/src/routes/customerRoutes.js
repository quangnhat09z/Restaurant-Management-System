const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customerController');

// Đăng ký khách hàng
router.post('/register', CustomerController.registerCustomer);

// Đăng nhập khách hàng
router.post('/login', CustomerController.loginCustomer);

// Lấy danh sách khách hàng
router.get('/', CustomerController.getAllCustomers);

// Lấy khách hàng theo ID
router.get('/:id', CustomerController.getCustomerById);

// Cập nhật khách hàng
router.put('/:id', CustomerController.updateCustomer);

// Xóa khách hàng
router.delete('/:id', CustomerController.deleteCustomer);

module.exports = router;
