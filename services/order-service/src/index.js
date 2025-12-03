// services/order-service/src/index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const orderRoutes = require('./routes/orderRoutes');
const errorHandler = require('./utils/errorHandler');
const wsServer = require('./websocket/OrderWebSocket');
const env = require('../../../Backend/environment');

console.log('✅ WebSocket Server loaded');
console.log('   Type:', typeof wsServer);
console.log('   Initialize:', typeof wsServer?.initialize);

const app = express();
const PORT = env.PORT_ORDER;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/orders', orderRoutes);

// Health check
app.get('/health', (req, res) => {
  const wsStats = wsServer.getStats();
  res.status(200).json({ status: 'OK', service: 'order-service',   websocket: wsStats, timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);


// CREATE HTTP SERVER
const server = http.createServer(app);

// INITIALIZE WEBSOCKET
wsServer.initialize(server);

// START SERVER
server.listen(PORT, () => {
  console.log(`✅ Order Service running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Orders API: http://localhost:${PORT}/orders`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`----------------`);
});