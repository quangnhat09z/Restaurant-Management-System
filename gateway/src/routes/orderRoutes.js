// routes/orderRoutes.js
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
    }
  }
  )
  app.use(orderProxy);
};
