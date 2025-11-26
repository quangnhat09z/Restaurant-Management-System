// services/customer-service/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const env = require('../../../../Backend/environment');

// Xác thực Access Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access Denied',
      message: 'No token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(403).json({
      success: false,
      error: 'Invalid Token',
      message:
        err.message === 'jwt expired' ? 'Token expired' : 'Invalid token',
    });
  }
};

// Kiểm tra quyền (role-based access control)
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Access Denied',
        message: 'User not authenticated',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Only ${allowedRoles.join(', ')} can access this resource`,
      });
    }

    next();
  };
};

// Kiểm tra quyền truy cập tài nguyên của chính mình hoặc là admin
const authorizeUserOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Access Denied',
      message: 'User not authenticated',
    });
  }

  const requestedUserId = req.params.id;
  const isOwnResource = req.user.userID === parseInt(requestedUserId);
  const isAdmin = req.user.role === 'admin';

  if (!isOwnResource && !isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'You can only access your own data',
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizeUserOrAdmin,
};
