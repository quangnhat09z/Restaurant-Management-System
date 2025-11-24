import { useContext, useEffect, useState } from 'react';
import { FavoriteContext } from '../../context/FavoriteContext';
import { useDarkMode } from '../../context/DarkModeContext'; // THÊM DÒNG NÀY
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import api from '../../api/axiosInstance';

const ItemFrames = ({ addToCart }) => {
  const { favoriteItems, addToFavorites, removeFromFavorites } =
    useContext(FavoriteContext);
  const { darkMode } = useDarkMode(); // THÊM DÒNG NÀY
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Itemframes: Fetching from /api/menu...');
    api.get('/api/menu')
      .then((response) => {
        console.log('Itemframes: API response:', response.data);
        let menuData = [];
        if (response.data?.data && Array.isArray(response.data.data)) {
          menuData = response.data.data;
        } else if (Array.isArray(response.data)) {
          menuData = response.data;
        }
        console.log('Itemframes: Parsed menu data count:', menuData.length);
        setItems(menuData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Itemframes: Error fetching menu:', err);
        setError('Failed to load menu items: ' + (err.message || 'Unknown error'));
        setLoading(false);
      });
  }, []);

  const toggleFavorite = (item) => {
    if (favoriteItems.some((fav) => fav.id === item.id)) {
      removeFromFavorites(item.id);
    } else {
      addToFavorites(item);
    }
  };

  if (loading) {
    return (
      <div className={`p-5 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <p>Loading menu items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 text-center text-red-500">
        <p>⚠️ {error}</p>
        <p className="text-xs mt-2">Debug: Check browser console (F12)</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className={`p-5 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <p>No menu items available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {items.map((item) => (
        <div
          key={item.id || Math.random()}
          className={`menu-item shadow-lg rounded-lg p-4 transform transition duration-300 hover:scale-105 hover:shadow-xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-40 object-cover rounded-t-lg"
          />
          
          {/* FIX: Tên món - thêm màu cho dark mode */}
          <h3 className={`text-xl font-semibold mt-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {item.name}
          </h3>
          
          {/* FIX: Giá - thêm màu cho dark mode */}
          <p className={`text-lg font-medium ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            ₹ {item.price}
          </p>

          <button
            onClick={() => addToCart(item)}
            className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 hover:scale-110 transition duration-200 transform focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            Add to Cart
          </button>

          <button
            onClick={() => toggleFavorite(item)}
            className="mt-2 text-lg ml-2"
            aria-label={
              favoriteItems.some((fav) => fav.id === item.id)
                ? 'Unfavorite this item'
                : 'Favorite this item'
            }
          >
            <FontAwesomeIcon
              icon={
                favoriteItems.some((fav) => fav.id === item.id)
                  ? faHeartSolid
                  : faHeartRegular
              }
              className={`transition duration-200 ${
                favoriteItems.some((fav) => fav.id === item.id)
                  ? 'text-red-500'
                  : darkMode ? 'text-gray-500' : 'text-gray-300'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ItemFrames