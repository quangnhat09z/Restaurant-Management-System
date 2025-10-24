// services/menu-service/src/index.js
// ===================================

require('dotenv').config();

// Su dung bien moi truong o day
const env = require('../src/environment');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const menuRoutes = require('../src/routes/menuRoutes');
const errorHandler = require('./utils/errorHandler');

const app = express();
const PORT = env.PORT_MENU || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes

// menu
app.use('/api/menu', menuRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'menu-service',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Menu-service not found' });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Menu Service running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Menu API: http://localhost:${PORT}/api/menu`);
  console.log(`----------------`);
});
