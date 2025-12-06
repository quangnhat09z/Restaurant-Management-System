// D:\Restaurant-Management-System\services\payment-ambassador\src\middleware\requestLogger.js

/**
 * Hàm middleware ghi log các request đến service.
 */
const requestLogger = (req, res, next) => {
    // Ghi log chi tiết về request
    console.log(`[REQUEST] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    
    // Rất quan trọng: gọi next() để chuyển request sang middleware/route tiếp theo
    next(); 
};

// Sử dụng Named Export để khớp với cách import trong index.js
module.exports = {
    requestLogger
};