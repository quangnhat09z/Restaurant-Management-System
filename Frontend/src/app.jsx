import { React } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Home, Orders, Navbar, FavoriteItems, Login, Register, CustomersService, CustomerDetail, MyAccount } from "./imports";
import TestPage from "./TestPage";
import { OrderProvider } from "./context/OrderContext";
import { DarkModeProvider, useDarkMode } from './context/DarkModeContext'; 
import { FavoriteProvider } from './context/FavoriteContext'; 
import { AuthProvider, useAuth } from './context/AuthContext';

// Import 2 trang payment mới
import Payment from './views/pages/Payment';
import MockBank from './views/pages/MockBank';

function App() {
  return (
    <DarkModeProvider>
      <OrderProvider>
        <FavoriteProvider> 
          <AuthProvider> 
            <AppLayout /> 
          </AuthProvider>
        </FavoriteProvider>
      </OrderProvider>
    </DarkModeProvider>
  );
}

function AppLayout() {
  const { darkMode } = useDarkMode();

  return (
    <div className={`min-h-screen transition duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/test" element={<TestPage />} />
          
          {/* Các routes yêu cầu xác thực */}
          <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
          <Route path="/customers" element={<RequireAuth><CustomersService /></RequireAuth>} />
          <Route path="/customers/:id" element={<RequireAuth><CustomerDetail /></RequireAuth>} />
          <Route path="/my-account" element={<RequireAuth><MyAccount /></RequireAuth>} />
          <Route path="/favorites" element={<RequireAuth><FavoriteItems /></RequireAuth>} />
          
          {/* 🆕 PAYMENT ROUTES - Thêm 2 routes mới */}
          <Route path="/payment/:orderId" element={<RequireAuth><Payment /></RequireAuth>} />
          <Route path="/bank/:transactionId" element={<RequireAuth><MockBank /></RequireAuth>} />
          
          <Route path="*" element={<h1>404 NOT FOUND</h1>} />
        </Routes>
      </Router>
    </div>
  );
}

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (user === undefined) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default App;