const express = require('express');
const router = express.Router();
const userController = require('../controllers/customerController');
const {
  validateRegister,
  validateLogin,
  validateUpdate,
  validateUpdateStatus,
} = require('../validators/customerValidator');

const { validationMiddleware } = require('../middleware/validation');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

// Đăng ký người dùng

const CACHE_DURATION = {
  LIST: 3600,
  DETAIL: 3600,
  ROLE: 3600,
  // ORDERS: 3600,
};

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
router.get(
  '/',
  cacheMiddleware(CACHE_DURATION.LIST),
  userController.getAllUsers
);

// Lấy người dùng theo ID
router.get(
  '/:id',
  cacheMiddleware(CACHE_DURATION.DETAIL),
  userController.getUserById
);

// Lấy role của người dùng
router.get(
  '/:id/role',
  cacheMiddleware(CACHE_DURATION.ROLE),
  userController.getUserRole
);

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
router.get(
  '/:id/orders',
  // cacheMiddleware(CACHE_DURATION.ORDER),
  userController.getUserOrders
);
router.post('/:id/orders', userController.createUserOrder);

module.exports = router;
