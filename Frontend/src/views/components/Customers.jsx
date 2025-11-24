import React, { useState } from 'react';
import { useDarkMode } from '../../context/DarkModeContext'; 

export default function Customers({ isOpen, onClose, onSubmit, cartItems }) {
    const { darkMode } = useDarkMode();

    // ✅ Thêm CustomerID vào state
    const [customerID, setCustomerID] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // ✅ Validation đầy đủ
        if (!customerID.trim()) {
            return setError('Customer ID is required.');
        }
        if (!name.trim()) {
            return setError('Name is required.');
        }
        if (!phoneNumber.trim()) {
            return setError('Phone number is required.');
        }
        if (!tableNumber.trim()) {
            return setError('Table number is required.');
        }

        // ✅ Tạo order object theo đúng format backend yêu cầu
        const orderDetails = {
            CustomerID: customerID.trim(),
            CustomerName: name.trim(),
            ContactNumber: phoneNumber.trim(),
            TableNumber: parseInt(tableNumber.trim()) || tableNumber.trim(),
            Cart: cartItems,
        };
        
        console.log('Submitting order from modal:', orderDetails);
        onSubmit(orderDetails);
        
        // Reset form
        setCustomerID('');
        setName('');
        setPhoneNumber('');
        setTableNumber('');
        setError(null);
    };

    const overlayClass = `fixed inset-0 z-50 flex items-center justify-center bg-opacity-75 transition-opacity duration-300 ${
        darkMode ? 'bg-black/70' : 'bg-gray-900/50' 
    }`;
    
    const modalContentClass = `relative w-full max-w-sm mx-auto p-6 rounded-lg shadow-2xl transform transition-transform duration-300 ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900' 
    }`;
    
    const inputClass = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
        darkMode 
            ? 'bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-pink-500' 
            : 'bg-white border-gray-300 text-gray-900 focus:ring-pink-600'
    }`;
    
    const titleClass = `text-2xl font-bold mb-4 ${
        darkMode ? 'text-white' : 'text-gray-900'
    }`;
    
    return (
        <div className={overlayClass} onClick={onClose}>
            <div className={modalContentClass} onClick={(e) => e.stopPropagation()}>
                
                <h2 className={titleClass}>Enter your details</h2>
                <button 
                    onClick={onClose} 
                    className={`absolute top-4 right-4 text-2xl ${
                        darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    &times; 
                </button>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* ✅ Input 1: Customer ID (REQUIRED) */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Customer ID <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            placeholder="Enter Customer ID" 
                            className={inputClass}
                            value={customerID}
                            onChange={(e) => setCustomerID(e.target.value)}
                        />
                    </div>
                    
                    {/* Input 2: Name */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            placeholder="Enter your name" 
                            className={inputClass}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    
                    {/* Input 3: Phone Number */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="tel" 
                            placeholder="Enter phone number" 
                            className={inputClass}
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>
                    
                    {/* Input 4: Table Number */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Table Number <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="number" 
                            placeholder="Enter table number" 
                            className={inputClass}
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            min="1"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                            {error}
                        </div>
                    )}
                    
                    {/* Cart Summary */}
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className="text-sm font-medium">Order Summary:</p>
                        <p className="text-sm">{cartItems.length} items in cart</p>
                    </div>
                    
                    {/* Submit Button */}
                    <button 
                        type="submit"
                        className="w-full py-3 font-semibold rounded-lg text-white transition duration-200 bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    >
                        Place Order
                    </button>
                </form>
            </div>
        </div>
    );
}