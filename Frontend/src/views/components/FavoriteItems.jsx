import React, { useContext } from 'react';
import { FavoriteContext } from '../../context/FavoriteContext';
import { useDarkMode } from '../../context/DarkModeContext'; // THÊM DÒNG NÀY

const FavoriteItems = () => {
  const { favoriteItems } = useContext(FavoriteContext);
  const { darkMode } = useDarkMode(); // THÊM DÒNG NÀY

  return (
    <div className={`p-4 min-h-screen ${
      darkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Tiêu đề */}
      <h2 className={`text-2xl font-semibold mb-4 ${
        darkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Favorite Items
      </h2>

      {favoriteItems.length === 0 ? (
        <p className={`${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          No favorite items.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {favoriteItems.map((item, index) => (
            <div 
              key={index} 
              className={`menu-item shadow-lg rounded-lg p-4 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-40 object-cover rounded-t-lg" 
              />
              
              {/* Tên món - FIX */}
              <h3 className={`text-xl font-semibold mt-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {item.name}
              </h3>
              
              {/* Giá - FIX */}
              <p className={`text-lg font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {item.price}đ
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteItems;