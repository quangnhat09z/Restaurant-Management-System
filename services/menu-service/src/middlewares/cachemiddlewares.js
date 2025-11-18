const redisClient = require('../config/redisClient');

// Cache middleware cho GET requests
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    // Tạo cache key từ route và query params
    const key = `menu:${req.originalUrl || req.url}`;

    try {
      // Check cache
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        console.log(`Cache HIT for key: ${key}`);
        return res.json(JSON.parse(cachedData));
      }

      console.log(`Cache MISS for key: ${key}`);

      // Modify res.json để cache response
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        // Cache data
        redisClient.setEx(key, duration, JSON.stringify(data)).catch((err) => {
          console.error('Error caching data:', err);
        });
        return originalJson(data);
      };

      next();
    } catch (err) {
      console.error('Cache middleware error:', err);
      next();
    }
  };
};

// Clear cache theo pattern
const clearCache = async (pattern = 'menu:*') => {
  try {
    const keys = await redisClient.keys(pattern);
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
    const patterns = ['menu:/', 'menu:/filter*', `menu:/${menuId}*`];

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
