// D:\Restaurant-Management-System\services\payment-ambassador\src\controllers\ambassadorController.js

/**
 * Xử lý Webhook khi nhận thông báo thanh toán thành công/thất bại.
 */
const axios = require('axios');
const handlePaymentWebhook = (req, res) => {
    try {
        const paymentData = req.body;
        
        // Logic xử lý và xác thực dữ liệu
        console.log('🔔 Webhook received for payment:', paymentData.transactionId);
        
        const { orderId, status } = paymentData;

        if (!orderId || !status) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing orderId or status in webhook data.' 
            });
        }

        // Gọi API/Service để cập nhật trạng thái Order và thông báo real-time
        console.log(`📡 Cập nhật trạng thái Order ${orderId} thành: ${status}`);
        
        return res.status(200).json({ 
            success: true, 
            message: 'Webhook processed successfully' 
        });

    } catch (error) {
        console.error('❌ Error processing payment webhook:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Internal Server Error' 
        });
    }
};

/**
 * Xử lý yêu cầu tạo giao dịch thanh toán từ Frontend (Gateway đã chuyển tiếp).
 * Chuyển tiếp request này đến Payment Service thực sự (cổng 3005).
 * 🆕 THÊM HÀM NÀY ĐỂ FIX LỖI TypeError
 */
const createPayment = async (req, res, next) => {
    try {
        // Lấy URL của Payment Service từ biến môi trường
        const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005';
        
        console.log(`✈️ Chuyển tiếp yêu cầu tạo thanh toán tới Payment Service: ${PAYMENT_SERVICE_URL}/create`);

        // GỌI API ĐẾN PAYMENT SERVICE (http://localhost:3005/create)
        const response = await axios.post(`${PAYMENT_SERVICE_URL}/create`, req.body);
        
        // Trả về phản hồi nguyên vẹn từ Payment Service cho Gateway/Frontend
        res.status(response.status).json(response.data);

    } catch (error) {
        // Xử lý lỗi Axios: Lỗi từ Payment Service sẽ nằm trong error.response
        if (error.response) {
            console.error('❌ Lỗi 4xx/5xx từ Payment Service:', error.response.status, error.response.data);
            // Trả về lỗi của Payment Service (400, 500, v.v.) cho Frontend
            return res.status(error.response.status).json(error.response.data);
        }
        
        // Xử lý lỗi kết nối chung hoặc lỗi code
        console.error('❌ Lỗi kết nối đến Payment Service hoặc lỗi code:', error.message);
        next(error); 
    }
};

/**
 * Endpoint này chỉ mô phỏng việc thiết lập kết nối WebSocket.
 */
const startWebSocketConnection = (req, res) => {
    console.log("🔗 Client requested WebSocket connection.");
    
    res.status(200).json({
        success: true,
        message: 'WebSocket handshake simulated. Use ws://... to connect to the WS server.'
    });
};

/**
 * Endpoint kiểm tra tình trạng kết nối của Ambassador Service
 */
const getStatus = (req, res) => {
    res.json({
        service: 'Payment Ambassador Service',
        status: 'Operational',
        timestamp: new Date().toISOString()
    });
};

// Đã sửa lỗi: Export TẤT CẢ các hàm controller được sử dụng trong routes
module.exports = {
    handlePaymentWebhook,
    getStatus,
    startWebSocketConnection,
    createPayment // <--- Đã được thêm vào và export
};