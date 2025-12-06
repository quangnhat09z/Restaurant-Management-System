const express = require('express');
const cors = require('cors');
const path = require('path');
const paymentRoutes = require('./routes/paymentRoutes');

// 🔧 Load .env từ thư mục backend (parent của services)
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const app = express();
const PORT = process.env.PORT_PAYMENT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Payment Service is running', 
    port: PORT,
    devUser: process.env.DEV_USER 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Payment Service Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`💳 Payment Service running on port ${PORT}`);
  console.log(`👤 Dev User: ${process.env.DEV_USER}`);
});
