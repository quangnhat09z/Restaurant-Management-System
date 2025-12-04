// services/order-service/src/middleware/redisThrottling.js

const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  enableOfflineQueue: false
});

// Production-ready throttling with Redis
const redisOrderLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:orders:',
    sendCommand: (...args) => redisClient.call(...args)
  }),
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = req.body.UserID || req.body.CustomerID;
    if (userId) {
      return `user-${userId}`;
    }
    return `ip-${ipKeyGenerator(req)}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: 'Too many orders, please try again later'
    });
  }
});

module.exports = { redisOrderLimiter };