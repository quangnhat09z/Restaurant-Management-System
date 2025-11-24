import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('rms_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem('rms_user', JSON.stringify(user));
    else localStorage.removeItem('rms_user');
  }, [user]);

  const login = async (payload) => {
    try {
      const email = payload.email || payload.Email;
      const password = payload.password || payload.Password;
      const res = await api.post('/api/customers/login', { email, password });
      // Expect { message, customer }
      const customer = res.data.customer || res.data;
      const u = { username: customer.customerName || customer.CustomerName, id: customer.CustomerID || customer.id, token: 'local-dev-token' };
      setUser(u);
      return u;
    } catch (err) {
      // Normalize error to avoid showing raw internal errors (SQL, stack traces)
      const resp = err?.response;
      let msg;
      if (resp) {
        if (resp.status === 400) {
          // validation error -> show details if available
          const details = resp.data?.details;
          msg = Array.isArray(details) ? details.join('; ') : resp.data?.error || 'Invalid input';
        } else if (resp.status === 401) {
          msg = 'Incorrect email or password';
        } else {
          msg = 'Login failed, please try again later';
        }
      } else {
        msg = 'Network error, please check your connection';
      }
      throw new Error(msg);
    }
  };

  const register = async (payload) => {
    try {
      const userName = payload.userName || payload.customerName || payload.fullName;
      const email = payload.email || payload.Email;
      const contactNumber = payload.contactNumber || payload.ContactNumber;
      const password = payload.password || payload.Password;
      const address = payload.address || payload.Address;

      const res = await api.post('/api/customers/register', { userName, email, contactNumber, password, address });
      // backend returns insert id; after register, attempt to login
      await login({ email, password });
      return res.data;
    } catch (err) {
      const resp = err?.response;
      let msg;
      if (resp) {
        if (resp.status === 400) {
          const details = resp.data?.details;
          msg = Array.isArray(details) ? details.join('; ') : resp.data?.error || 'Invalid input';
        } else {
          msg = resp.data?.error || 'Register failed';
        }
      } else {
        msg = err.message || 'Register failed';
      }
      throw new Error(msg);
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
