// D:\Restaurant-Management-System\services\payment-service\src\controllers\paymentController.js

const paymentService = require('../services/paymentService');

class PaymentController {
    /**
     * Xử lý yêu cầu tạo thanh toán. Sử dụng Mock Service để tạo URL QR.
     */
    async createPayment(req, res, next) {
        try {
            const { OrderID, Amount, PaymentMethod } = req.body;

            if (!OrderID || !Amount) {
                return res.status(400).json({
                    success: false,
                    error: 'OrderID and Amount are required'
                });
            }

            // Gọi đến service mô phỏng
            const payment = await paymentService.createPayment({
                OrderID,
                Amount,
                PaymentMethod
            });

            // Trả về dữ liệu, bao gồm URL thanh toán để Frontend hiển thị QR
            res.status(201).json({
                success: true,
                message: 'Payment transaction created (MOCK QR READY)',
                data: payment,
                paymentUrl: payment.paymentUrl // <--- Frontend sẽ dùng URL này
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Xử lý callback từ ngân hàng (Mocked)
     */
    async handleCallback(req, res, next) {
        try {
            const { transactionId, status } = req.body;

            if (!transactionId || !status) {
                return res.status(400).json({
                    success: false,
                    error: 'transactionId and status are required'
                });
            }

            const result = await paymentService.handlePaymentCallback(
                transactionId,
                status
            );

            res.status(200).json({
                success: true,
                message: 'Payment callback processed (MOCK)',
                data: result
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Lấy thông tin thanh toán theo Order ID (Mocked)
     */
    async getPaymentByOrder(req, res, next) {
        try {
            const { orderId } = req.params;
            const payment = await paymentService.getPaymentByOrderId(orderId);

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    error: 'Payment not found (MOCK)'
                });
            }

            res.status(200).json({
                success: true,
                data: payment
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Lấy thông tin thanh toán theo Transaction ID (Mocked)
     */
    async getPaymentByTransaction(req, res, next) {
        try {
            const { transactionId } = req.params;
            const payment = await paymentService.getPaymentByTransactionId(transactionId);

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    error: 'Transaction not found (MOCK)'
                });
            }

            res.status(200).json({
                success: true,
                data: payment
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new PaymentController();