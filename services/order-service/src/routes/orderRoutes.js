// services/order-service/src/routes/orderRoutes.js
// ===================================
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const {
  preventDuplicateOrder,
  userOrderLimiter,
  tableOrderLimiter
} = require('../middleware/orderThrottling'); // NEW

// Create new order
// http://localhost:3001/orders/
// template
/* 
{
    "CustomerName": "Nguyễn Văn C",
    "ContactNumber": "0923456789",
    "TableNumber": 10,
    "Cart": [
      {
        "id": 1,
        "name": "Phở Bò",
        "Quantity": 2,
        "price": 50000
      },
      {
        "id": 2,
        "name": "Cà Phê Sữa Đá",
        "Quantity": 1,
        "price": 25000
      }
    ]
  }
  */
router.post('/',
  preventDuplicateOrder,     // Check duplicate
  userOrderLimiter,          // Per-user limit
  tableOrderLimiter,         // Per-table limit
  orderController.createOrder
);

// Get all orders (with pagination and filtering)
// http://localhost:3001/orders/
router.get('/', orderController.getOrders);

// Get order by ID
// http://localhost:3001/orders/1
router.get('/:id', orderController.getOrderById);

// Update order status
// http://localhost:3001/orders/1/status
// template
/*
    {"status": "cancelled"}
*/
router.patch('/:id/status',
  userOrderLimiter, // Prevent rapid status changes
  orderController.updateOrderStatus);

// Delete order
// http://localhost:3001/orders/1
router.delete('/:id', orderController.deleteOrder);

// Get order by userID
// http://localhost:3001/orders/user/7
router.get('/user/:userID',
  userOrderLimiter,
  orderController.getOrderByUserID);

module.exports = router;