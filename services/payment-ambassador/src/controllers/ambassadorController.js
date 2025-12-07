// ============================================
// FILE: services/payment-ambassador/src/controllers/ambassadorController.js
// ============================================

const axios = require('axios');

// Lấy URL Payment Service từ .env
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005';

/**
 * Xử lý yêu cầu tạo giao dịch thanh toán từ Gateway
 * Forward request đến Payment Service với ĐÚNG ENDPOINT
 */
const createPayment = async (req, res, next) => {
    try {
        console.log(`✈️ Ambassador forwarding to Payment Service: ${PAYMENT_SERVICE_URL}/api/payments/create`);
        console.log('📦 Request body:', req.body);

        // 🔧 SỬA: Thêm /api/payments vào URL
        const response = await axios.post(
            `${PAYMENT_SERVICE_URL}/api/payments/create`,  // ✅ ĐÚNG ENDPOINT
            req.body,
            {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Payment Service response:', response.status);
        res.status(response.status).json(response.data);

    } catch (error) {
        if (error.response) {
            console.error('❌ Error from Payment Service:', error.response.status, error.response.data);
            return res.status(error.response.status).json(error.response.data);
        }
        
        console.error('❌ Connection error to Payment Service:', error.message);
        next(error); 
    }
};

/**
 * Xử lý callback từ Mock Bank
 * Forward đến Payment Service để update order status
 */
const handlePaymentCallback = async (req, res, next) => {
    try {
        console.log(`✈️ Ambassador forwarding callback to Payment Service`);
        console.log('📦 Callback data:', req.body);

        // 🔧 SỬA: Thêm /api/payments vào URL
        const response = await axios.post(
            `${PAYMENT_SERVICE_URL}/api/payments/callback`,  // ✅ ĐÚNG ENDPOINT
            req.body,
            {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Callback processed successfully');
        res.status(response.status).json(response.data);

    } catch (error) {
        if (error.response) {
            console.error('❌ Error from Payment Service:', error.response.status, error.response.data);
            return res.status(error.response.status).json(error.response.data);
        }
        
        console.error('❌ Connection error:', error.message);
        next(error); 
    }
};

/**
 * Get payment by order ID
 */
const getPaymentByOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        console.log(`✈️ Getting payment for order: ${orderId}`);

        const response = await axios.get(
            `${PAYMENT_SERVICE_URL}/api/payments/order/${orderId}`,  // ✅ ĐÚNG ENDPOINT
            { timeout: 5000 }
        );
        
        res.status(response.status).json(response.data);

    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        console.error('❌ Error:', error.message);
        next(error);
    }
};

/**
 * Get payment by transaction ID
 */
const getPaymentByTransaction = async (req, res, next) => {
    try {
        const { transactionId } = req.params;
        console.log(`✈️ Getting payment for transaction: ${transactionId}`);

        const response = await axios.get(
            `${PAYMENT_SERVICE_URL}/api/payments/transaction/${transactionId}`,  // ✅ ĐÚNG ENDPOINT
            { timeout: 5000 }
        );
        
        res.status(response.status).json(response.data);

    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        console.error('❌ Error:', error.message);
        next(error);
    }
};

/**
 * Xử lý Webhook khi nhận thông báo thanh toán (nếu cần)
 */
const handlePaymentWebhook = (req, res) => {
    try {
        const paymentData = req.body;
        console.log('🔔 Webhook received for payment:', paymentData.transactionId);
        
        const { orderId, status } = paymentData;

        if (!orderId || !status) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing orderId or status in webhook data.' 
            });
        }

        console.log(`📡 Update Order ${orderId} status: ${status}`);
        
        return res.status(200).json({ 
            success: true, 
            message: 'Webhook processed successfully' 
        });

    } catch (error) {
        console.error('❌ Error processing webhook:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Internal Server Error' 
        });
    }
};

/**
 * Health check status
 */
const getStatus = (req, res) => {
    res.json({
        service: 'Payment Ambassador Service',
        status: 'Operational',
        target: PAYMENT_SERVICE_URL,
        timestamp: new Date().toISOString()
    });
};

/**
 * WebSocket connection (if needed)
 */
const startWebSocketConnection = (req, res) => {
    console.log("🔗 Client requested WebSocket connection.");
    res.status(200).json({
        success: true,
        message: 'WebSocket handshake simulated'
    });
};

// Export all controllers
module.exports = {
    createPayment,
    handlePaymentCallback,
    getPaymentByOrder,
    getPaymentByTransaction,
    handlePaymentWebhook,
    getStatus,
    startWebSocketConnection
};