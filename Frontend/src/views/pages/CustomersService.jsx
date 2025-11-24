import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { useDarkMode } from '../../context/DarkModeContext';

export default function CustomersService() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const { darkMode } = useDarkMode();

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
      setCustomers(prev => prev.filter(c => (c.CustomerID || c.id || c.userID || c.UserID) !== id));
    } catch (err) {
      alert('Failed to delete customer');
    }
  };


  const startEdit = (c) => {
    const id = c.CustomerID || c.id || c.userID || c.UserID;
    setEditingId(id);
    setEditValues({
      customerName: c.customerName || c.CustomerName || c.userName || c.UserName || c.username,
      Email: c.Email || c.email,
      ContactNumber: c.ContactNumber || c.contactNumber,
      Address: c.Address || c.address,
    });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/api/customers/${id}`, editValues);
      setCustomers(prev => prev.map(c => ((c.CustomerID || c.id || c.userID || c.UserID) === id ? { ...c, ...editValues } : c)));
      setEditingId(null);
    } catch (err) {
      alert('Failed to update customer');
    }
  };

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Link to="/register" className="bg-pink-500 text-white px-3 py-1 rounded">Add Customer</Link>
      </div>
      {customers.length === 0 ? (
        <div>No customers found.</div>
      ) : (
        <table className={`min-w-full border ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <thead>
            <tr>
              <th className={`px-4 py-2 text-left ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Name</th>
              <th className={`px-4 py-2 text-left ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Email</th>
              <th className={`px-4 py-2 text-left ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Contact</th>
              <th className={`px-4 py-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => {
              const id = c.CustomerID || c.id || c.userID || c.UserID;
              const isEditing = editingId === id;
              return (
                <tr key={id} className={`${darkMode ? 'border-t border-gray-700 bg-gray-700' : 'border-t bg-white'}`}>
                  <td className={`px-4 py-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {isEditing ? (
                      <input className="border p-1" value={editValues.customerName} onChange={e => setEditValues(v => ({ ...v, customerName: e.target.value }))} />
                    ) : (
                      (c.customerName || c.CustomerName || c.userName || c.UserName || c.username)
                    )}
                  </td>
                  <td className={`px-4 py-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {isEditing ? (
                      <input className="border p-1" value={editValues.Email} onChange={e => setEditValues(v => ({ ...v, Email: e.target.value }))} />
                    ) : (
                      (c.Email || c.email)
                    )}
                  </td>
                  <td className={`px-4 py-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {isEditing ? (
                      <input className="border p-1" value={editValues.ContactNumber} onChange={e => setEditValues(v => ({ ...v, ContactNumber: e.target.value }))} />
                    ) : (
                      (c.ContactNumber || c.contactNumber)
                    )}
                  </td>
                  <td className={`px-4 py-2 text-center space-x-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {!isEditing && <Link className={darkMode ? 'text-pink-400' : 'text-pink-600'} to={`/customers/${id}`}>View</Link>}
                    {isEditing ? (
                      <>
                        <button className="text-green-600" onClick={() => saveEdit(id)}>Save</button>
                        <button className="text-gray-600" onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className={darkMode ? 'text-blue-400' : 'text-blue-600'} onClick={() => startEdit(c)}>Edit</button>
                        <button className={darkMode ? 'text-red-400' : 'text-red-600'} onClick={() => handleDelete(id)}>Delete</button>
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
