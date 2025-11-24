const userService = require('../services/customerService');
// const apiClient = require('../utils/apiClient');
const { clearCache, clearUserCache } = require('../middleware/cacheMiddleware');

const UserController = {
  async registerUser(req, res) {
    try {
      const id = await userService.registerUser(req.body);

      // Clear cache cho menu cụ thể và danh sách
      await clearCache('user:*');

      res.status(201).json({ message: 'User registered successfully', id });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async loginUser(req, res) {
    try {
      const user = await userService.loginUser(req.body);
      if (user) {
        const copy = { ...user };
        if (copy.Password) delete copy.Password;
        return res
          .status(200)
          .json({ message: 'Login successful', user: copy });
      } else res.status(401).json({ error: 'Invalid email or password' });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      // Remove password field before sending to clients
      const sanitized = users.map((u) => {
        const copy = { ...u };
        if (copy.Password) delete copy.Password;
        return copy;
      });
      res.status(200).json(sanitized);
    } catch (err) {
      console.error('GetAllUsers error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getUserById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      if (user) {
        const copy = { ...user };
        if (copy.Password) delete copy.Password;
        return res.status(200).json(copy);
      } else res.status(404).json({ error: 'User not found' });
    } catch (err) {
      console.error('GetUserById error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateUser(req, res) {
    try {
      const updated = await userService.updateUser(req.params.id, req.body);
      if (updated) {
        // Clear cache cho menu cụ thể và danh sách
        await clearUserCache(req.params.id);

        res.status(200).json({ message: 'User updated successfully' });
      } else res.status(404).json({ error: 'User not found' });
    } catch (err) {
      console.error('UpdateUser error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async deleteUser(req, res) {
    try {
      const deleted = await userService.deleteUser(req.params.id);
      if (deleted) {
        // Clear cache cho menu cụ thể và danh sách
        await clearUserCache(req.params.id);

        res.status(200).json({ message: 'User deleted successfully' });
      } else res.status(404).json({ error: 'User not found' });
    } catch (err) {
      console.error('DeleteUser error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const user = await userService.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await userService.updateUserStatus(id, isActive);

      // Clear cache khi thay đổi trạng thái
      await clearUserCache(id);
      
      res.status(200).json({
        message: 'User status updated successfully',
        isActive: isActive,
      });
    } catch (err) {
      console.error('UpdateUserStatus error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getUserRole(req, res) {
    try {
      const { id } = req.params;
      const role = await userService.getUserRole(id);

      if (!role) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({
        userId: id,
        role: role,
      });
    } catch (err) {
      console.error('GetUserRole error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getUserOrders(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      // First, verify user exists
      const user = await userService.getUserById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Gọi Order Service thông qua API Gateway
      const ordersData = await apiClient.get(`/api/orders/user/${id}`, {
        page,
        limit,
        status,
      });

      res.status(200).json({
        success: true,
        user: {
          id: user.UserID,
          name: user.userName,
          contact: user.ContactNumber,
          role: user.Role,
        },
        orders: ordersData.data,
        pagination: ordersData.pagination,
      });
    } catch (err) {
      console.error('Error fetching user orders:', err);

      if (err.message.includes('unavailable')) {
        return res.status(503).json({
          success: false,
          error: 'Order Service unavailable',
          message: 'Unable to fetch orders at this time',
        });
      }

      next(err);
    }
  },

  // Create order for user (via Order Service)
  async createUserOrder(req, res, next) {
    try {
      const { id } = req.params;
      const orderData = req.body;

      console.log('Dữ liệu' + orderData);

      // Kiểm tra người dùng có tồn tại?
      const user = await userService.getUserById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Chuẩn bị order data với user info
      const completeOrderData = {
        ...orderData,
        UserID: id,
        UserName: user.userName,
        ContactNumber: user.ContactNumber,
      };

      // Call Order Service via API Gateway
      const orderResult = await apiClient.post(
        '/api/orders',
        completeOrderData
      );

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        user: {
          id: user.UserID,
          name: user.userName,
        },
        order: orderResult.data,
      });
    } catch (err) {
      console.error('Error creating user order:', err);

      if (err.message.includes('unavailable')) {
        return res.status(503).json({
          success: false,
          error: 'Order Service unavailable',
          message: 'Unable to create order at this time',
        });
      }

      next(err);
    }
  },
};

module.exports = UserController;
