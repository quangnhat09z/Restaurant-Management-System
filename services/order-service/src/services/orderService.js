// services/order-service/src/services/orderService.js
// ===================================
const db = require('../database/db');

class OrderService {
  async createOrder(orderData) {
    const {UserID, ContactNumber, TableNumber, UserName, Cart } = orderData;

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Calculate total price
      const TotalPrice = Cart.reduce((sum, item) =>
        sum + (item.price * item.Quantity), 0
      );

      // Insert into bill table with prepared statement
      const [billResult] = await connection.query(
        `INSERT INTO bill (UserID, UserName, ContactNumber, TotalPrice, OrderStatus, CreatedAt) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [UserID, UserName, ContactNumber, TotalPrice, 'pending']
      );

      const OrderID = billResult.insertId;

      // Insert items with prepared statements
      const itemPromises = Cart.map(item =>
        connection.query(
          `INSERT INTO item (OrderID, ItemName, TableNumber, Quantity, Price) 
           VALUES (?, ?, ?, ?, ?)`,
          [OrderID, item.name, TableNumber, item.Quantity, item.price]
        )
      );

      await Promise.all(itemPromises);
      await connection.commit();

      console.log(`✅ Order created successfully: OrderID ${OrderID}`);

      return {
        OrderID,
        UserID,
        UserName,
        ContactNumber,
        TotalPrice,
        TableNumber,
        OrderStatus: 'pending',
        Items: Cart,
        CreatedAt: new Date()
      };
    } catch (error) {
      await connection.rollback();
      console.error('❌ Order creation failed:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async getOrders(page = 1, limit = 10, status = null) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT 
        b.OrderID, 
        b.UserID,
        b.UserName,
        b.ContactNumber, 
        b.TotalPrice, 
        b.OrderStatus,
        b.CreatedAt,
        b.UpdatedAt
      FROM bill b
    `;

    const params = [];

    if (status) {
      query += ' WHERE b.OrderStatus = ?';
      params.push(status);
    }

    query += ' ORDER BY b.CreatedAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [orders] = await db.query(query, params);

    // Get items for each order
    for (let order of orders) {
      const [items] = await db.query(
        'SELECT ItemName, Quantity, Price, TableNumber FROM item WHERE OrderID = ?',
        [order.OrderID]
      );
      order.Items = items;
    }

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM bill';
    if (status) {
      countQuery += ' WHERE OrderStatus = ?';
    }
    const [countResult] = await db.query(countQuery, status ? [status] : []);

    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  }

  async getOrderById(id) {
    const [orders] = await db.query(
      `SELECT 
        b.OrderID, 
        b.userID,
        b.UserName, 
        b.ContactNumber, 
        b.TotalPrice, 
        b.OrderStatus,
        b.CreatedAt,
        b.UpdatedAt
      FROM bill b
      WHERE b.OrderID = ?`,
      [id]
    );

    if (orders.length === 0) {
      return null;
    }

    const order = orders[0];

    // Get items
    const [items] = await db.query(
      'SELECT ItemName, Quantity, Price, TableNumber FROM item WHERE OrderID = ?',
      [id]
    );

    order.Items = items;
    return order;
  }

  async getOrderByUserID(userID) {
    const [orders] = await db.query(
      `SELECT * FROM bill WHERE userID = ?`,
      [userID]
    );

    if (orders.length === 0) {
      return null;
    };

    return orders;
  }

  async updateOrderStatus(id, status) {
    const [result] = await db.query(
      'UPDATE bill SET OrderStatus = ?, UpdatedAt = NOW() WHERE OrderID = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Order not found');
    }

    console.log(`✅ Order ${id} status updated to: ${status}`);
    return { OrderID: id, OrderStatus: status };
  }

  async deleteOrder(id) {
    // Items will be deleted automatically due to CASCADE
    const [result] = await db.query(
      'DELETE FROM bill WHERE OrderID = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Order not found');
    }

    console.log(`✅ Order ${id} deleted successfully`);
    return { OrderID: id, deleted: true };
  }
}

module.exports = new OrderService();