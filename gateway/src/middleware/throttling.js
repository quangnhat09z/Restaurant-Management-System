// gateway/src/middleware/throttling.js

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// 1. General Rate Limit (existing)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests',
    message: 'Please try again after 15 minutes'
  }
});

// 2. POST Request Throttling (NEW)
const postThrottler = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 POST requests per minute
  skipSuccessfulRequests: false,
  skipFailedRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many POST requests',
      message: 'You can only make 10 POST requests per minute',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  },
  // Only apply to POST requests
  skip: (req) => req.method !== 'POST'
});

// 3. Order Creation Specific Throttling (NEW)
const orderThrottler = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Max 5 orders per minute
  message: {
    error: 'Too many orders',
    message: 'You can only create 5 orders per minute',
    tip: 'If this is a mistake, please contact support'
  }
});

// 4. Slow Down (Gradual Response Delay) (NEW)
const speedLimiter = slowDown({
  windowMs: 60 * 1000, // 1 minute
  delayAfter: 5, // Start delaying after 5 requests
  delayMs: 500, // Add 500ms delay per request
  maxDelayMs: 5000, // Max delay 5 seconds
  skipSuccessfulRequests: false,
  skipFailedRequests: true
});

module.exports = {
  generalLimiter,
  postThrottler,
  orderThrottler,
  speedLimiter
};