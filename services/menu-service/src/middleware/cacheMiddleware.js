const redisClient = require('../config/redisClient');

// Cache middleware cho GET requests
// cacheMiddleware.js - Cải tiến
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    // Tạo cache key chuẩn hóa, bao gồm cả sorted query params
    const sortedQuery = Object.keys(req.query)
      .sort()
      .map(key => `${key}=${req.query[key]}`)
      .join('&');
    
    const key = `menu:${req.path}${sortedQuery ? '?' + sortedQuery : ''}`;

    try {
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        console.log(`✅ Cache HIT: ${key}`);
        return res.json(JSON.parse(cachedData));
      }

      console.log(`❌ Cache MISS: ${key}`);

      const originalJson = res.json.bind(res);
      res.json = (data) => {
        redisClient.setEx(key, duration, JSON.stringify(data)).catch((err) => {
          console.error('Error caching data:', err);
        });
        return originalJson(data);
      };

      next();
    } catch (err) {
      console.error('Cache middleware error:', err);
      next(); // Fail gracefully
    }
  };
};

// Clear cache theo pattern
const clearCache = async (pattern = 'menu:*') => {
  try {
    const keys = await redisClient.keys(pattern); 
    console.log(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Cleared ${keys.length} cache keys matching: ${pattern}`);
    }
  } catch (err) {
    console.error('Error clearing cache:', err);
  }
};

// Clear cache cho một menu cụ thể
const clearMenuCache = async (menuId) => {
  try {
    const patterns = ['menu:/menu/', 'menu:/menu/filter*', `menu:/menu/${menuId}*`];

    for (const pattern of patterns) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    }
    console.log(`Cleared cache for menu ${menuId}`);
  } catch (err) {
    console.error('Error clearing menu cache:', err);
  }
};

module.exports = {
  cacheMiddleware,
  clearCache,
  clearMenuCache,
};
