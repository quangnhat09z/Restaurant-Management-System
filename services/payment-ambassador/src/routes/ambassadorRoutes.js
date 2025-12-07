// ============================================
// FILE: services/payment-ambassador/src/routes/ambassadorRoutes.js
// ============================================

const express = require('express');
const router = express.Router();
const {
    createPayment,
    handlePaymentCallback,
    getPaymentByOrder,
    getPaymentByTransaction,
    handlePaymentWebhook,
    getStatus,
    startWebSocketConnection
} = require('../controllers/ambassadorController');

// Health check
router.get('/status', getStatus);

// Payment routes - Forward to Payment Service
router.post('/payments/create', createPayment);
router.post('/payments/callback', handlePaymentCallback);
router.get('/payments/order/:orderId', getPaymentByOrder);
router.get('/payments/transaction/:transactionId', getPaymentByTransaction);

// Webhook handler (nếu có payment gateway thật)
router.post('/webhook', handlePaymentWebhook);

// WebSocket connection (nếu cần)
router.post('/ws-connect', startWebSocketConnection);

module.exports = router;