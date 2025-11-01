// services/customer-service/src/utils/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error('❌ Error:', err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      error: 'Duplicate entry',
      message: 'This record already exists'
    });
  }

  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      error: 'Database connection failed',
      message: 'Unable to connect to database'
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
