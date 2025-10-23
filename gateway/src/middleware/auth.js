// ===================================
// gateway/src/middleware/auth.js (NEW)
// ===================================
// Basic authentication middleware (for future use)
const auth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  // For now, just pass through
  // Later, you can add API key validation
  if (process.env.NODE_ENV === 'production' && !apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'API key is required'
    });
  }
  
  next();
};