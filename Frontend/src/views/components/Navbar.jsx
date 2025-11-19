import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDarkMode } from "../../context/DarkModeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const { darkMode, toggleDarkMode } = useDarkMode(); // Access dark mode state and toggle function
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 p-4 flex justify-between items-center shadow-lg`}>
      <div className={`text-3xl font-extrabold tracking-wide ${darkMode ? 'text-white' : 'text-black'}`}>
        <h2 className="cursor-pointer transform hover:scale-105 transition duration-300">MyApp</h2>
      </div>
      <ul className="flex items-center space-x-6">
        <li>
          <Link
            to="/"
            className={`text-lg font-medium hover:text-yellow-400 transition duration-300 transform hover:scale-110 hover:underline ${darkMode ? 'text-white' : 'text-black'}`}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/orders"
            className={`text-lg font-medium hover:text-yellow-400 transition duration-300 transform hover:scale-110 hover:underline ${darkMode ? 'text-white' : 'text-black'}`}
          >
            Orders
          </Link>
        </li>
        <li>
          <Link
            to="/customers"
            className={`text-lg font-medium hover:text-yellow-400 transition duration-300 transform hover:scale-110 hover:underline ${darkMode ? 'text-white' : 'text-black'}`}
          >
            Customers
          </Link>
        </li>
        <li>
          <Link
            to="/favorites"
            className={`text-lg font-medium hover:text-yellow-400 transition duration-300 transform hover:scale-110 hover:underline ${darkMode ? 'text-white' : 'text-black'}`}
          >
            Favorites
          </Link>
        </li>
        <li>
          <button onClick={toggleDarkMode} className="text-lg">
            <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
          </button>
        </li>
        {user ? (
          <li>
            <button onClick={handleLogout} className="text-sm bg-white text-gray-800 px-3 py-1 rounded shadow-sm hover:bg-gray-100">
              Logout
            </button>
          </li>
        ) : (
          <li>
            <Link to="/login" className="text-sm bg-white text-gray-800 px-3 py-1 rounded shadow-sm hover:bg-gray-100">Login</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
