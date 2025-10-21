// gateway/src/config/serviceRegistry.js
module.exports = {
  orderService: {
    url: process.env.ORDER_SERVICE_URL || 'http://order-service:3001',
    name: 'Order Service',
    healthCheck: '/health'
  },
  menuService: {
    url: process.env.MENU_SERVICE_URL || 'http://menu-service:3002',
    name: 'Menu Service',
    healthCheck: '/health'
  }
};