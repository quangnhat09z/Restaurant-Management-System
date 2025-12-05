// frontend/src/pages/Orders.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useOrderContext } from '../../context/OrderContext';
import { useDarkMode } from '../../context/DarkModeContext';
import OrderCard from '../components/OrderCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { requestNotificationPermission } from '../../utils/notifications';



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
  const { 
    orders, 
    loading, 
    error, 
    pagination,
    wsConnected, 
    wsError,
    fetchOrders, 
    updateOrderStatus 
  } = useOrderContext();
  const [filterStatus, setFilterStatus] = useState('all');
  const [paginationLocal, setPaginationLocal] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });

  useEffect(() => {
    // Request notification permission
    requestNotificationPermission();
    
    // Fetch initial orders using OrderContext
    fetchOrders(1);
  }, [fetchOrders]);

  // Hàm thay đổi trang
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= (paginationLocal?.totalPages || 1)) {
      fetchOrders(newPage);
    }
  }, [fetchOrders, paginationLocal?.totalPages]);

  // Update local pagination when context pagination changes
  useEffect(() => {
    if (pagination) {
      setPaginationLocal(pagination);
    }
  }, [pagination]);

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.OrderStatus === filterStatus);

  const stats = {
    pending: orders.filter(o => o.OrderStatus === 'pending').length,
    preparing: orders.filter(o => o.OrderStatus === 'preparing').length,
    ready: orders.filter(o => o.OrderStatus === 'ready').length,
    total: paginationLocal?.total || 0
  };

  return (
    <div className={`min-h-screen p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Kitchen Dashboard
            </h1>
            {/* WebSocket Status Indicator */}
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {wsConnected ? '🟢 Live Updates Active' : '🔴 Reconnecting...'}
              </span>
            </div>
            {wsError && (
              <p className="text-red-500 text-sm mt-1">{wsError}</p>
            )}
          </div>
          
          <button
            onClick={() => fetchOrders()}
            disabled={loading}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            <span>🔄</span>
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
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
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'pending', 'preparing', 'ready', 'delivered'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-pink-500 text-white'
                  : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
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
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
            <p className="text-red-600 font-semibold">❌ {error}</p>
            <button
              onClick={() => fetchOrders()}
              className="mt-2 text-red-600 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className={`p-12 text-center rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              📋 No orders found
            </p>
          </div>
        ) : (
          <>
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

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-6 space-x-4">
              <button
                onClick={() => handlePageChange(paginationLocal.page - 1)}
                disabled={paginationLocal.page === 1 || loading}
                className={`px-4 py-2 rounded font-semibold transition duration-200 ${
                  darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } disabled:opacity-50`}
              >
                &laquo; Previous
              </button>
              
              <span className={`px-4 py-2 text-lg font-bold ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Page {paginationLocal.page} / {paginationLocal.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(paginationLocal.page + 1)}
                disabled={paginationLocal.page === paginationLocal.totalPages || loading}
                className={`px-4 py-2 rounded font-semibold transition duration-200 ${
                  darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } disabled:opacity-50`}
              >
                Next &raquo;
              </button>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                ({paginationLocal.total} total orders)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Orders;