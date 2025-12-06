// D:\Restaurant-Management-System\services\payment-service\src\services\paymentService.js

// Thư viện để tạo ID duy nhất
const { v4: uuidv4 } = require('uuid');

/**
 * [MOCK FUNCTION] Mô phỏng việc tạo giao dịch thanh toán
 * và trả về một URL chứa mã QR ngẫu nhiên (Payment URL).
 */
const createPayment = async ({ OrderID, Amount, PaymentMethod }) => {
    
    // 1. Tạo Transaction ID ngẫu nhiên
    const transactionId = uuidv4();
    
    // 2. Tạo URL mô phỏng QR code (sử dụng một URL ảnh QR code giả)
    // Trong thực tế, URL này sẽ trỏ đến cổng thanh toán hoặc hình ảnh QR code
    const mockQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PAYMENT_ID:${transactionId}_ORDER:${OrderID}_AMOUNT:${Amount}`;

    console.log(`[MOCK SERVICE] Created payment transaction: ${transactionId} for OrderID: ${OrderID}`);

    // 3. Trả về dữ liệu cần thiết
    return {
        transactionId: transactionId,
        paymentUrl: mockQrUrl,
        status: 'pending',
        amount: Amount,
        orderId: OrderID,
        createdAt: new Date().toISOString()
    };
};

/**
 * [MOCK FUNCTION] Mô phỏng xử lý Callback (không cần thay đổi)
 */
const handlePaymentCallback = async (transactionId, status) => {
    console.log(`[MOCK SERVICE] Callback received for ${transactionId} with status: ${status}`);
    return { transactionId, status, message: "Mock callback processed." };
};

// Mặc dù không sử dụng, vẫn mock để Controller không bị lỗi khi gọi
const getPaymentByOrderId = async (orderId) => {
    return null; 
};

const getPaymentByTransactionId = async (transactionId) => {
    return null;
};


module.exports = {
    createPayment,
    handlePaymentCallback,
    getPaymentByOrderId,
    getPaymentByTransactionId
};