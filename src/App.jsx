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
import NotificationPage from './components/common/NotificationDropdown'; // Thêm trang thông báo phục vụ khách hàng

// Phân hệ quản lý Đơn hàng (Orders System Components)
import OrderPage from './pages/Order/OrderPage';
import CreateOrder from './pages/Order/CreateOrder';
import EditOrder from './pages/Order/EditOrder'; 
import CreateQuickly from './pages/Order/CreateOrder/CreateQuickly';
import OrderDetail from './pages/Order/OrderDetail';

// Tầng Layout & Security Guards
import MainLayout from './layout/MainLayout';

// ================= SECURITY GUARDS (RBAC) =================

// 1. Component bảo vệ Route riêng tư: Kiểm tra Trạng thái đăng nhập & Phân quyền ứng dụng
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("accessToken");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRoleFromToken();

  // Nếu Route có cấu hình giới hạn quyền, và quyền hiện tại không nằm trong danh sách cho phép
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Điều hướng dựa trên vai trò để tối ưu hóa trải nghiệm người dùng (UX)
    if (role === 'customer') {
      return <Navigate to="/products" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return children;
};

// 2. Component bảo vệ Route công khai: Ngăn chặn người dùng đã có Token quay lại trang đăng nhập
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    const role = getUserRoleFromToken();
    // Điều hướng landing page tương ứng sau khi đăng nhập thành công
    if (role === 'customer') {
      return <Navigate to="/products" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return children;
};

// ================= MAIN APPLICATION =================
function App() {
  // Định nghĩa các nhóm quyền rõ ràng để tái sử dụng
  const allRoles = ['admin', 'staff', 'customer'];
  const managementRoles = ['admin', 'staff'];

  return (
    <Provider store={store}>
      <Router>
        <SocketProvider>
          <Routes>
            {/* ================= PUBLIC ROUTES ================= */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            
            <Route path="/" element={<Navigate to="/home" replace />} />
            
            {/* ================= PROTECTED ROUTES (Bọc trong Layout & Security Guard) ================= */}
            
            {/* Dashboard nội bộ */}
            <Route 
              path="/home" 
              element={
                <ProtectedRoute allowedRoles={managementRoles}>
                  <MainLayout><HomePage /></MainLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Trang sản phẩm: Tất cả các quyền bao gồm cả Customer đều dùng được */}
            <Route 
              path="/products" 
              element={
                <ProtectedRoute allowedRoles={allRoles}>
                  <MainLayout><ProductPage /></MainLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Quản lý tài khoản: Chỉ duy nhất Admin cấu hình */}
            <Route 
              path="/account-management" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MainLayout><AccountPage /></MainLayout>
                </ProtectedRoute>
              } 
            />

            {/* Quản lý khách hàng: Chỉ dành cho nhân sự công ty */}
            <Route 
              path="/customers" 
              element={
                <ProtectedRoute allowedRoles={managementRoles}>
                  <MainLayout><CustomerPage /></MainLayout>
                </ProtectedRoute>
              } 
            />

            {/* ================= PHÂN HỆ ĐƠN HÀNG: CẤP QUYỀN CHO KHÁCH HÀNG TƯƠNG TÁC ================= */}
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute allowedRoles={allRoles}>
                  <MainLayout><OrderPage /></MainLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/orders/create" 
              element={
                <ProtectedRoute allowedRoles={allRoles}>
                  <MainLayout><CreateOrder /></MainLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/orders/create/create_quickly" 
              element={
                <ProtectedRoute allowedRoles={allRoles}>
                  <MainLayout><CreateQuickly /></MainLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/orders/:id" 
              element={
                <ProtectedRoute allowedRoles={allRoles}>
                  <MainLayout><OrderDetail /></MainLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/orders/edit/:id" 
              element={
                <ProtectedRoute allowedRoles={allRoles}>
                  <MainLayout><EditOrder /></MainLayout>
                </ProtectedRoute>
              } 
            />

            {/* ================= CÁC TÍNH NĂNG TƯƠNG TÁC CHUNG CỦA HỆ THỐNG ================= */}
            
            {/* Hồ sơ cá nhân: Tất cả mọi người tự quản lý cá nhân */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute allowedRoles={allRoles}>
                  <MainLayout><ProfilePage /></MainLayout>
                </ProtectedRoute>
              } 
            />

            {/* Cấu hình hệ thống: Chỉ dành cho nội bộ */}
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute allowedRoles={managementRoles}>
                  <MainLayout><SettingsPage /></MainLayout>
                </ProtectedRoute>
              } 
            />

            {/* Kênh Chat: Cho phép Khách hàng kết nối hỗ trợ */}
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute allowedRoles={allRoles}>
                  <MainLayout><ChatPage /></MainLayout>
                </ProtectedRoute>
              } 
            />

            {/* Trung tâm thông báo: Cho phép Khách hàng nhận cập nhật trạng thái đơn hàng */}
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute allowedRoles={allRoles}>
                  <MainLayout><NotificationPage /></MainLayout>
                </ProtectedRoute>
              } 
            />

            {/* ================= FALLBACK ROUTE ================= */}
            {/* Chuyển hướng thông minh dựa vào Role nếu người dùng nhập sai URL */}
            <Route 
              path="*" 
              element={
                <ProtectedRoute>
                  {getUserRoleFromToken() === 'customer' ? (
                    <Navigate to="/products" replace />
                  ) : (
                    <Navigate to="/home" replace />
                  )}
                </ProtectedRoute>
              } 
            />
          </Routes>
        </SocketProvider>
      </Router>
    </Provider>
  );
}

export default App;