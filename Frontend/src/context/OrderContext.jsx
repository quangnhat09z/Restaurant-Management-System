// frontend/src/context/OrderContext.jsx

import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../api/axiosInstance';
import { useOrderWebSocket } from '../hooks/userOrderWebSocket';

const OrderContext = createContext();

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrderContext must be used within OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  // WebSocket callbacks
  const handleNewOrder = useCallback((newOrder) => {
    console.log('🆕 Adding new order to list:', newOrder);
    setOrders(prevOrders => [newOrder, ...prevOrders]); // Add to beginning
  }, []);

  const handleStatusChange = useCallback((orderId, newStatus) => {
    console.log('🔄 [OrderContext] handleStatusChange called with orderId:', orderId, 'type:', typeof orderId, 'newStatus:', newStatus);
    const numericOrderId = typeof orderId === 'string' ? parseInt(orderId, 10) : orderId;
    console.log('   Converted to numeric:', numericOrderId);
    
    setOrders(prevOrders => {
      const updated = prevOrders.map(order =>
        order.OrderID === numericOrderId
          ? { ...order, OrderStatus: newStatus }
          : order
      );
      const changedOrder = updated.find(o => o.OrderID === numericOrderId);
      console.log('✅ [OrderContext] Updated. Order', numericOrderId, 'new status:', changedOrder?.OrderStatus);
      return updated;
    });
  }, []);

  const handleOrderCancelled = useCallback((orderId) => {
    console.log('❌ Removing cancelled order:', orderId);
    setOrders(prevOrders =>
      prevOrders.filter(order => order.OrderID !== orderId)
    );
  }, []);

  // Initialize WebSocket
  const { isConnected: wsConnected, error: wsError } = useOrderWebSocket(
    handleNewOrder,
    handleStatusChange,
    handleOrderCancelled
  );

  const fetchOrders = useCallback(async (page = 1, status = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (status) params.append('status', status);
      
      const response = await api.get(`/api/orders?${params}`);
      const { data, pagination } = response.data;
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      
      console.log('✅ Fetched orders:', data);
      
      setOrders(data);
      setPagination(pagination);
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      
      // WebSocket will handle the update, but we also update locally as fallback
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.OrderID === orderId
            ? { ...order, OrderStatus: newStatus }
            : order
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order status');
      return false;
    }
  }, []);

  return (
    <OrderContext.Provider value={{ 
      orders, 
      loading, 
      error, 
      pagination,
      wsConnected,
      wsError,
      fetchOrders,
      updateOrderStatus
    }}>
      {children}
    </OrderContext.Provider>
  );
};