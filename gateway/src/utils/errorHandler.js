// ===================================
// gateway/src/utils/errorHandler.js (NEW)
// ===================================
module.exports = (err, req, res, next) => {
  console.error('❌ Gateway Error:', err);

  // Proxy errors
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      error: 'Service Unavailable',
      message: 'Cannot connect to backend service',
      service: err.address
    });
  }

  if (err.code === 'ETIMEDOUT') {
    return res.status(504).json({
      success: false,
      error: 'Gateway Timeout',
      message: 'Service took too long to respond'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Gateway Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
};
