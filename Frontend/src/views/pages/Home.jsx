import { useState } from 'react';
import { Cart, Itemframes, Customers } from '../../imports';
import api from '../../api/axiosInstance';
import { useDarkMode } from '../../context/DarkModeContext';
import { useOrderContext } from '../../context/OrderContext';

function Home() {
  const { darkMode } = useDarkMode();
  const { fetchOrders } = useOrderContext();
  const [cartItems, setCartItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const addToCart = (item, quantityToAdd = 1) => {
    if (cartItems.some((cartItem) => cartItem.id === item.id)) {
      const updatedCartItems = cartItems.map((cartItem) => {
        if (cartItem.id === item.id) {
          const newQuantity = cartItem.Quantity + quantityToAdd;
          const finalQuantity = Math.max(newQuantity, 0);
          return { ...cartItem, Quantity: finalQuantity };
        }
        return cartItem;
      });
      setCartItems(updatedCartItems);
    } else {
      setCartItems([...cartItems, { ...item, Quantity: quantityToAdd }]);
    }
  };

  async function placeOrder(order) {
    setIsSubmitting(true);
    
    try {
      console.log('Placing order:', order);
      
      // ✅ FIX: Gửi object trực tiếp, không wrap trong array
      const response = await api.post('/api/orders', order);
      
      console.log('✅ Order placed successfully:', response.data);
      
      clearcart();
      closeModal();
      
      // Refresh orders list
      setTimeout(() => {
        if (fetchOrders) {
          fetchOrders();
          console.log('Orders list refreshed');
        }
      }, 500);
      
      alert('Order Placed Successfully \n✅ Thank You for Ordering');
      
    } catch (error) {
      console.error('❌ Error placing order:', error);
      console.error('Error details:', error.response?.data);
      
      let errorMessage = 'Failed to place order.';
      if (error.response?.data) {
        errorMessage += `\n\n${JSON.stringify(error.response.data, null, 2)}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  function checker() {
    if (cartItems.length === 0) {
      alert('Please add items to cart first');
    } else {
      openModal();
    }
  }

  function clearcart() {
    setCartItems([]);
  }

  return (
    <div
      className={`min-h-screen ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
      }`}
    >
      <div className="container mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content - Items */}
          <div className="flex-1">
            <Itemframes addToCart={addToCart} darkMode={darkMode} />
          </div>

          {/* Sidebar - Cart */}
          <div className="lg:w-96 lg:sticky lg:top-4 lg:self-start">
            <div
              className={`${
                darkMode ? 'bg-gray-800' : 'bg-gray-50'
              } rounded-lg shadow-lg p-4`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Giỏ hàng
                </h2>
                <button
                  onClick={clearcart}
                  disabled={isSubmitting}
                  className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition duration-300 disabled:opacity-50"
                >
                  Clear
                </button>
              </div>

              <Cart cartItems={cartItems} setCartItems={setCartItems} />

              <div className="mt-4">
                <button
                  onClick={checker}
                  disabled={isSubmitting}
                  className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '⏳ Processing...' : 'Confirm Order'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {isModalOpen && (
          <Customers
            isOpen={isModalOpen}
            onClose={closeModal}
            onSubmit={placeOrder}
            cartItems={cartItems}
          />
        )}
      </div>
    </div>
  );
}

export default Home;