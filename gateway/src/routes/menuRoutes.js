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
    }
  }
  )
  app.use(menuProxy);
};
