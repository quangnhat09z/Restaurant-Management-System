const customerService = require('../services/customerService');

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
};

module.exports = CustomerController;
