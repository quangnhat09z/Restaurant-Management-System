import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return setError('Enter email and password');
    setError(null);
    login({ Email: email.trim(), Password: password })
      .then(() => navigate('/'))
      .catch((err) => setError(err.message || 'Login failed'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Sign In</h2>
        <form onSubmit={submit}>
          <label className="block mb-2">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded mb-3" />
          <label className="block mb-2">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded mb-3" />
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <button type="submit" className="w-full bg-pink-500 text-white p-2 rounded">Sign in</button>
        </form>
        <p className="mt-4 text-sm">Don't have an account? <Link to="/register" className="text-pink-600">Register</Link></p>
      </div>
    </div>
  );
}
