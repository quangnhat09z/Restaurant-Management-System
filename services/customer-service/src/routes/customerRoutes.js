const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {
  validateRegister,
  validateLogin,
  validateUpdate,
  validateUpdateStatus,
} = require('../validators/userValidator');
 
const {validationMiddleware}= require('../middleware/validation')

// Đăng ký người dùng
router.post(
  '/register',
  validationMiddleware(validateRegister),
  userController.registerUser
);

// Đăng nhập người dùng
router.post(
  '/login',
  validationMiddleware(validateLogin),
  userController.loginUser
);




//Admin


// Lấy danh sách người dùng
router.get('/', userController.getAllUsers);

// Lấy người dùng theo ID
router.get('/:id', userController.getUserById);

// Lấy role của người dùng
router.get('/:id/role', userController.getUserRole);

// Cập nhật thông tin người dùng
router.put(
  '/:id',
  validationMiddleware(validateUpdate),
  userController.updateUser
);

// Cập nhật trạng thái active của người dùng
router.patch(
  '/:id/status',
  validationMiddleware(validateUpdateStatus),
  userController.updateUserStatus
);

// Xóa người dùng
router.delete('/:id', userController.deleteUser);

// User's orders (gọi thông qua Order Service)
router.get('/:id/orders', userController.getUserOrders);
router.post('/:id/orders', userController.createUserOrder);

module.exports = router;
