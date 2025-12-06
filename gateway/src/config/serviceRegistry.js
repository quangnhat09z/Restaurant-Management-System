// ===================================
// gateway/src/config/serviceRegistry.js (FIXED)
// ===================================
module.exports = {
  orderService: {
    url: process.env.ORDER_SERVICE_URL || 'http://localhost:3001',
    name: 'Order Service',
    healthCheck: '/health'
  },
  menuService: {
    url: process.env.MENU_SERVICE_URL || 'http://localhost:3002',
    name: 'Menu Service',
    healthCheck: '/health'
  },
  customerService: {
    url: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3003',
    name: 'Customer Service',
    healthCheck: '/health'
  },
  paymentAmbassador: {
    url: process.env.PAYMENT_AMBASSADOR_URL || 'http://localhost:3004',
    name: 'Payment Ambassador',
    healthCheck: '/health'}
  ,
  paymentService: {
    url: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3005',
    name: 'Payment Service',
    healthCheck: '/health'
  }
  
};