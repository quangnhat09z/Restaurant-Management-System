import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';

export default function CustomersService() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get('/api/customers')
      .then(res => {
        if (!mounted) return;
        setCustomers(res.data || []);
      })
      .catch(err => {
        if (!mounted) return;
        setError('Failed to load customers');
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false };
  }, []);

  if (loading) return <div className="p-6">Loading customers...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  const handleDelete = async (id) => {
    if (!confirm('Are you sure to delete this customer?')) return;
    try {
      await api.delete(`/api/customers/${id}`);
      setCustomers(prev => prev.filter(c => (c.CustomerID || c.id) !== id));
    } catch (err) {
      alert('Failed to delete customer');
    }
  };


  const startEdit = (c) => {
    setEditingId(c.CustomerID || c.id);
    setEditValues({ customerName: c.customerName || c.CustomerName, Email: c.Email, ContactNumber: c.ContactNumber, Address: c.Address });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/api/customers/${id}`, editValues);
      setCustomers(prev => prev.map(c => ((c.CustomerID || c.id) === id ? { ...c, ...editValues } : c)));
      setEditingId(null);
    } catch (err) {
      alert('Failed to update customer');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Link to="/register" className="bg-pink-500 text-white px-3 py-1 rounded">Add Customer</Link>
      </div>
      {customers.length === 0 ? (
        <div>No customers found.</div>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Contact</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => {
              const id = c.CustomerID || c.id;
              const isEditing = editingId === id;
              return (
                <tr key={id} className="border-t">
                  <td className="px-4 py-2">
                    {isEditing ? (
                      <input className="border p-1" value={editValues.customerName} onChange={e => setEditValues(v => ({ ...v, customerName: e.target.value }))} />
                    ) : (
                      (c.customerName || c.CustomerName)
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {isEditing ? (
                      <input className="border p-1" value={editValues.Email} onChange={e => setEditValues(v => ({ ...v, Email: e.target.value }))} />
                    ) : (
                      c.Email
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {isEditing ? (
                      <input className="border p-1" value={editValues.ContactNumber} onChange={e => setEditValues(v => ({ ...v, ContactNumber: e.target.value }))} />
                    ) : (
                      c.ContactNumber
                    )}
                  </td>
                  <td className="px-4 py-2 text-center space-x-2">
                    {!isEditing && <Link className="text-pink-600" to={`/customers/${id}`}>View</Link>}
                    {isEditing ? (
                      <>
                        <button className="text-green-600" onClick={() => saveEdit(id)}>Save</button>
                        <button className="text-gray-600" onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="text-blue-600" onClick={() => startEdit(c)}>Edit</button>
                        <button className="text-red-600" onClick={() => handleDelete(id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
