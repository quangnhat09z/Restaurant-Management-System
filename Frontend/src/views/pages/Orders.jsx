import React, { useEffect, useState } from 'react';
import { LoadingSpinner, Skelleton } from '../../imports';
import { useDarkMode } from '../../context/DarkModeContext';
import { useOrderContext } from '../../context/OrderContext'; // ✅ SỬ DỤNG CONTEXT

function Orders() {
  const { darkMode } = useDarkMode();
  const { orderItems, fetchOrders, loading: contextLoading, fetchError } = useOrderContext(); // ✅ LẤY DỮ LIỆU TỪ CONTEXT
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    // Fetch orders khi component mount
    fetchOrders();
    
    // Simulate skeleton loading
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [fetchOrders]);

  return (
    <div className={`p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      {showSkeleton || contextLoading ? (
        <div>
          <LoadingSpinner />
          <Skelleton />
        </div>
      ) : (
        <div className="content">
          <div className="kitchen-dashboard p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-semibold">Order Items</h1>
              <button
                onClick={fetchOrders}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                🔄 Refresh
              </button>
            </div>
            
            {fetchError ? (
              <p className="text-red-600">{fetchError}</p>
            ) : orderItems.length === 0 ? (
              <p className="text-gray-600">No order items available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className={`min-w-full shadow-md rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <thead>
                    <tr className="bg-pink-400 text-white">
                      <th className="p-4 text-left">Table Number</th>
                      <th className="p-4 text-left">Item ID</th>
                      <th className="p-4 text-left">Item Name</th>
                      <th className="p-4 text-left">Quantity</th>
                      <th className="p-4 text-left">Confirmation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.flatMap((orderGroup, groupIndex) =>
                      orderGroup.map((order, orderIndex) => {
                        return order.Cart.map((item, itemIndex) => (
                          <tr 
                            key={`${groupIndex}-${orderIndex}-${itemIndex}`} 
                            className={`border-b ${itemIndex === 0 ? 'border-t-4 border-gray' : ''} ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                          >
                            {itemIndex === 0 && (
                              <td
                                className={`p-4 text-center font-bold text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
                                rowSpan={order.Cart.length}
                              >
                                {order.TableNumber}
                              </td>
                            )}
                            <td className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} p-4`}>{item.id}</td>
                            <td className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} p-4`}>{item.name}</td>
                            <td className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} p-4`}>{item.Quantity}</td>
                            {itemIndex === 0 && (
                              <td
                                className={`text-center font-bold text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'} p-4`}
                                rowSpan={order.Cart.length}
                              >
                                <button className="p-2 bg-green-500 text-white rounded">Placed</button>
                              </td>
                            )}
                          </tr>
                        ));
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;