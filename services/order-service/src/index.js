// services/order-service/src/index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const orderRoutes = require('./routes/orderRoutes');
const errorHandler = require('./utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/orders', orderRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'order-service' });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Order Service running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Menu API: http://localhost:${PORT}/orders`);
  console.log(`----------------`);
});
