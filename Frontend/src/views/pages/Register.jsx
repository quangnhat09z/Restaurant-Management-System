import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// 💡 THÊM: Import hook Dark Mode
import { useDarkMode } from '../../context/DarkModeContext'; 

export default function Register() {
  // 1. Lấy trạng thái Dark Mode
  const { darkMode } = useDarkMode();
    
  const [customerName, setCustomerName] = useState('');
  const [Email, setEmail] = useState('');
  const [ContactNumber, setContactNumber] = useState('');
  const [Password, setPassword] = useState('');
  const [Address, setAddress] = useState('');
  const [error, setError] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !Email.trim() || !Password) return setError('Please fill required fields');
    setError(null);
    register({ customerName: customerName.trim(), Email: Email.trim(), ContactNumber, Password, Address })
      .then(() => navigate('/'))
      .catch(err => setError(err.message || 'Register failed'));
  };

  // 2. Định nghĩa các lớp CSS có điều kiện
  
  // Nền trang tổng thể
  const pageBgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  
  // Khung form (card)
  const formCardClass = darkMode 
    ? 'bg-gray-800 text-white shadow-xl' 
    : 'bg-white text-gray-900 shadow';
  
  // Tiêu đề form
  const titleClass = darkMode ? 'text-white' : 'text-gray-900';
  
  // Input fields
  const inputClass = `w-full p-2 border rounded mb-3 ${
    darkMode 
      ? 'bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-pink-500' 
      : 'bg-white border-gray-300 text-gray-900 focus:ring-pink-600'
  }`;

  // Label text
  const labelClass = `block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;

  // Error message
  const errorClass = darkMode ? 'text-red-400 mb-2' : 'text-red-500 mb-2';

  // Văn bản "Already have an account?"
  const linkTextClass = `mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`;

  // 3. Áp dụng các lớp CSS đã định nghĩa vào JSX
  return (
    <div className={`min-h-screen flex items-center justify-center ${pageBgClass}`}>
      <div className={`w-full max-w-md rounded shadow p-6 ${formCardClass}`}>
        <h2 className={`text-2xl font-bold mb-4 ${titleClass}`}>Register</h2>
        <form onSubmit={submit}>
          
          <label className={labelClass}>Full name</label>
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputClass} />
          
          <label className={labelClass}>Email</label>
          <input value={Email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          
          <label className={labelClass}>Contact number</label>
          <input value={ContactNumber} onChange={(e) => setContactNumber(e.target.value)} className={inputClass} />
          
          <label className={labelClass}>Password</label>
          <input type="password" value={Password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
          
          <label className={labelClass}>Address (optional)</label>
          <input value={Address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
          
          {error && <div className={errorClass}>{error}</div>}
          
          <button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white p-2 rounded transition duration-150">Create account</button>
        </form>
        
        <p className={linkTextClass}>Already have an account? <Link to="/login" className="text-pink-500 hover:text-pink-400 font-medium">Sign in</Link></p>
      </div>
    </div>
  );
}