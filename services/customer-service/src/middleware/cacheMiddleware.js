const redisClient = require('../config/redisClient');

const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    // Tạo cache key chuẩn hóa, bao gồm cả sorted query params
    const sortedQuery = Object.keys(req.query)
      .sort()
      .map((key) => `${key}=${req.query[key]}`)
      .join('&');

    const key = `user:${req.path}${sortedQuery ? '?' + sortedQuery : ''}`;

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

module.exports = {
  cacheMiddleware,
};
