import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../context/DarkModeContext';

export default function Register() {
  const { darkMode } = useDarkMode();
  const { register } = useAuth();
  const navigate = useNavigate();

  // State quản lý form
  const [formData, setFormData] = useState({
    customerName: '',
    Email: '',
    ContactNumber: '',
    Password: '',
    Address: ''
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.customerName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.Email.trim()) {
      setError('Email is required');
      return false;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.Email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.Password) {
      setError('Password is required');
      return false;
    }
    if (formData.Password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setError(null);
    setLoading(true);

    try {
      await register({
        customerName: formData.customerName.trim(),
        Email: formData.Email.trim(),
        ContactNumber: formData.ContactNumber.trim(),
        Password: formData.Password,
        Address: formData.Address.trim()
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // CSS classes với dark mode
  const pageBgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  
  const formCardClass = darkMode 
    ? 'bg-gray-800 text-white shadow-xl' 
    : 'bg-white text-gray-900 shadow-lg';
  
  const titleClass = darkMode ? 'text-white' : 'text-gray-900';
  
  const inputClass = `w-full px-3 py-2 border rounded-lg mb-3 transition duration-200 focus:outline-none focus:ring-2 ${
    darkMode 
      ? 'bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-pink-500 focus:border-transparent' 
      : 'bg-white border-gray-300 text-gray-900 focus:ring-pink-600 focus:border-pink-600'
  }`;

  const labelClass = `block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;

  const errorClass = `p-3 mb-4 rounded-lg ${
    darkMode 
      ? 'bg-red-900/30 text-red-400 border border-red-800' 
      : 'bg-red-50 text-red-600 border border-red-200'
  }`;

  const linkTextClass = `mt-6 text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`;

  const buttonClass = `w-full py-2.5 rounded-lg font-medium transition duration-200 ${
    loading 
      ? 'bg-gray-400 cursor-not-allowed' 
      : 'bg-pink-500 hover:bg-pink-600 active:bg-pink-700'
  } text-white`;

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-8 ${pageBgClass}`}>
      <div className={`w-full max-w-md rounded-lg p-8 ${formCardClass}`}>
        <h2 className={`text-3xl font-bold mb-6 text-center ${titleClass}`}>
          Create Account
        </h2>

        <form onSubmit={handleSubmit} data-testid="register-form">
          {/* Full Name */}
          <div className="mb-4">
            <label htmlFor="fullName" className={labelClass}>
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              name="customerName"
              type="text"
              value={formData.customerName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter your full name"
              disabled={loading}
              data-testid="fullName-input"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className={labelClass}>
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="Email"
              type="email"
              value={formData.Email}
              onChange={handleChange}
              className={inputClass}
              placeholder="your.email@example.com"
              disabled={loading}
              data-testid="email-input"
            />
          </div>

          {/* Contact Number */}
          <div className="mb-4">
            <label htmlFor="contactNumber" className={labelClass}>
              Contact number
            </label>
            <input
              id="contactNumber"
              name="ContactNumber"
              type="tel"
              value={formData.ContactNumber}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter your phone number"
              disabled={loading}
              data-testid="contactNumber-input"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className={labelClass}>
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              name="Password"
              type="password"
              value={formData.Password}
              onChange={handleChange}
              className={inputClass}
              placeholder="Minimum 6 characters"
              disabled={loading}
              data-testid="password-input"
            />
          </div>

          {/* Address */}
          <div className="mb-4">
            <label htmlFor="address" className={labelClass}>
              Address (optional)
            </label>
            <input
              id="address"
              name="Address"
              type="text"
              value={formData.Address}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter your address"
              disabled={loading}
              data-testid="address-input"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className={errorClass} data-testid="error-message" role="alert">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={buttonClass}
            disabled={loading}
            data-testid="create-account-btn"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {/* Sign In Link */}
        <p className={linkTextClass}>
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-pink-500 hover:text-pink-400 font-medium underline"
            data-testid="sign-in-link"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}