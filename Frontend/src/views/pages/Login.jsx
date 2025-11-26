import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../context/DarkModeContext';

export default function Login() {
  const { darkMode } = useDarkMode();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();  // ← Phải lấy login từ context
  const navigate = useNavigate();  // ← Phải lấy navigate

  const submit = async (e) => {
    e.preventDefault();

    console.log("Email nhập:", email);
    console.log("Password nhập:", password);

    // Kiểm tra hợp lệ
    if (!email || !email.trim() || !password.trim()) {
      setError('Enter email and password');
      return;
    }

    setError(null);

    try {
      // ← GỌI LOGIN THẬT TỪ CONTEXT
      await login({ Email: email.trim(), Password: password });
      
      // ← CHUYỂN TRANG SAU KHI LOGIN THÀNH CÔNG
      navigate('/');
      
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  // CSS
  const pageBgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const formCardClass = darkMode 
    ? 'bg-gray-800 text-white shadow-xl' 
    : 'bg-white text-gray-900 shadow';

  const inputClass = `w-full p-2 border rounded mb-3 ${
    darkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  const labelClass = `block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;
  const errorClass = darkMode ? 'text-red-400 mb-2' : 'text-red-500 mb-2';

  return (
    <div 
      className={`min-h-screen flex items-center justify-center ${pageBgClass}`}
      data-testid="login-page"
    >
      <div 
        className={`w-full max-w-md rounded shadow p-6 ${formCardClass}`}
        data-testid="login-form-container"
      >
        <h2 
          className="text-2xl font-bold mb-4"
          data-testid="login-heading"
        >
          Sign In
        </h2>

        <form onSubmit={submit} data-testid="login-form">
          <label 
            className={labelClass}
            htmlFor="email"
          >
            Email
          </label>
          <input 
            id="email"
            name="email"
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="Enter your email"
            autoComplete="email"
            data-testid="input-email"
          />

          <label 
            className={labelClass}
            htmlFor="password"
          >
            Password
          </label>
          <input 
            id="password"
            name="password"
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="Enter your password"
            autoComplete="current-password"
            data-testid="input-password"
          />

          {error && (
            <div 
              className={errorClass}
              data-testid="error-message"
              role="alert"
            >
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white p-2 rounded transition duration-150"
            data-testid="btn-submit"
          >
            Sign in
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-400">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-pink-500 hover:text-pink-400 font-medium ml-1"
            data-testid="link-register"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}