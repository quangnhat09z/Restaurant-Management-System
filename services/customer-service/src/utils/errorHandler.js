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

  // Do not leak internal error messages (such as SQL errors) to clients.
  // For server errors (5xx) return a generic message. For client errors (4xx)
  // we can return the provided message.
  let clientMessage = 'Internal Server Error';
  if (statusCode >= 400 && statusCode < 500) {
    clientMessage = err.message || 'Bad request';
  }

  res.status(statusCode).json({
    success: false,
    error: clientMessage
  });
};
