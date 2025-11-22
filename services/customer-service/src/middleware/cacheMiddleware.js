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

const clearUserCache = async (userId) => {
  try {
    const patterns = [
      `user:/user/${userId}*`, // GET user by id
      `user:/user/${userId}/role*`, // user role
      `user:/user?*`, // danh sách user
    //   `user:/user/*/orders*`, // user orders
    ];

    let totalCleared = 0;

    for (const pattern of patterns) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
        totalCleared += keys.length;
      }
    }

    console.log(
      `🗑️ Cleared ${totalCleared} user cache keys for user ${userId}`
    );
  } catch (err) {
    console.error('Error clearing user cache:', err);
  }
};

module.exports = {
  cacheMiddleware,
  clearCache,
  clearUserCache,
};