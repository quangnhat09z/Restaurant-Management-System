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

  if (loading) return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      Loading customers...
    </div>
  );
  
  if (error) return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-red-400' : 'bg-white text-red-600'}`}>
      {error}
    </div>
  );

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
      customerName: c.customerName || c.CustomerName || c.userName || c.UserName || c.username || '',
      Email: c.Email || c.email || '',
      ContactNumber: c.ContactNumber || c.contactNumber || '',
      Address: c.Address || c.address || '',
    });
  };

  const saveEdit = async (id) => {
    try {
      console.log('=== UPDATE CUSTOMER DEBUG ===');
      console.log('Customer ID:', id);
      console.log('Edit values:', editValues);
      
      // Thử nhiều format khác nhau
      const formats = {
        // Format 1: PascalCase
        format1: {
          CustomerName: editValues.customerName,
          Email: editValues.Email,
          ContactNumber: editValues.ContactNumber,
          Address: editValues.Address || ''
        },
        // Format 2: camelCase
        format2: {
          customerName: editValues.customerName,
          email: editValues.Email,
          contactNumber: editValues.ContactNumber,
          address: editValues.Address || ''
        },
        // Format 3: Với CustomerID
        format3: {
          CustomerID: id,
          CustomerName: editValues.customerName,
          Email: editValues.Email,
          ContactNumber: editValues.ContactNumber,
          Address: editValues.Address || ''
        }
      };
      
      console.log('Trying format 1 (PascalCase):', formats.format1);
      
      // Thử format 1 trước
      let response;
      try {
        response = await api.put(`/api/customers/${id}`, formats.format1);
        console.log('✅ Format 1 worked!');
      } catch (err1) {
        console.log('❌ Format 1 failed:', err1.response?.data);
        console.log('Trying format 2 (camelCase):', formats.format2);
        
        try {
          response = await api.put(`/api/customers/${id}`, formats.format2);
          console.log('✅ Format 2 worked!');
        } catch (err2) {
          console.log('❌ Format 2 failed:', err2.response?.data);
          console.log('Trying format 3 (with CustomerID):', formats.format3);
          
          response = await api.put(`/api/customers/${id}`, formats.format3);
          console.log('✅ Format 3 worked!');
        }
      }
      
      console.log('Response:', response.data);
      
      setCustomers(prev => prev.map(c => {
        const customerId = c.CustomerID || c.id || c.userID || c.UserID;
        if (customerId === id) {
          return { ...c, ...editValues };
        }
        return c;
      }));
      setEditingId(null);
      alert('Customer updated successfully!');
    } catch (err) {
      console.error('=== ALL FORMATS FAILED ===');
      console.error('Error:', err);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      console.error('Response headers:', err.response?.headers);
      
      alert(`Failed to update customer: ${JSON.stringify(err.response?.data, null, 2)}`);
    }
  };

  // ✅ Input style với dark mode support
  const inputClass = `border p-2 rounded w-full ${
    darkMode 
      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  return (
    <div className={`p-6 min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Link 
          to="/register" 
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded transition duration-200"
        >
          Add Customer
        </Link>
      </div>
      
      {customers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No customers found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className={`min-w-full border rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <thead>
              <tr className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Name</th>
                <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Email</th>
                <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Contact</th>
                <th className={`px-4 py-3 text-center ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => {
                const id = c.CustomerID || c.id || c.userID || c.UserID;
                const isEditing = editingId === id;
                return (
                  <tr 
                    key={id} 
                    className={`border-t ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    {/* Name Column */}
                    <td className={`px-4 py-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {isEditing ? (
                        <input 
                          className={inputClass}
                          value={editValues.customerName} 
                          onChange={e => setEditValues(v => ({ ...v, customerName: e.target.value }))} 
                          placeholder="Customer Name"
                        />
                      ) : (
                        (c.customerName || c.CustomerName || c.userName || c.UserName || c.username)
                      )}
                    </td>
                    
                    {/* Email Column */}
                    <td className={`px-4 py-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {isEditing ? (
                        <input 
                          className={inputClass}
                          value={editValues.Email} 
                          onChange={e => setEditValues(v => ({ ...v, Email: e.target.value }))} 
                          placeholder="Email"
                        />
                      ) : (
                        (c.Email || c.email)
                      )}
                    </td>
                    
                    {/* Contact Column */}
                    <td className={`px-4 py-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {isEditing ? (
                        <input 
                          className={inputClass}
                          value={editValues.ContactNumber} 
                          onChange={e => setEditValues(v => ({ ...v, ContactNumber: e.target.value }))} 
                          placeholder="Contact Number"
                        />
                      ) : (
                        (c.ContactNumber || c.contactNumber)
                      )}
                    </td>
                    
                    {/* Actions Column */}
                    <td className={`px-4 py-3 text-center space-x-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {!isEditing && (
                        <Link 
                          className={`${darkMode ? 'text-pink-400 hover:text-pink-300' : 'text-pink-600 hover:text-pink-700'} transition`}
                          to={`/customers/${id}`}
                        >
                          View
                        </Link>
                      )}
                      
                      {isEditing ? (
                        <>
                          <button 
                            className="text-green-600 hover:text-green-700 font-medium transition"
                            onClick={() => saveEdit(id)}
                          >
                            Save
                          </button>
                          <button 
                            className="text-gray-600 hover:text-gray-700 transition"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition`}
                            onClick={() => startEdit(c)}
                          >
                            Edit
                          </button>
                          <button 
                            className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'} transition`}
                            onClick={() => handleDelete(id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}