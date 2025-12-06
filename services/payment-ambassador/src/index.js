// D:\Restaurant-Management-System\services\payment-ambassador\src\index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const ambassadorRoutes = require('./routes/ambassadorRoutes');
const { requestLogger } = require('./middleware/requestLogger'); // Dòng 5: Sử dụng Named Import

// 🔧 Load .env từ thư mục backend
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const app = express();
const PORT = process.env.PORT_PAYMENT_AMBASSADOR || 3004;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger); // Dòng 14: Sử dụng middleware
// Routes
app.use('/ambassador', ambassadorRoutes); // Dòng 16: Sử dụng router

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'Payment Ambassador is running', 
        port: PORT,
        target: process.env.PAYMENT_SERVICE_URL,
        devUser: process.env.DEV_USER
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Ambassador Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Ambassador service error'
    });
});

app.listen(PORT, () => {
    console.log(`🛡️ Payment Ambassador running on port ${PORT}`);
    console.log(`🎯 Targeting: ${process.env.PAYMENT_SERVICE_URL}`);
    console.log(`👤 Dev User: ${process.env.DEV_USER}`);
});