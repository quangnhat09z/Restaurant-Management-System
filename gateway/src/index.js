// gateway/src/index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');
const serviceRegistry = require('./config/serviceRegistry');
const rateLimiter = require('./middleware/rateLimiter')

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
app.use(rateLimiter);

// Root route (must be placed before proxy middlewares) =====
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API Gateway is running successfully!',
    available_routes: {
      orders: '/api/orders',
      menus: '/api/menu',
      health: '/health'
    },
    timestamp: new Date().toISOString()
  });
});


// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// Service health check aggregation
app.get('/health/services', async (req, res) => {
  const healthChecks = await Promise.allSettled(
    Object.entries(serviceRegistry).map(async ([name, config]) => {
      const response = await fetch(`${config.url}/health`);
      // console.log(`${config.url}/health`);
      return { service: name, status: response.ok ? 'UP' : 'DOWN' };
    })
  );

  res.json({
    gateway: 'UP',
    services: healthChecks.map(result => 
      result.status === 'fulfilled' ? result.value : { error: result.reason }
    )
  });
});

// Proxy to Order Service
app.use(
  '/api/orders', 
  createProxyMiddleware({
  target: serviceRegistry.orderService.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/orders': '/api/orders'
  },
  onError: (err, req, res) => {
    console.error('Order Service Error:', err);
    res.status(503).json({ 
      error: 'Order Service unavailable',
      message: 'Please try again later'
    });
  }
}));

// Proxy to Menu Service
app.use(
  '/api/menu', 
  createProxyMiddleware({
  target: serviceRegistry.menuService.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/menu': '/api/menu'
  },
  onError: (err, req, res) => {
    console.error('Menu Service Error:', err);
    res.status(503).json({ 
      error: 'Menu Service unavailable',
      message: 'Please try again later'
    });
  }
}));

// // Backward compatibility - old endpoint
// app.post('/placeorder', createProxyMiddleware({
//   target: serviceRegistry.orderService.url,
//   changeOrigin: true,
//   pathRewrite: {
//     '^/placeorder': '/api/orders'
//   }
// }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Gateway Error:', err);
  res.status(500).json({ 
    error: 'Internal Gateway Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on port: http://localhost:${PORT}`);
  console.log('Registered services:', Object.keys(serviceRegistry));
});
