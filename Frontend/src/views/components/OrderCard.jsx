// frontend/src/components/OrderCard.jsx
import React, { useState } from 'react';
import api from '../../api/axiosInstance';

const OrderCard = ({ order, onStatusChange, darkMode }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  // Log order status for debugging
  React.useEffect(() => {
    console.log('📦 OrderCard rendered with order:', order.OrderID, 'Status:', order.OrderStatus);
  }, [order]);

  const statusColors = {
    pending: 'bg-yellow-500',
    preparing: 'bg-blue-500',
    ready: 'bg-green-500',
    delivered: 'bg-gray-500',
    cancelled: 'bg-red-500'
  };

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Change order to ${newStatus}?`)) {
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      console.log('📝 Updating order:', order.OrderID, 'to status:', newStatus);
      
      // Gọi API để cập nhật status
      const response = await api.patch(`/api/orders/${order.OrderID}/status`, {
        status: newStatus
      });

      console.log('✅ Order status updated via API:', response.data);

      // Cập nhật UI bằng callback từ parent
      const result = await onStatusChange(order.OrderID, newStatus);
      console.log('✅ Parent callback result:', result);

      // Hiển thị thông báo thành công
      alert(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update order status';
      setUpdateError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
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
          {order.OrderStatus.toUpperCase()}
        </span>
      </div>

      {/* Customer Info */}
      <div className={`grid grid-cols-2 gap-4 mb-4 pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Customer</p>
          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {order.UserName}
          </p>
        </div>
        <div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Table</p>
          <p className={`font-semibold text-2xl ${darkMode ? 'text-pink-400' : 'text-pink-600'}`}>
            #{order.TableNumber || order.Items?.[0]?.TableNumber}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="mb-4">
        <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Items ({order.Items.length})
        </h4>
        {order.Items.map((item, index) => (
          <div 
            key={index}
            className={`flex justify-between p-3 rounded mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
          >
            <span className={darkMode ? 'text-white' : 'text-gray-900'}>
              {item.ItemName || item.name} x{item.Quantity}
            </span>
            <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {((item.Price || item.price) * item.Quantity).toLocaleString('vi-VN')}đ
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      {order.OrderStatus !== 'delivered' && (
        <div className="flex gap-2">
          {updateError && (
            <div className="w-full text-red-600 text-sm mb-2">
              ⚠️ {updateError}
            </div>
          )}
          {order.OrderStatus === 'pending' && (
            <button
              onClick={() => handleStatusChange('preparing')}
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? '⏳ Updating...' : 'Start Preparing'}
            </button>
          )}
          {order.OrderStatus === 'preparing' && (
            <button
              onClick={() => handleStatusChange('ready')}
              disabled={isUpdating}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? '⏳ Updating...' : 'Mark Ready'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderCard;