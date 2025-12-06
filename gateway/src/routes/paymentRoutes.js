const { createProxyMiddleware } = require('http-proxy-middleware');
const serviceRegistry = require('../config/serviceRegistry');

/**

Proxy routes cho payment-service
*/
module.exports = (app) => {
    const paymentProxy = createProxyMiddleware({
        target: serviceRegistry.paymentService.url, // giống orderService.url
        changeOrigin: true,

        // /api/payments/**  →  /payments/**
        pathFilter: '/api/payments',
        pathRewrite: {
            '^/api/payments': '/payments'
        },

        onProxyReq: (proxyReq, req, res) => {
            console.log(`🔄 [PAYMENT] ${req.method} ${req.originalUrl} -> ${serviceRegistry.paymentService.url}${proxyReq.path}`);
        }

    });

    app.use(paymentProxy);

};