// ===================================
// gateway/src/index.js (FIXED)
// ===================================
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const serviceRegistry = require('./config/serviceRegistry');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting
app.use(rateLimiter);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: '🎉 API Gateway is running successfully!',
    available_routes: {
      orders: '/api/orders',
      menu: '/api/menu',
      health: '/health',
      services_health: '/health/services'
    },
    documentation: {
      orders: {
        create: 'POST /api/orders',
        list: 'GET /api/orders',
        detail: 'GET /api/orders/:id',
        updateStatus: 'PATCH /api/orders/:id/status',
        delete: 'DELETE /api/orders/:id'
      },
      menu: {
        list: 'GET /api/menu',
        detail: 'GET /api/menu/:id',
        create: 'POST /api/menu',
        update: 'PUT /api/menu/:id',
        delete: 'DELETE /api/menu/:id'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'api-gateway',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Service health check aggregation
app.get('/health/services', async (req, res) => {
  const healthChecks = await Promise.allSettled(
    Object.entries(serviceRegistry).map(async ([name, config]) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
        
        const response = await fetch(`${config.url}/health`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        return { 
          service: name, 
          status: response.ok ? 'UP' : 'DOWN',
          url: config.url
        };
      } catch (error) {
        return { 
          service: name, 
          status: 'DOWN',
          error: error.message,
          url: config.url
        };
      }
    })
  );

  const services = healthChecks.map(result => 
    result.status === 'fulfilled' ? result.value : { 
      service: 'unknown', 
      status: 'ERROR',
      error: result.reason?.message 
    }
  );

  const allUp = services.every(s => s.status === 'UP');

  res.status(allUp ? 200 : 503).json({
    gateway: 'UP',
    overall_status: allUp ? 'HEALTHY' : 'DEGRADED',
    services,
    timestamp: new Date().toISOString()
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
    onProxyReq: (proxyReq, req, res) => {
      // Log proxy request
      console.log(`🔄 Proxying: ${req.method} ${req.originalUrl} -> ${serviceRegistry.orderService.url}${req.url}`);
    },
    onError: (err, req, res) => {
      console.error('❌ Order Service Error:', err.message);
      res.status(503).json({ 
        success: false,
        error: 'Order Service unavailable',
        message: 'Please try again later',
        service: 'order-service'
      });
    }
  })
);

// Proxy to Menu Service
app.use(
  '/api/menu', 
  createProxyMiddleware({
    target: serviceRegistry.menuService.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/menu': '/api/menu'
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`🔄 Proxying: ${req.method} ${req.originalUrl} -> ${serviceRegistry.menuService.url}${req.url}`);
    },
    onError: (err, req, res) => {
      console.error('❌ Menu Service Error:', err.message);
      res.status(503).json({ 
        success: false,
        error: 'Menu Service unavailable',
        message: 'Please try again later',
        service: 'menu-service'
      });
    }
  })
);

// Backward compatibility - old endpoint (if needed)
app.post('/placeorder', createProxyMiddleware({
  target: serviceRegistry.orderService.url,
  changeOrigin: true,
  pathRewrite: {
    '^/placeorder': '/api/orders'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`⚠️ Legacy endpoint used: POST /placeorder -> POST /api/orders`);
  }
}));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    suggestion: 'Check available routes at GET /'
  });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 API Gateway started successfully!`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/health`);
  console.log(`🔍 Services: http://localhost:${PORT}/health/services`);
  console.log(`\n📦 Registered services:`);
  Object.entries(serviceRegistry).forEach(([name, config]) => {
    console.log(`   - ${config.name}: ${config.url}`);
  });
  console.log('\n');
});