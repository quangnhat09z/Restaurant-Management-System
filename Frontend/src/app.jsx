import { React } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Home, Orders, Navbar, FavoriteItems, Login, Register, CustomersService, CustomerDetail, MyAccount } from "./imports";
import TestPage from "./TestPage";
import { OrderProvider } from "./context/OrderContext";
import { DarkModeProvider, useDarkMode } from './context/DarkModeContext'; // Import DarkModeProvider
import { FavoriteProvider } from './context/FavoriteContext'; // Import FavoriteProvider
import { AuthProvider, useAuth } from './context/AuthContext';

function App() {
  return (
    <DarkModeProvider>
      <OrderProvider>
        <FavoriteProvider> {/* Wrap with FavoriteProvider */}
          <Main />
        </FavoriteProvider>
      </OrderProvider>
    </DarkModeProvider>
  );
}

function Main() {
  const { darkMode } = useDarkMode(); // Access dark mode state

  return (
    <div className={`min-h-screen transition duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <AuthProvider>
        <Router>
          <Navbar /> {/* Navbar included here */}
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
              <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
              <Route path="/customers" element={<RequireAuth><CustomersService /></RequireAuth>} />
              <Route path="/customers/:id" element={<RequireAuth><CustomerDetail /></RequireAuth>} />
              <Route path="/my-account" element={<RequireAuth><MyAccount /></RequireAuth>} />
              <Route path="/favorites" element={<RequireAuth><FavoriteItems /></RequireAuth>} />
              <Route path="*" element={<h1>404 NOT FOUND</h1>} />
            </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default App;
