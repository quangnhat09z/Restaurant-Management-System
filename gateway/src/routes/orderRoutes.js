const { createProxyMiddleware } = require('http-proxy-middleware');
const serviceRegistry = require('../config/serviceRegistry');

module.exports = (app) => {
  const orderProxy = createProxyMiddleware({
    target: serviceRegistry.orderService.url,
    changeOrigin: true,
    pathFilter: '/api/orders',
    pathRewrite: {
      '^/api/orders': '/orders'
    },

    onProxyReq: (proxyReq, req, res) => {
      console.log(`🔄 [ORDER] ${req.method} ${req.originalUrl} -> ${serviceRegistry.orderService.url}${proxyReq.path}`);

      if (req.body && (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT')) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
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

  app.use(orderProxy);
};
