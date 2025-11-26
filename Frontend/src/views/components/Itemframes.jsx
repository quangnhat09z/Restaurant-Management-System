import { useContext, useEffect, useState, useCallback } from 'react'; // THÊM useCallback
import { FavoriteContext } from '../../context/FavoriteContext';
import { useDarkMode } from '../../context/DarkModeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import api from '../../api/axiosInstance';

const ItemFrames = ({ addToCart }) => {
    const { favoriteItems, addToFavorites, removeFromFavorites } =
        useContext(FavoriteContext);
    const { darkMode } = useDarkMode();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // THÊM: State để quản lý thông tin phân trang
    const [pagination, setPagination] = useState({ 
        currentPage: 1, 
        totalPages: 1, 
        totalItems: 0,
        limit: 12 // Giới hạn mặc định theo yêu cầu
    });

    // HÀM MỚI: Tải dữ liệu theo trang. Sử dụng useCallback để tối ưu.
    const fetchMenu = useCallback(async (pageToLoad = 1, limit = pagination.limit) => {
        setLoading(true);
        setError(null);
        
        try {
            // GỌI API VỚI THAM SỐ PAGE VÀ LIMIT
            const response = await api.get(`/api/menu?page=${pageToLoad}&limit=${limit}`);
            const data = response.data;
            
            let menuData = [];
            let paginationData = { currentPage: 1, totalPages: 1, limit: limit };

            // Backend trả về { data: [], pagination: {} }
            if (data.data && data.pagination) {
                menuData = data.data;
                paginationData = data.pagination;
            } else {
                // Xử lý trường hợp response không có cấu trúc phân trang chuẩn
                menuData = data;
                console.warn("Backend response does not include pagination metadata.");
            }

            setItems(menuData);
            setPagination(paginationData); // LƯU THÔNG TIN PHÂN TRANG
            
        } catch (err) {
            console.error('Itemframes: Error fetching menu:', err);
            setError('Failed to load menu items: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    }, [pagination.limit]);

    // CHỈ GỌI API MỘT LẦN KHI KHỞI TẠO HOẶC KHI limit THAY ĐỔI
    useEffect(() => {
        fetchMenu(pagination.currentPage, pagination.limit);
    }, [fetchMenu, pagination.limit]); // Thêm fetchMenu vào dependencies

    const toggleFavorite = (item) => {
        // ... (Logic giữ nguyên)
        if (favoriteItems.some((fav) => fav.id === item.id)) {
            removeFromFavorites(item.id);
        } else {
            addToFavorites(item);
        }
    };
    
    // HÀM CHUYỂN TRANG
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            // Không cần cập nhật state currentPage ở đây, vì nó sẽ được cập nhật 
            // từ response.pagination sau khi fetchMenu thành công.
            fetchMenu(newPage, pagination.limit);
        }
    };

    if (loading) {
        return (
            <div className={`p-5 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>Loading menu items...</p>
                {/* Nên thêm LoadingSpinner.jsx vào đây */}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-5 text-center text-red-500">
                <p>⚠️ {error}</p>
                <p className="text-xs mt-2">Debug: Check browser console (F12)</p>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className={`p-5 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>No menu items available on this page.</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => {
                    // Kiểm tra id an toàn hơn
                    const key = item.id ? item.id : Math.random(); 
                    const isFavorite = favoriteItems.some((fav) => fav.id === item.id);
                    const itemPrice = item.price ? item.price.toLocaleString('vi-VN') : 'N/A';
                    
                    return (
                        <div
                            key={key}
                            className={`menu-item shadow-lg rounded-lg p-4 transform transition duration-300 hover:scale-105 hover:shadow-xl ${
                                darkMode ? 'bg-gray-800' : 'bg-white'
                            }`}
                        >
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-40 object-cover rounded-t-lg"
                            />
                            
                            <h3 className={`text-xl font-semibold mt-2 ${
                                darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                                {item.name}
                            </h3>
                            
                            <p className={`text-lg font-medium ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                {itemPrice}đ
                            </p>

                            <button
                                onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}
                                className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 hover:scale-110 transition duration-200 transform focus:outline-none focus:ring-2 focus:ring-pink-300"
                            >
                                Add to Cart
                            </button>

                            <button
                                onClick={() => toggleFavorite(item)}
                                className="mt-2 text-lg ml-2"
                                aria-label={isFavorite ? 'Unfavorite this item' : 'Favorite this item'}
                            >
                                <FontAwesomeIcon
                                    icon={isFavorite ? faHeartSolid : faHeartRegular}
                                    className={`transition duration-200 ${
                                        isFavorite ? 'text-red-500' : darkMode ? 'text-gray-500' : 'text-gray-300'
                                    }`}
                                />
                            </button>
                        </div>
                    );
                })}
            </div>
            
            {/* PHẦN ĐIỀU KHIỂN PHÂN TRANG */}
            <div className="flex justify-center items-center mt-6 space-x-4">
                <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1 || loading}
                    className={`px-4 py-2 rounded font-semibold transition duration-200 ${
                        darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } disabled:opacity-50`}
                >
                    &laquo; Trang Trước
                </button>
                
                <span className={`px-4 py-2 text-lg font-bold ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                    Trang {pagination.currentPage} / {pagination.totalPages}
                </span>

                <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages || loading}
                    className={`px-4 py-2 rounded font-semibold transition duration-200 ${
                        darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } disabled:opacity-50`}
                >
                    Trang Kế &raquo;
                </button>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    ({pagination.totalItems} món)
                </p>
            </div>
        </div>
    );
};

export default ItemFrames;