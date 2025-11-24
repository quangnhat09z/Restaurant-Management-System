import { React } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Home, Orders, Navbar, FavoriteItems, Login, Register, CustomersService, CustomerDetail, MyAccount } from "./imports";
import TestPage from "./TestPage";
import { OrderProvider } from "./context/OrderContext";
import { DarkModeProvider, useDarkMode } from './context/DarkModeContext'; 
import { FavoriteProvider } from './context/FavoriteContext'; 
import { AuthProvider, useAuth } from './context/AuthContext';

function App() {
  return (
    // 💡 BƯỚC KHẮC PHỤC 1: Đưa tất cả các Provider lên cùng cấp
    <DarkModeProvider>
      <OrderProvider>
        <FavoriteProvider> 
          {/* 💡 BƯỚC KHẮC PHỤC 2: AuthProvider phải bao bọc mọi hook liên quan đến Auth */}
          <AuthProvider> 
            <AppLayout /> 
          </AuthProvider>
        </FavoriteProvider>
      </OrderProvider>
    </DarkModeProvider>
  );
}

// Gộp logic Layout và Routing vào một component con để giữ App sạch sẽ
function AppLayout() {
  const { darkMode } = useDarkMode(); // Giờ đây hook này được gọi trong scope có Provider

  return (
    <div className={`min-h-screen transition duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <Router>
        <Navbar /> {/* Navbar included here */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/test" element={<TestPage />} />
            
            {/* Các tuyến đường yêu cầu xác thực */}
            <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
            <Route path="/customers" element={<RequireAuth><CustomersService /></RequireAuth>} />
            <Route path="/customers/:id" element={<RequireAuth><CustomerDetail /></RequireAuth>} />
            <Route path="/my-account" element={<RequireAuth><MyAccount /></RequireAuth>} />
            <Route path="/favorites" element={<RequireAuth><FavoriteItems /></RequireAuth>} />
            
            <Route path="*" element={<h1>404 NOT FOUND</h1>} />
          </Routes>
      </Router>
    </div>
  );
}

function RequireAuth({ children }) {
  const { user } = useAuth(); // Hook này giờ đây nằm trong scope của AuthProvider
  if (user === undefined) return null; // Tùy chọn: Thêm Loading Spinner nếu user chưa được resolve
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default App;