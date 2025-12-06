// D:\Restaurant-Management-System\services\payment-service\src\routes\paymentRoutes.js

const express = require('express');
const router = express.Router();
// Đảm bảo import đúng PaymentController
const paymentController = require('../controllers/paymentController'); 

// Create payment transaction
router.post('/create', paymentController.createPayment);

// Handle payment callback from bank
router.post('/callback', paymentController.handleCallback);

// Get payment by order ID
router.get('/order/:orderId', paymentController.getPaymentByOrder);

// Get payment by transaction ID
router.get('/transaction/:transactionId', paymentController.getPaymentByTransaction);

module.exports = router;