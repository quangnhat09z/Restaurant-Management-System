// D:\Restaurant-Management-System\gateway\src\routes\paymentRoutes.js

const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

// Đảm bảo .env đã được tải trước đó (thường là trong index.js, nhưng thêm vào đây để dự phòng)
// require('dotenv').config({ path: path.join(__dirname, '../../../Backend/.env') });

// Lấy URL của Payment Ambassador từ biến môi trường
const PAYMENT_AMBASSADOR_URL = process.env.PAYMENT_AMBASSADOR_URL || 'http://localhost:3004'; 

/**
 * Thiết lập proxy middleware cho tất cả các endpoint liên quan đến thanh toán.
 * @param {object} app - Đối tượng Express application.
 */
const setupPaymentRoutes = (app) => {
    
    // Kiểm tra: Đảm bảo Payment Ambassador URL đã được định nghĩa
    if (!PAYMENT_AMBASSADOR_URL) {
        console.error("⚠️ ERROR: PAYMENT_AMBASSADOR_URL is missing. Payment routes will not be proxied.");
        return;
    }
    
    console.log(`🔗 Setting up Payment proxy -> ${PAYMENT_AMBASSADOR_URL}`);

    const paymentProxy = createProxyMiddleware({
        target: PAYMENT_AMBASSADOR_URL, // http://localhost:3004
        changeOrigin: true,
        // SỬA LỖI 404: Cắt bỏ hoàn toàn '/api/payments'
        // Chuyển /api/payments/create thành /create
        pathRewrite: {
            '^/api/payments': ''
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log(`🌐 Gateway → Ambassador: ${req.method} ${proxyReq.path}`);
        },
        onProxyRes: (proxyRes, req, res) => {
            console.log(`✅ Ambassador → Gateway: ${proxyRes.statusCode}`);
        },
        onError: (err, req, res) => {
            console.error(`❌ Payment proxy error:`, err.message);
            res.status(503).json({
                success: false,
                error: 'Payment service temporarily unavailable',
                message: err.message
            });
        },
        timeout: 15000
    });

    app.use('/api/payments', paymentProxy);
    console.log('✅ Payment routes configured');
};

module.exports = setupPaymentRoutes;