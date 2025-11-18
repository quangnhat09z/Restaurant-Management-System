// Simple in-memory cache middleware for menu-service

// In production, use Redis or similar



const cache = new Map();



// Cache middleware factory - returns a middleware function

const cacheMiddleware = (duration = 60000) => {

  return (req, res, next) => {

    // For GET requests only

    if (req.method !== 'GET') {

      return next();

    }



    const key = req.originalUrl || req.url;

    const cachedData = cache.get(key);



    if (cachedData && Date.now() - cachedData.timestamp < duration) {

      return res.json(cachedData.data);

    }



    // Store original json method

    const originalJson = res.json;

    res.json = function(data) {

      // Cache the response

      cache.set(key, {

        data,

        timestamp: Date.now()

      });

      // Call original json method

      return originalJson.call(this, data);

    };



    next();

  };

};



// Clear cache for a specific key or pattern

const clearCache = async (pattern) => {

  if (pattern === 'menu:/*') {

    // Clear all menu-related cache

    cache.clear();

  } else {

    cache.delete(pattern);

  }

};



// Clear all cache

const clearMenuCache = () => {

  cache.clear();

};



module.exports = {

  cacheMiddleware,

  clearCache,

  clearMenuCache,

};