// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux'; 
import { store } from './redux/store';  
import { SocketProvider } from './context/SocketContext'; 
import { getUserRoleFromToken } from './utils/auth';

// Chuyển nhóm các trang chức năng (Pages)
import LoginPage from './pages/Auth/LoginPage';
import HomePage from './pages/Home/HomePage'; 
import AccountPage from './pages/AccountManagement/AccountPage';
import ProductPage from './pages/Product/ProductPage';
import CustomerPage from './pages/customer/CustomerPage';
import ProfilePage from './pages/Profile/ProfilePage'; 
import SettingsPage from './pages/Setting/SettingPage';
import ChatPage from './pages/Chat/ChatPage';

// Phân hệ quản lý Đơn hàng (Orders System Components)
import OrderPage from './pages/Order/OrderPage';
import CreateOrder from './pages/Order/CreateOrder';
import EditOrder from './pages/Order/EditOrder'; 
import CreateQuickly from './pages/Order/CreateOrder/CreateQuickly';
import OrderDetail from './pages/Order/OrderDetail';

// Tầng Layout & Security Guards
import MainLayout from './layout/MainLayout';

// Component bảo vệ Route: Đảm bảo an ninh và phân quyền truy cập thông qua Access Token
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("accessToken");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRoleFromToken();

  // Khách hàng mặc định bị điều hướng thẳng vào trang chat nếu cố truy cập các trang khác
  if (role === 'customer' && location.pathname !== '/chat') {
    return <Navigate to="/chat" replace />;
  }

  return children;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <SocketProvider>
          <Routes>
            {/* ================= PUBLIC ROUTES ================= */}
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/" element={<Navigate to="/home" replace />} />
            
            {/* ================= PROTECTED ROUTES (Bọc trong Layout & Security Guard) ================= */}
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <MainLayout><HomePage /></MainLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/products" 
              element={
                <ProtectedRoute>
                  <MainLayout><ProductPage /></MainLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/account-management" 
              element={
                <ProtectedRoute>
                  <MainLayout><AccountPage /></MainLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/customers" 
              element={
                <ProtectedRoute>
                  <MainLayout><CustomerPage /></MainLayout>
                </ProtectedRoute>
              } 
            />

            {/* Phân hệ Tuyến đường Đơn hàng (Orders Workflow Routing) */}
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <MainLayout><OrderPage /></MainLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/orders/create" 
              element={
                <ProtectedRoute>
                  <MainLayout><CreateOrder /></MainLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/orders/create/create_quickly" 
              element={
                <ProtectedRoute>
                  <MainLayout><CreateQuickly /></MainLayout>
                </ProtectedRoute>
              } 
            />

            {/* Xem chi tiết tiến trình đơn hàng (Đấu nối trực tiếp với ID biến động từ OrderTable) */}
            <Route 
              path="/orders/:id" 
              element={
                <ProtectedRoute>
                  <MainLayout><OrderDetail /></MainLayout>
                </ProtectedRoute>
              } 
            />

            {/* Tuyến đường Chỉnh sửa duy nhất cho cả đơn chính thức và đơn nháp */}
            <Route 
              path="/orders/edit/:id" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <EditOrder />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />

            {/* Hệ thống cấu hình tài khoản và tương tác */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <MainLayout><ProfilePage /></MainLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <MainLayout><SettingsPage /></MainLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <MainLayout><ChatPage /></MainLayout>
                </ProtectedRoute>
              } 
            />

            {/* ================= FALLBACK ROUTE ================= */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </SocketProvider>
      </Router>
    </Provider>
  );
}

export default App;