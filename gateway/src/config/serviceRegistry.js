// gateway/src/config/serviceRegistry.js
module.exports = {
  orderService: {
    url: process.env.ORDER_SERVICE_URL || 'http://localhost:3001/api/orders',
    name: 'Order Service',
    healthCheck: '/health'
  },
  menuService: {
    url: process.env.MENU_SERVICE_URL || 'http://localhost:3002',
    name: 'Menu Service',
    healthCheck: '/health'
  }
};