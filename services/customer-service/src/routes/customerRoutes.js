// services/customer-service/src/routes/customerRoutes.js
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
const {
  authenticateToken,
  authorizeRole,
  authorizeUserOrAdmin,
} = require('../middleware/authMiddleware');

const CACHE_DURATION = {
  LIST: 3600,
  DETAIL: 3600,
  ROLE: 3600,
};

router.post(
  '/register',
  validationMiddleware(validateRegister),
  userController.registerUser
);

router.post(
  '/login',
  validationMiddleware(validateLogin),
  userController.loginUser
);

router.post('/refresh-token', userController.refreshToken);

router.post('/logout', authenticateToken, userController.logoutUser);

router.get(
  '/',
  // authenticateToken,
  // authorizeRole('admin'),
  // cacheMiddleware(CACHE_DURATION.LIST),
  userController.getAllUsers
);

router.get(
  '/:id',
  // authenticateToken,
  // authorizeUserOrAdmin,
  // cacheMiddleware(CACHE_DURATION.DETAIL),
  userController.getUserById
);

router.get(
  '/:id/role',
  // authenticateToken,
  // authorizeRole('admin'),
  // cacheMiddleware(CACHE_DURATION.ROLE),
  userController.getUserRole
);

router.put(
  '/:id',
  authenticateToken,
  authorizeUserOrAdmin,
  validationMiddleware(validateUpdate),
  userController.updateUser
);

router.patch(
  '/:id/status',
  authenticateToken,
  authorizeRole('admin'),
  validationMiddleware(validateUpdateStatus),
  userController.updateUserStatus
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRole('admin'),
  userController.deleteUser
);

router.get(
  '/:id/orders',
  // authenticateToken,
  // authorizeUserOrAdmin,
  userController.getUserOrders
);

router.post(
  '/:id/orders',
  // authenticateToken,
  // authorizeUserOrAdmin,
  userController.createUserOrder
);

module.exports = router;
