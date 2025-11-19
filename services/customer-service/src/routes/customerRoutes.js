const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { validateRegister, validateLogin, validateUpdate } = require('../validators/customerValidator');

// helper middleware to format Joi errors
function validationMiddleware(validator) {
	return (req, res, next) => {
		console.log('[validator] path=', req.path);
		console.log('[validator] body keys=', Object.keys(req.body || {}));
		const { error } = validator(req.body);
		if (error) {
			const details = error.details.map(d => d.message);
			return res.status(400).json({ error: 'Invalid input', details });
		}
		next();
	};
}

// Đăng ký khách hàng
router.post('/register', validationMiddleware(validateRegister), customerController.registerCustomer);

// Đăng nhập khách hàng
router.post('/login', validationMiddleware(validateLogin), customerController.loginCustomer);

// Lấy danh sách khách hàng
router.get('/', customerController.getAllCustomers);

// Lấy khách hàng theo ID
router.get('/:id', customerController.getCustomerById);

// Cập nhật khách hàng
router.put('/:id', validationMiddleware(validateUpdate), customerController.updateCustomer);

// Xóa khách hàng
router.delete('/:id', customerController.deleteCustomer);

// Customer's orders (gọi thông qua Order Service)
router.get('/:id/orders', customerController.getCustomerOrders);
router.post('/:id/orders', customerController.createCustomerOrder);

module.exports = router;
