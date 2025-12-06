// D:\Restaurant-Management-System\services\payment-ambassador\src\routes\ambassadorRoutes.js

const express = require('express');
const router = express.Router();
const ambassadorController = require('../controllers/ambassadorController');

// 0. Endpoint Khởi tạo Thanh toán (SỬA LỖI 404)
// Khi Gateway chuyển tiếp, request POST /api/payments/create sẽ thành POST /create
router.post('/create', ambassadorController.createPayment); // 🆕 THÊM DÒNG NÀY

// 1. Endpoint Webhook: Nhận thông báo thanh toán
router.post('/webhook', ambassadorController.handlePaymentWebhook); 

// 2. Endpoint kiểm tra tình trạng kết nối WebSocket 
router.get('/ws-connect', ambassadorController.startWebSocketConnection); 

// 3. Endpoint kiểm tra tình trạng dịch vụ (Health check)
router.get('/status', ambassadorController.getStatus); 

module.exports = router;