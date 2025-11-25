import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../api/axiosInstance';

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

  const fetchOrders = useCallback(async (page = 1, status = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (status) params.append('status', status);
      
      const response = await api.get(`/api/orders?${params}`);
      
      // API trả về: { success: true, data: [...], pagination: {...} }
      if (!response.data.success) {
        throw new Error('Failed to fetch orders');
      }
      
      const { data, pagination } = response.data;
      
      console.log('✅ Fetched orders:', data);
      
      setOrders(Array.isArray(data) ? data : []);
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
      // Mock update - in real app, call API
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
      return false;
    }
  }, []);

  return (
    <OrderContext.Provider value={{ 
      orders, 
      loading, 
      error, 
      pagination,
      fetchOrders,
      updateOrderStatus
    }}>
      {children}
    </OrderContext.Provider>
  );
};

// ===================================
// LoadingSpinner Component
// ===================================
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
  </div>
);

// ===================================
// OrderCard Component
// ===================================
const OrderCard = ({ order, onStatusChange, darkMode }) => {
  const statusColors = {
    pending: 'bg-yellow-500',
    preparing: 'bg-blue-500',
    ready: 'bg-green-500',
    delivered: 'bg-gray-500',
    cancelled: 'bg-red-500'
  };

  const statusLabels = {
    pending: 'Pending',
    preparing: 'Preparing',
    ready: 'Ready',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };

  const handleStatusChange = (newStatus) => {
    if (window.confirm(`Change order status to ${statusLabels[newStatus]}?`)) {
      onStatusChange(order.OrderID, newStatus);
    }
  };

  return (
    <div className={`rounded-lg shadow-lg p-6 mb-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Order #{order.OrderID}
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {new Date(order.CreatedAt).toLocaleString('vi-VN')}
          </p>
        </div>
        <span className={`${statusColors[order.OrderStatus]} text-white px-4 py-2 rounded-full text-sm font-semibold`}>
          {statusLabels[order.OrderStatus]}
        </span>
      </div>

      {/* Customer Info */}
      <div className={`grid grid-cols-2 gap-4 mb-4 pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Customer</p>
          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {order.UserName || 'N/A'}
          </p>
        </div>
        <div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Contact</p>
          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {order.ContactNumber || 'N/A'}
          </p>
        </div>
        <div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Table</p>
          <p className={`font-semibold text-2xl ${darkMode ? 'text-pink-400' : 'text-pink-600'}`}>
            #{order.Items?.[0]?.TableNumber || 'N/A'}
          </p>
        </div>
        <div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
          <p className={`font-semibold text-xl ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
            {(order.TotalPrice || 0).toLocaleString('vi-VN')}đ
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="mb-4">
        <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Items ({order.Items.length})
        </h4>
        <div className="space-y-2">
          {order.Items.map((item, index) => (
            <div 
              key={index}
              className={`flex justify-between items-center p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <div className="flex-1">
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {item.ItemName}
                </span>
                <span className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  x{item.Quantity}
                </span>
              </div>
              <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {(item.Price * item.Quantity).toLocaleString('vi-VN')}đ
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {order.OrderStatus !== 'delivered' && order.OrderStatus !== 'cancelled' && (
        <div className="flex gap-2 flex-wrap">
          {order.OrderStatus === 'pending' && (
            <button
              onClick={() => handleStatusChange('preparing')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
            >
              Start Preparing
            </button>
          )}
          {order.OrderStatus === 'preparing' && (
            <button
              onClick={() => handleStatusChange('ready')}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition"
            >
              Mark Ready
            </button>
          )}
          {order.OrderStatus === 'ready' && (
            <button
              onClick={() => handleStatusChange('delivered')}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition"
            >
              Mark Delivered
            </button>
          )}
          <button
            onClick={() => handleStatusChange('cancelled')}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};