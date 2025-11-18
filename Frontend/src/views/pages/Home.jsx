import { useState } from 'react';
import { Cart, Itemframes, Customers } from '../../imports';
import api from '../../api/axiosInstance';
import { useDarkMode } from '../../context/DarkModeContext';

function Home() {
  const { darkMode } = useDarkMode();
  const [cartItems, setCartItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    try {
      await api.post('/api/orders', [order]);
      clearcart();
      alert('Order Placed Successfully \nThank You for Ordering');
    } catch (error) {
      console.error(error);
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
            <Itemframes addToCart={addToCart} />
          </div>

          {/* Sidebar - Cart */}
          <div className="lg:w-96 lg:sticky lg:top-4 lg:self-start">
            <div
              className={`${
                darkMode ? 'bg-gray-800' : 'bg-gray-50'
              } rounded-lg shadow-lg p-4`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Cart</h2>
                <button
                  onClick={clearcart}
                  className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition duration-300"
                >
                  Clear
                </button>
              </div>

              <Cart cartItems={cartItems} setCartItems={setCartItems} />

              <div className="mt-4">
                <button
                  onClick={checker}
                  className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 font-semibold"
                >
                  Confirm Order
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
