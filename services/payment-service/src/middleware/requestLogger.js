const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`📥 ${req.method} ${req.path}`, {
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Capture response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    
    console.log(`📤 ${req.method} ${req.path} - ${res.statusCode}`, {
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    originalSend.call(this, data);
  };

  next();
};

module.exports = { requestLogger };