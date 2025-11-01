// services/customer-service/src/index.js
require('dotenv').config();
const env = require('../../../Backend/environment'); // dùng chung file env như các service khác

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const customerRoutes = require('../src/routes/customerRoutes');
const errorHandler = require('./utils/errorHandler');

const app = express();
const PORT = env.PORT_CUSTOMER || 3003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/customers', customerRoutes); // => http://localhost:3003/customers/...

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'customer-service',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Customer-service not found' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Customer Service running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Customer API: http://localhost:${PORT}/customers`);
  console.log('----------------');
});
