// ===================================
// gateway/src/index.js (FIX)
// ===================================
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const serviceRegistry = require('./config/serviceRegistry');
const { 
  generalLimiter, 
  postThrottler, 
  orderThrottler,
  speedLimiter 
}= require('./middleware/throttling'); // UPDATED
const errorHandler = require('./utils/errorHandler');
const healthRoutes = require('./routes/healthRoutes');
const setupOrderRoutes = require('./routes/orderRoutes');
const setupMenuRoutes = require('./routes/menuRoutes');
const setupCustomerRoutes = require('./routes/customerRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: '*', // Allow all origins for development
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Enable-Claude']
}));

// Layer 1: General rate limiting (apply to all)
app.use(generalLimiter);

// Layer 2: POST request throttling (apply to all POST)
app.use(postThrottler);

// Layer 3: Speed limiter (gradual slowdown)
app.use(speedLimiter);


app.use((req, res, next) => {
  // Skip body parsing cho proxy routes
  if (req.path.startsWith('/api/orders') 
    || req.path.startsWith('/api/menu') 
    || req.path.startsWith('/api/customers')) {
    return next();
  }
  express.json()(req, res, next);
});

app.use(morgan('dev'));



// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API Gateway is running successfully!',
    available_routes: {
      orders: '/api/orders',
      menu: '/api/menu',
      customer:'/api/customers',
      health: '/health',
      services_health: '/health/services'
    },
    rateLimit: {
      general: '100 requests / 15 minutes',
      post: '10 POST requests / minute',
      orders: '5 orders / minute'
    }

  });
});

app.use(healthRoutes);

// Mount proxies
setupOrderRoutes(app);
setupMenuRoutes(app);
setupCustomerRoutes(app);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 API Gateway started successfully!`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/health`);
  console.log(`\n📦 Registered services:`);
  Object.entries(serviceRegistry).forEach(([name, config]) => {
    console.log(`   - ${config.name}: ${config.url}`);
  });
  console.log('\n');
});