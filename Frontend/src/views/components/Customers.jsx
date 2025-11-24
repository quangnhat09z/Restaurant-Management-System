import React, { useState } from 'react';
// Đảm bảo đường dẫn chính xác (thường là ../../context/DarkModeContext)
import { useDarkMode } from '../../context/DarkModeContext'; 

// Component Customers nhận các props: isOpen, onClose, onSubmit (placeOrder), cartItems
export default function Customers({ isOpen, onClose, onSubmit, cartItems }) {
    // 1. Lấy trạng thái Dark Mode
    const { darkMode } = useDarkMode();

    // 2. KHAI BÁO STATE CHO INPUTS (RẤT QUAN TRỌNG)
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    // 3. Hàm xử lý khi nhấn "Place Order"
    const handleSubmit = (e) => {
        e.preventDefault();
        // Kiểm tra validation cơ bản
        if (!name.trim() || !phoneNumber.trim()) {
            return setError('Please enter your name and phone number.');
        }

        const orderDetails = {
            customerName: name.trim(),
            contactNumber: phoneNumber.trim(),
            tableNumber: tableNumber.trim(), 
            items: cartItems, // Truyền cartItems trực tiếp
        };
        
        onSubmit(orderDetails); // Gọi hàm placeOrder từ Home.jsx
        onClose(); 
        // Reset form
        setName('');
        setPhoneNumber('');
        setTableNumber('');
        setError(null);
    };

    // 4. Định nghĩa các lớp CSS có điều kiện
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
                
                {/* Tiêu đề và nút Đóng */}
                <h2 className={titleClass}>Enter your details</h2>
                <button onClick={onClose} className={`absolute top-4 right-4 text-2xl ${
                    darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>
                    &times; 
                </button>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Input 1: Name */}
                    <input 
                        type="text" 
                        placeholder="Name" 
                        className={inputClass}
                        value={name} // 💡 Gắn state
                        onChange={(e) => setName(e.target.value)} // 💡 Gắn onChange
                    />
                    
                    {/* Input 2: Phone Number */}
                    <input 
                        type="text" 
                        placeholder="Phone Number" 
                        className={inputClass}
                        value={phoneNumber} // 💡 Gắn state
                        onChange={(e) => setPhoneNumber(e.target.value)} // 💡 Gắn onChange
                    />
                    
                    {/* Input 3: Table Number */}
                    <input 
                        type="text" 
                        placeholder="Table Number" 
                        className={inputClass}
                        value={tableNumber} // 💡 Gắn state
                        onChange={(e) => setTableNumber(e.target.value)} // 💡 Gắn onChange
                    />

                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    
                    {/* Nút Place Order */}
                    <button 
                        type="submit"
                        className="w-full py-3 font-semibold rounded-lg text-white transition duration-200 bg-pink-500 hover:bg-pink-600"
                    >
                        Place Order
                    </button>
                </form>
            </div>
        </div>
    );
}