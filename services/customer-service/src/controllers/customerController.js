const customerService = require('../services/customerService');
const apiClient = require('../utils/apiClient').default;

const CustomerController = {
  async registerCustomer(req, res) {
    try {
      const id = await customerService.registerCustomer(req.body);
      res.status(201).json({ message: 'Customer registered successfully', id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async loginCustomer(req, res) {
    try {
      const customer = await customerService.loginCustomer(req.body);
      if (customer) res.status(200).json({ message: 'Login successful', customer });
      else res.status(401).json({ error: 'Invalid email or password' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getAllCustomers(req, res) {
    try {
      const customers = await customerService.getAllCustomers();
      res.status(200).json(customers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getCustomerById(req, res) {
    try {
      const customer = await customerService.getCustomerById(req.params.id);
      if (customer) res.status(200).json(customer);
      else res.status(404).json({ error: 'Customer not found' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async updateCustomer(req, res) {
    try {
      const updated = await customerService.updateCustomer(req.params.id, req.body);
      if (updated) res.status(200).json({ message: 'Customer updated successfully' });
      else res.status(404).json({ error: 'Customer not found' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async deleteCustomer(req, res) {
    try {
      const deleted = await customerService.deleteCustomer(req.params.id);
      if (deleted) res.status(200).json({ message: 'Customer deleted successfully' });
      else res.status(404).json({ error: 'Customer not found' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getCustomerOrders(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      // First, verify customer exists
      const customer = await customerService.getCustomerById(id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }

      // Gọi Order Service thông qua API Gateway
      const ordersData = await apiClient.get(`/api/orders/customer/${id}`, {
        page,
        limit,
        status
      });

      res.status(200).json({
        success: true,
        customer: {
          id: customer.CustomerID,
          name: customer.CustomerName,
          contact: customer.ContactNumber
        },
        orders: ordersData.data,
        pagination: ordersData.pagination
      });
    } catch (err) {
      console.error('Error fetching customer orders:', err);
      
      if (err.message.includes('unavailable')) {
        return res.status(503).json({
          success: false,
          error: 'Order Service unavailable',
          message: 'Unable to fetch orders at this time'
        });
      }
      
      next(err);
    }
  },

  // Create order for customer (via Order Service)
  async createCustomerOrder(req, res, next) {
    try {
      const { id } = req.params;
      const orderData = req.body;

      console.log("Dữ liệu" + orderData);

      // Kiểm tra khách hàng có tồn tại?
      const customer = await customerService.getCustomerById(id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }
      
      // Chuẩn bị order data với customer info
      const completeOrderData = {
        ...orderData,
        CustomerID: id,
        CustomerName: customer.CustomerName,
        ContactNumber: customer.ContactNumber
      };

      // Call Order Service via API Gateway
      const orderResult = await apiClient.post('/api/orders', completeOrderData);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        customer: {
          id: customer.CustomerID,
          name: customer.CustomerName
        },
        order: orderResult.data
      });
    } catch (err) {
      console.error('Error creating customer order:', err);
      
      if (err.message.includes('unavailable')) {
        return res.status(503).json({
          success: false,
          error: 'Order Service unavailable',
          message: 'Unable to create order at this time'
        });
      }
      
      next(err);
    }
  },

};

module.exports = CustomerController;
