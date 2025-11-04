const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Đăng ký khách hàng
router.post('/register', customerController.registerCustomer);

// Đăng nhập khách hàng
router.post('/login', customerController.loginCustomer);

// Lấy danh sách khách hàng
router.get('/', customerController.getAllCustomers);

// Lấy khách hàng theo ID
router.get('/:id', customerController.getCustomerById);

// Cập nhật khách hàng
router.put('/:id', customerController.updateCustomer);

// Xóa khách hàng
router.delete('/:id', customerController.deleteCustomer);

// Customer's orders (gọi thông qua Order Service)
router.get('/:id/orders', customerController.getCustomerOrders);
router.post('/:id/orders', customerController.createCustomerOrder);

module.exports = router;
