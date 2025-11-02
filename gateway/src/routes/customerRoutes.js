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
        }
    }
    )
    app.use(customerProxy);
};
