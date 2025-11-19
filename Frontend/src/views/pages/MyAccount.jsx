import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';

export default function MyAccount() {
  const { user } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !user.id) {
      setError('Not logged in');
      setLoading(false);
      return;
    }

    let mounted = true;
    api.get(`/api/customers/${user.id}`)
      .then(res => { if (mounted) setCustomer(res.data); })
      .catch(() => { if (mounted) setError('Unable to load account'); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false };
  }, [user]);

  if (loading) return <div className="p-6">Loading account...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!customer) return <div className="p-6">Account not found.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Account</h1>
      <div className="bg-white rounded p-4 shadow">
        <p><strong>Name:</strong> {customer.customerName || customer.CustomerName}</p>
        <p><strong>Email:</strong> {customer.Email}</p>
        <p><strong>Contact:</strong> {customer.ContactNumber}</p>
        <p><strong>Address:</strong> {customer.Address || '—'}</p>
      </div>
    </div>
  );
}
