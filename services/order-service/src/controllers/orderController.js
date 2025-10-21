// services/order-service/src/controllers/orderController.js
// ===================================
const orderService = require('../services/orderService');
const { validateOrder, validateUpdateStatus } = require('../validators/orderValidator');

class OrderController {
  async createOrder(req, res, next) {
    try {
      // Validate request
      const { error, value } = validateOrder(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Validation Error', 
          details: error.details.map(d => d.message) 
        });
      }

      const order = await orderService.createOrder(value);
      res.status(201).json({ 
        success: true,
        message: 'Order created successfully', 
        data: order 
      });
    } catch (err) {
      next(err);
    }
  }

  async getOrders(req, res, next) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const result = await orderService.getOrders(page, limit, status);
      res.status(200).json({ 
        success: true,
        data: result.orders,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ 
          success: false,
          error: 'Order not found' 
        });
      }
      
      res.status(200).json({ 
        success: true,
        data: order 
      });
    } catch (err) {
      next(err);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      
      // Validate status
      const { error, value } = validateUpdateStatus(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Validation Error', 
          details: error.details.map(d => d.message) 
        });
      }
      
      const updated = await orderService.updateOrderStatus(id, value.status);
      res.status(200).json({ 
        success: true,
        message: 'Order status updated successfully', 
        data: updated 
      });
    } catch (err) {
      if (err.message === 'Order not found') {
        return res.status(404).json({ 
          success: false,
          error: 'Order not found' 
        });
      }
      next(err);
    }
  }

  async deleteOrder(req, res, next) {
    try {
      const { id } = req.params;
      const result = await orderService.deleteOrder(id);
      res.status(200).json({ 
        success: true,
        message: 'Order deleted successfully', 
        data: result 
      });
    } catch (err) {
      if (err.message === 'Order not found') {
        return res.status(404).json({ 
          success: false,
          error: 'Order not found' 
        });
      }
      next(err);
    }
  }
}

module.exports = new OrderController();