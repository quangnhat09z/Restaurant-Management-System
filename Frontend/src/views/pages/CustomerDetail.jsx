import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosInstance';

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get(`/api/customers/${id}`)
      .then(res => {
        if (!mounted) return;
        setCustomer(res.data);
      })
      .catch(err => {
        if (!mounted) return;
        setError('Failed to load customer');
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false };
  }, [id]);

  if (loading) return <div className="p-6">Loading customer...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!customer) return <div className="p-6">Customer not found.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customer Details</h1>
      <div className="bg-white rounded p-4 shadow">
        <p><strong>Name:</strong> {customer.customerName || customer.CustomerName}</p>
        <p><strong>Email:</strong> {customer.Email}</p>
        <p><strong>Contact:</strong> {customer.ContactNumber}</p>
        <p><strong>Address:</strong> {customer.Address || '—'}</p>
        <p><strong>Created:</strong> {customer.createdAt || customer.created_at || '—'}</p>
      </div>
    </div>
  );
}
