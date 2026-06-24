// =========================================================================
// FILE: src/App.jsx
// =========================================================================
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux'; 
import { store } from './redux/store';  
import { SocketProvider, useSocket } from './context/SocketContext'; // 🎯 Thêm import useSocket
import { getUserRoleFromToken } from './utils/auth';

// 🎯 BỔ SUNG CÁC IMPORT PHỤC VỤ HẠ TẦNG CUỘC GỌI TOÀN CỤC
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useCall } from './hooks/Chat/useCall';
import CallWindow from './pages/Chat/CallWindow'; 

// Chuyển nhóm các trang chức năng (Pages)
import LoginPage from './pages/Auth/LoginPage';
import HomePage from './pages/Home/HomePage'; 
import AccountPage from './pages/AccountManagement/AccountPage';
import ProductPage from './pages/Product/ProductPage';
import CustomerPage from './pages/Customer/CustomerPage';
import ProfilePage from './pages/Profile/ProfilePage'; 
import ChatPage from './pages/Chat/ChatPage';
import NotificationPage from './pages/Notification/NotificationPage';

import ErrorPage from './components/common/ErrorPage';

// Phân hệ quản lý Đơn hàng
import OrderPage from './pages/Order/OrderPage';
import CreateOrder from './pages/Order/CreateOrder';
import EditOrder from './pages/Order/EditOrder'; 
import CreateQuickly from './pages/Order/CreateOrder/CreateQuickly';
import OrderDetail from './pages/Order/OrderDetail';

import MainLayout from './layout/MainLayout';

// 🎯 KHỞI TẠO CONTEXT CUỘC GỌI TOÀN CỤC
const CallContext = createContext();
export const useGlobalCall = () => useContext(CallContext);

function GlobalCallWrapper({ children }) {
  const { callSocket } = useSocket();
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [globalRoomName, setGlobalRoomName] = useState('Đối tác hỗ trợ');

  const token = localStorage.getItem("accessToken");
  let role = token ? getUserRoleFromToken() : 'staff';
  if (Array.isArray(role)) role = role[0];

  // Khởi tạo bộ hook useCall duy nhất tại tầng Root hạ tầng
  const callProps = useCall(callSocket, activeRoomId, role);

  const displayName = useMemo(() => {
    if (callProps.callState === 'incoming' && !activeRoomId) {
      return 'Cuộc gọi hỗ trợ đến...';
    }
    return globalRoomName;
  }, [callProps.callState, globalRoomName, activeRoomId]);

  return (
    <CallContext.Provider value={{ ...callProps, setActiveRoomId, setGlobalRoomName, displayName }}>
      {children}
      {/* Cửa sổ cuộc gọi luôn sẵn sàng hiển thị đè lên bất kỳ Route nào khi có cuộc gọi */}
      <CallWindow {...callProps} roomName={displayName} />
    </CallContext.Provider>
  );
}

// ================= ROUTE GUARDS (Giữ nguyên toàn bộ logic gốc của bạn) =================
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("accessToken");
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  let role = getUserRoleFromToken(); 
  if (Array.isArray(role)) role = role[0]; 
  const normalizedRole = (role || '').toLowerCase();

  if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(normalizedRole)) {
    if (normalizedRole === 'customer') return <Navigate to="/products" replace />;
    return <Navigate to="/home" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    const role = getUserRoleFromToken();
    if (role === 'customer') return <Navigate to="/products" replace />;
    return <Navigate to="/home" replace />;
  }
  return children;
};

// ================= MAIN APPLICATION =================
function App() {
  const allRoles = ['admin', 'staff', 'customer'];
  const managementRoles = ['admin', 'staff'];

  return (
    <Provider store={store}>
      <Router>
        <SocketProvider>
          {/* 🎯 BỌC WRAPPER TOÀN CỤC VÀO ĐÂY ĐỂ KÍCH HOẠT LẮNG NGHE CHUÔNG TOÀN HỆ THỐNG */}
          <GlobalCallWrapper>
            <Routes>
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<ProtectedRoute allowedRoles={managementRoles}><MainLayout><HomePage /></MainLayout></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute allowedRoles={allRoles}><MainLayout><ProductPage /></MainLayout></ProtectedRoute>} />
              <Route path="/account-management" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout><AccountPage /></MainLayout></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute allowedRoles={managementRoles}><MainLayout><CustomerPage /></MainLayout></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute allowedRoles={allRoles}><MainLayout><OrderPage /></MainLayout></ProtectedRoute>} />
              <Route path="/orders/create" element={<ProtectedRoute allowedRoles={allRoles}><MainLayout><CreateOrder /></MainLayout></ProtectedRoute>} />
              <Route path="/orders/create/create_quickly" element={<ProtectedRoute allowedRoles={allRoles}><MainLayout><CreateQuickly /></MainLayout></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute allowedRoles={allRoles}><MainLayout><OrderDetail /></MainLayout></ProtectedRoute>} />
              <Route path="/orders/edit/:id" element={<ProtectedRoute allowedRoles={allRoles}><MainLayout><EditOrder /></MainLayout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute allowedRoles={allRoles}><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute allowedRoles={allRoles}><MainLayout noCard={true}><ChatPage /></MainLayout></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute allowedRoles={allRoles}><MainLayout><NotificationPage /></MainLayout></ProtectedRoute>} />
              <Route path="/error" element={<ProtectedRoute allowedRoles={allRoles}><ErrorPage /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/error" replace state={{ status: 404, message: "Trang không tồn tại." }} />} />
            </Routes>
          </GlobalCallWrapper>
        </SocketProvider>
      </Router>
    </Provider>
  );
}

export default App;