import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../api/axiosInstance';

const OrderContext = createContext();

export const useOrderContext = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Hàm fetch orders có thể gọi từ bất kỳ đâu
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    
    try {
      const response = await api.get('/api/orders');
      const data = response.data;
      console.log('Fetched order items:', data);
      
      // Handle different response formats
      const orderData = data.orders || data.data || data || [];
      setOrderItems(Array.isArray(orderData) ? orderData : []);
    } catch (error) {
      console.error('Error fetching order items:', error);
      setFetchError('Failed to fetch order items.');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <OrderContext.Provider value={{ 
      orderItems, 
      setOrderItems, 
      fetchOrders,
      loading,
      fetchError 
    }}>
      {children}
    </OrderContext.Provider>
  );
};