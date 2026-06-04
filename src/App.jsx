// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux'; // 👉 Bọc Provider Redux quản lý State toàn cục
import { store } from './redux/store';  
import { SocketProvider } from './context/SocketContext'; // 👉 Nhà cung cấp kết nối Realtime Socket

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
import EditOrder from './pages/Order/EditOrder'; // 🌟 Cân cả 2 luồng: Sửa đơn thường & Sửa bản nháp
import CreateQuickly from './pages/Order/CreateOrder/CreateQuickly';
import OrderDetail from './pages/Order/OrderDetail';

// Tầng Layout & Security Guards
import MainLayout from './layout/MainLayout';

// Component bảo vệ Route: Đảm bảo an ninh và phân quyền truy cập thông qua Access Token
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    // Bước 1: Khởi tạo Redux Store ra ngoài cùng hệ thống
    <Provider store={store}>
      <Router>
        {/* Bước 2: Kích hoạt Socket Pipeline phục vụ cổng chat và thông báo biến động đơn hàng realtime */}
        <SocketProvider>
          <Routes>
            {/* ================= PUBLIC ROUTES ================= */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Root path: Tự động điều hướng thông minh dựa vào trạng thái phiên làm việc */}
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

            {/* 🌟 NÂNG CẤP HỢP NHẤT LUỒNG: Tuyến đường Chỉnh sửa duy nhất cho cả đơn chính thức và đơn nháp */}
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
            {/* Bảo vệ ứng dụng khỏi các lỗi gõ sai URL từ phía người dùng */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </SocketProvider>
      </Router>
    </Provider>
  );
}

export default App;