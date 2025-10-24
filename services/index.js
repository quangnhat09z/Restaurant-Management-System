// services/order-service/src/index.js
// ===================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const orderRoutes = require('./order-service/src/routes/orderRoutes');
const menuRoutes= require('./menu-service/src/routes/menuRoutes');
const errorHandler = require('./order-service/src/utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes

// menu
app.use('/menu', menuRoutes);

// order
app.use('/orders', orderRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'order-service',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Order Service running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Orders API: http://localhost:${PORT}orders`);
  console.log(`🔗 Menu API: http://localhost:${PORT}menu`);
  console.log(`----------------`)
});