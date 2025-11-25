// frontend/src/pages/Orders.jsx
import React, { useEffect, useState } from 'react';
import { useOrderContext } from '../../context/OrderContext';
import { useDarkMode } from '../../context/DarkModeContext';
import OrderCard from '../components/OrderCard';
import LoadingSpinner from '../components/LoadingSpinner';

// StatCard Component
const StatCard = ({ label, value, color, darkMode }) => {
  const colorClasses = {
    gray: darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800',
    yellow: darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800',
    blue: darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800',
    green: darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800',
  };

  return (
    <div className={`rounded-lg p-6 shadow ${colorClasses[color]}`}>
      <p className="text-sm font-semibold opacity-75">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
};

function Orders() {
  const { darkMode } = useDarkMode();
  const { orders, loading, error, fetchOrders, updateOrderStatus } = useOrderContext();
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.OrderStatus === filterStatus);

  const stats = {
    pending: orders.filter(o => o.OrderStatus === 'pending').length,
    preparing: orders.filter(o => o.OrderStatus === 'preparing').length,
    ready: orders.filter(o => o.OrderStatus === 'ready').length,
    total: orders.length
  };

  return (
    <div className={`min-h-screen p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Kitchen Dashboard
          </h1>
          <button
            onClick={() => fetchOrders()}
            disabled={loading}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg"
          >
            {loading ? 'Loading...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard label="Total" value={stats.total} color="gray" darkMode={darkMode} />
          <StatCard label="Pending" value={stats.pending} color="yellow" darkMode={darkMode} />
          <StatCard label="Preparing" value={stats.preparing} color="blue" darkMode={darkMode} />
          <StatCard label="Ready" value={stats.ready} color="green" darkMode={darkMode} />
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'preparing', 'ready'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg ${
                filterStatus === status
                  ? 'bg-pink-500 text-white'
                  : darkMode
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-white text-gray-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-red-600 p-6 bg-red-50 rounded-lg">
            ❌ {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center p-12">
            <p className="text-xl text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <OrderCard
                key={order.OrderID}
                order={order}
                onStatusChange={updateOrderStatus}
                darkMode={darkMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;