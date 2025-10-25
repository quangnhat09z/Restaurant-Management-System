const { createProxyMiddleware } = require('http-proxy-middleware');
const serviceRegistry = require('../config/serviceRegistry');

module.exports = (app) => {
  const menuProxy = createProxyMiddleware({
    target: serviceRegistry.menuService.url,
    changeOrigin: true,
    pathFilter: '/api/menu',
    pathRewrite: {
      '^/api/menu': '/menu'
    },

    onProxyReq: (proxyReq, req, res) => {
      console.log(`🔄 [MENU] ${req.method} ${req.originalUrl} -> ${serviceRegistry.menuService.url}${proxyReq.path}`);

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

  app.use(menuProxy);
};
