// routes/customerRoutes.js
const { createProxyMiddleware } = require('http-proxy-middleware');
const serviceRegistry = require('../config/serviceRegistry');

module.exports = (app) => {
  const customerProxy = createProxyMiddleware({
    target: serviceRegistry.customerService.url,
    changeOrigin: true,
    pathFilter: '/api/customers',
    pathRewrite: {
      '^/api/customers': '/customers'
    },

    onProxyReq: (proxyReq, req, res) => {
      console.log(`🔄 [CUSTOMER] ${req.method} ${req.originalUrl} -> ${serviceRegistry.customerService.url}${proxyReq.path}`);

      if (req.body && (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT')) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
        proxyReq.end();
        console.log(`[CUSTOMER] Body forwarded: ${bodyData.substring(0, 100)}...`);
      }
    },

    on: {
      proxyRes: (proxyRes, req, res) => {
        console.log(`[CUSTOMER] Response: ${proxyRes.statusCode}`);
      },
      error: (err, req, res) => {
        console.error('CUSTOMER Service error:', err.message);
        if (!res.headersSent) {
          res.status(503).json({
            success: false,
            error: 'CUSTOMER Service unavailable'
          });
        }
      }
    }
  });

  app.use(customerProxy);
};
