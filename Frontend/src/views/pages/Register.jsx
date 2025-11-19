import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <form onSubmit={submit}>
          <label className="block mb-2">Full name</label>
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-2 border rounded mb-3" />
          <label className="block mb-2">Email</label>
          <input value={Email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded mb-3" />
          <label className="block mb-2">Contact number</label>
          <input value={ContactNumber} onChange={(e) => setContactNumber(e.target.value)} className="w-full p-2 border rounded mb-3" />
          <label className="block mb-2">Password</label>
          <input type="password" value={Password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded mb-3" />
          <label className="block mb-2">Address (optional)</label>
          <input value={Address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2 border rounded mb-3" />
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <button type="submit" className="w-full bg-pink-500 text-white p-2 rounded">Create account</button>
        </form>
        <p className="mt-4 text-sm">Already have an account? <Link to="/login" className="text-pink-600">Sign in</Link></p>
      </div>
    </div>
  );
}
