// services/order-service/src/middleware/orderThrottling.js

const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

// 1. Prevent duplicate orders from same table
const duplicateOrderCache = new Map();

function preventDuplicateOrder(req, res, next) {
  const { TableNumber, Cart } = req.body;
  
  if (!TableNumber || !Cart) {
    return next();
  }

  // Create cache key
  const cartKey = JSON.stringify(Cart.map(item => ({
    id: item.id,
    Quantity: item.Quantity
  })).sort());
  
  const cacheKey = `table-${TableNumber}-${cartKey}`;
  
  // Check if same order was placed recently (within 30 seconds)
  const lastOrderTime = duplicateOrderCache.get(cacheKey);
  const now = Date.now();
  
  if (lastOrderTime && (now - lastOrderTime) < 30000) {
    return res.status(429).json({
      success: false,
      error: 'Duplicate Order Detected',
      message: 'Same order was placed less than 30 seconds ago',
      lastOrder: new Date(lastOrderTime).toISOString(),
      retryAfter: Math.ceil((30000 - (now - lastOrderTime)) / 1000)
    });
  }
  
  // Store this order in cache
  duplicateOrderCache.set(cacheKey, now);
  
  // Clean up old entries (older than 1 minute)
  for (const [key, time] of duplicateOrderCache.entries()) {
    if (now - time > 60000) {
      duplicateOrderCache.delete(key);
    }
  }
  
  next();
}

// 2. Per-user order throttling
const userOrderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Max 3 orders per minute per user
  keyGenerator: (req) => {
    // Use UserID or CustomerID as key, fallback to ipKeyGenerator for IPv6 safety
    const userId = req.body.UserID || req.body.CustomerID;
    if (userId) {
      return `user-${userId}`;
    }
    // Use ipKeyGenerator helper for proper IPv6 handling
    return `ip-${ipKeyGenerator(req)}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Order Limit Exceeded',
      message: 'You can only place 3 orders per minute',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// 3. Per-table order throttling
const tableOrderLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 1, // Max 1 order per 10 seconds per table
  keyGenerator: (req) => {
    return `table-${req.body.TableNumber}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Table Order Limit',
      message: 'Please wait 10 seconds before placing another order for this table',
      retryAfter: 10
    });
  },
  skip: (req) => !req.body.TableNumber
});

module.exports = {
  preventDuplicateOrder,
  userOrderLimiter,
  tableOrderLimiter
};