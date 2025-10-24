// ===================================
// gateway/src/index.js (FIX POST/PATCH)
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


app.use((req, res, next) => {
  // Skip body parsing cho proxy routes
  if (req.path.startsWith('/api/orders') || req.path.startsWith('/api/menu')) {
    return next();
  }
  express.json()(req, res, next);
});

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
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'api-gateway',
    uptime: process.uptime()
  });
});

// Service health check
app.get('/health/services', async (req, res) => {
  const healthChecks = await Promise.allSettled(
    Object.entries(serviceRegistry).map(async ([name, config]) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
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
    services
  });
});

// Order Proxy
const orderProxy = createProxyMiddleware({
  target: serviceRegistry.orderService.url,
  changeOrigin: true,
  pathFilter: '/api/orders',
  pathRewrite: {
    '^/api/orders': '/orders'
  },
  
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 [ORDER] ${req.method} ${req.originalUrl} -> http://localhost:3001${proxyReq.path}`);
    
    if (req.body && (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT')) {
      const bodyData = JSON.stringify(req.body);
      
      // Update headers
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      
      // Write body
      proxyReq.write(bodyData);
      proxyReq.end();
      
      console.log(`[ORDER] Body forwarded: ${bodyData.substring(0, 100)}...`);
    }
  },
  on: {
    proxyRes: (proxyRes, req, res) => {
      console.log(`[ORDER] Response: ${proxyRes.statusCode}`);
    },
    error: (err, req, res) => {
      console.error('Order Service error:', err.message);
      if (!res.headersSent) {
        res.status(503).json({ 
          success: false,
          error: 'Order Service unavailable'
        });
      }
    }
  }
});

const menuProxy = createProxyMiddleware({
  target: serviceRegistry.menuService.url,
  changeOrigin: true,
  pathFilter: '/api/menu',
  pathRewrite: {
    '^/api/menu': '/menu'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 [MENU] ${req.method} ${req.originalUrl} -> http://localhost:3002${proxyReq.path}`);
    
    if (req.body && (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT')) {
      const bodyData = JSON.stringify(req.body);
      
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      
      proxyReq.write(bodyData);
      proxyReq.end();
      
      console.log(`[MENU] Body forwarded: ${bodyData.substring(0, 100)}...`);
    }
  },
  on: {
    proxyRes: (proxyRes, req, res) => {
      console.log(`[MENU] Response: ${proxyRes.statusCode}`);
    },
    error: (err, req, res) => {
      console.error('Menu Service error:', err.message);
      if (!res.headersSent) {
        res.status(503).json({ 
          success: false,
          error: 'Menu Service unavailable'
        });
      }
    }
  }
});

// Mount proxies
app.use(orderProxy);
app.use(menuProxy);

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