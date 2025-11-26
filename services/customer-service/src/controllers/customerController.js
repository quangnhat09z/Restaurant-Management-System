// services/customer-service/src/controllers/customerController.js
const userService = require('../services/customerService');
const tokenService = require('../services/tokenService');
const apiClient = require('../utils/apiClient');
const { clearCache, clearUserCache } = require('../middleware/cacheMiddleware');

const UserController = {
  async registerUser(req, res) {
    try {
      const id = await userService.registerUser(req.body);
      await clearCache('user:*');

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        userID: id,
      });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  },

  async loginUser(req, res) {
    try {
      const user = await userService.loginUser(req.body);
      if (user) {
        const copy = { ...user };
        if (copy.password) delete copy.password;

        // Tạo tokens
        const accessToken = tokenService.createAccessToken(user);
        const refreshToken = tokenService.createRefreshToken(user);

        // Lưu refresh token vào Redis
        await tokenService.saveRefreshToken(user.userID, refreshToken);

        return res.status(200).json({
          success: true,
          message: 'Login successful',
          user: copy,
          accessToken,
          refreshToken,
          expiresIn: '15m',
        });
      } else {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  },

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token required',
        });
      }

      const newAccessToken = await tokenService.refreshAccessToken(
        refreshToken
      );

      res.status(200).json({
        success: true,
        accessToken: newAccessToken,
        expiresIn: '15m',
      });
    } catch (err) {
      console.error('Refresh token error:', err);
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }
  },

  async logoutUser(req, res) {
    try {
      const { userID } = req.user;

      // Xóa refresh token
      await tokenService.removeRefreshToken(userID);

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (err) {
      console.error('Logout error:', err);
      res.status(500).json({
        success: false,
        error: 'Logout failed',
      });
    }
  },

  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      const sanitized = users.map((u) => {
        const copy = { ...u };
        if (copy.password) delete copy.password;
        return copy;
      });
      res.status(200).json({
        success: true,
        data: sanitized,
      });
    } catch (err) {
      console.error('GetAllUsers error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  },

  async getUserById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      if (user) {
        const copy = { ...user };
        if (copy.password) delete copy.password;
        return res.status(200).json({
          success: true,
          data: copy,
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }
    } catch (err) {
      console.error('GetUserById error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  },

  async updateUser(req, res) {
    try {
      const updated = await userService.updateUser(req.params.id, req.body);
      if (updated) {
        await clearUserCache(req.params.id);
        res.status(200).json({
          success: true,
          message: 'User updated successfully',
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }
    } catch (err) {
      console.error('UpdateUser error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  },

  async deleteUser(req, res) {
    try {
      const deleted = await userService.deleteUser(req.params.id);
      if (deleted) {
        await clearUserCache(req.params.id);
        await tokenService.removeRefreshToken(req.params.id);

        res.status(200).json({
          success: true,
          message: 'User deleted successfully',
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }
    } catch (err) {
      console.error('DeleteUser error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  },

  async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const user = await userService.getUserById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      await userService.updateUserStatus(id, isActive);
      await clearUserCache(id);

      // Nếu deactivate, xóa token
      if (!isActive) {
        await tokenService.removeRefreshToken(id);
      }

      res.status(200).json({
        success: true,
        message: 'User status updated successfully',
        isActive: isActive,
      });
    } catch (err) {
      console.error('UpdateUserStatus error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  },

  async getUserRole(req, res) {
    try {
      const { id } = req.params;
      const role = await userService.getUserRole(id);

      if (!role) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        userID: id,
        role: role,
      });
    } catch (err) {
      console.error('GetUserRole error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  },

  async getUserOrders(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      const user = await userService.getUserById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      const ordersData = await apiClient.get(`/api/orders/user/${id}`, {
        page,
        limit,
        status,
      });

      res.status(200).json({
        success: true,
        user: {
          id: user.userID,
          name: user.userName,
          contact: user.contactNumber,
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

  async createUserOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { TableNumber, Cart } = req.body;

      if (!TableNumber || !Cart || Cart.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'TableNumber and Cart are required',
        });
      }

      const isValidCart = Cart.every(
        (item) =>
          item.id &&
          typeof item.id === 'number' &&
          item.Quantity &&
          typeof item.Quantity === 'number' &&
          item.Quantity > 0
      );

      if (!isValidCart) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Cart',
          message:
            'Each cart item must have id (number) and Quantity (positive number)',
        });
      }

      console.log('📦 Received Cart:', Cart);

      const user = await userService.getUserById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      console.log('✅ User found:', user.userName);

      console.log('📄 Fetching menu items from Menu Service...');

      const enrichedCart = await Promise.all(
        Cart.map(async (item) => {
          try {
            const menuItem = await apiClient.get(`/api/menu/${item.id}`);

            if (!menuItem) {
              throw new Error(`Menu item with id ${item.id} not found`);
            }

            const recipe = menuItem;

            return {
              id: recipe.id,
              name: recipe.name,
              Quantity: item.Quantity,
              price: recipe.price,
            };
          } catch (error) {
            console.error(
              `❌ Error fetching menu item ${item.id}:`,
              error.message
            );
            throw new Error(`Invalid menu item: ${item.id}`);
          }
        })
      );

      console.log('✅ Enriched Cart:', enrichedCart);

      const completeOrderData = {
        UserID: id,
        UserName: user.userName,
        ContactNumber: user.contactNumber,
        TableNumber,
        Cart: enrichedCart,
      };

      console.log('🚀 Calling Order Service with data:', completeOrderData);

      const orderResult = await apiClient.post(
        '/api/orders',
        completeOrderData
      );

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        user: {
          id: user.userID,
          name: user.userName,
        },
        order: orderResult.data,
      });
    } catch (err) {
      console.error('❌ Error creating user order:', err);

      if (err.message.includes('Menu item')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Menu Item',
          message: err.message,
        });
      }

      if (err.message.includes('not available')) {
        return res.status(400).json({
          success: false,
          error: 'Menu Item Unavailable',
          message: err.message,
        });
      }

      if (err.message.includes('unavailable')) {
        return res.status(503).json({
          success: false,
          error: 'Service unavailable',
          message: 'Unable to create order at this time',
        });
      }

      next(err);
    }
  },
};

module.exports = UserController;
