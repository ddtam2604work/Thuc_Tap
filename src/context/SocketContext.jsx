import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Đảm bảo không lỗi nếu biến môi trường chưa load kịp
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BE_URL || 'https://113.161.204.185:4000';

// 🌟 ĐIỀU CHỈNH 1: Trỏ Call Server về cổng 7002 công khai của Production thay vì cổng 4001 bị chặn
const CALL_SERVER_URL = import.meta.env.VITE_CALL_SERVER_URL || 'https://qlkd.nosomovo.xyz:7002';

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [callSocket, setCallSocket] = useState(null);
  const [globalUnreadCount, setGlobalUnreadCount] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);
  const pollingIntervalRef = useRef(null);
  const location = useLocation();
  
  // Lấy token từ Redux (đóng vai trò là accessToken)
  const token = useSelector((state) => state.auth.token);

  const showToast = (message, sender) => {
     setToastMessage({ message, sender });
     setTimeout(() => setToastMessage(null), 4000);
  };

  const startFallbackPolling = () => {
    if (pollingIntervalRef.current) return;
    console.warn('⚠️ Kích hoạt cơ chế HTTP Polling dự phòng.');
    pollingIntervalRef.current = setInterval(async () => {
      try {
        setGlobalUnreadCount(prev => prev + 1);
      } catch (err) {
        console.error('Lỗi khi polling:', err);
      }
    }, 10000);
  };

  const stopFallbackPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Logic kết nối Socket chính xác theo Gateway Backend
  useEffect(() => {
    if (!token || token.length < 30) {
      return;
    }

    // Chuẩn hóa URL an toàn, tránh lỗi crash chuỗi
    const safeSocketUrl = String(SOCKET_URL);
    const targetUrl = safeSocketUrl.includes('localhost') 
      ? safeSocketUrl.replace('https://', 'http://') 
      : safeSocketUrl;

    // Lấy thêm refresh token dự phòng từ Storage (nếu có) để phục vụ cơ chế Re-auth của Server
    const localRefreshToken = localStorage.getItem('refreshToken') || '';

    // SỬA LỖI CHÍNH: Thay đổi cấu trúc auth object khớp 100% với Backend
    const socketInstance = io(targetUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'], // Ưu tiên websocket trước theo chuẩn Vite
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      withCredentials: true,
      rejectUnauthorized: false, // Vượt lỗi chứng chỉ SSL Self-signed của IP thực tế
      auth: { 
        accessToken: token.replace(/^Bearer\s+/i, '').trim(), 
        refreshToken: localRefreshToken 
      }
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('🟢 Kết nối Socket thành công đến:', targetUrl);
      stopFallbackPolling(); 
    });

    socketInstance.on('connect_error', (err) => {
      console.error('🔴 Lỗi kết nối Socket:', err.message);
      startFallbackPolling();
    });

    // LẮNG NGHE EVENT THỰC TẾ 1: Tin nhắn real-time trong phòng trò chuyện
    socketInstance.on('chat:message', (data) => {
      if (location.pathname !== '/chat') {
        setGlobalUnreadCount(prev => prev + 1);
        if (data?.content) {
          showToast(data.content, data.sender_name || 'Khách hàng');
        }
      }
    });

    // LẮNG NGHE EVENT THỰC TẾ 2: Cảnh báo tin nhắn mới từ phòng chat khác (Dành cho cả Khách và Staff khi ẩn màn hình)
    socketInstance.on('chat:new_message', (data) => {
      if (location.pathname !== '/chat') {
        setGlobalUnreadCount(prev => prev + 1);
        if (data?.content) {
          showToast(data.content, data.sender_name || 'Tin nhắn mới');
        }
      }
    });

    // LẮNG NGHE EVENT THỰC TẾ 3: Tự động cập nhật Access Token mới khi được Server cấp lại qua Socket
    socketInstance.on('chat:access_token_refreshed', (data) => {
      if (data?.accessToken) {
        console.log('🔄 Đã tự động cập nhật Access Token mới từ Socket.');
        localStorage.setItem('accessToken', data.accessToken);
      }
    });

    // Tự động chuẩn hóa giao thức kết nối động cho Call Socket
    const safeCallUrl = String(CALL_SERVER_URL);
    const targetCallUrl = safeCallUrl.includes('localhost')
      ? safeCallUrl.replace('https://', 'http://')
      : safeCallUrl;

    // 🌟 ĐIỀU CHỈNH 2: Thiết lập kết nối đồng bộ tắp qua cổng công khai 7002 của Nginx
    const callSocketInstance = io(targetCallUrl, {
      path: '/call-socket', // Khai báo chuỗi sạch đồng bộ, không thêm dấu gạch chéo ở cuối
      transports: ['websocket'],
      secure: !targetCallUrl.includes('http://'),
      rejectUnauthorized: false,
      auth: { token: token.replace(/^Bearer\s+/i, '').trim() }
    });
    setCallSocket(callSocketInstance);

    callSocketInstance.on('connect', () => {
      console.log('🟢 Kết nối Call Socket thành công đến:', targetCallUrl);
    });

    callSocketInstance.on('connect_error', (err) => {
      console.error('🔴 Lỗi kết nối Call Socket:', err.message);
    });

    return () => {
      socketInstance.disconnect();
      callSocketInstance.disconnect();
      stopFallbackPolling();
    };
  }, [token, location.pathname]);

  // Lắng nghe việc đăng xuất để hủy kết nối
  useEffect(() => {
    if (location.pathname === '/login') {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      if (callSocket) {
        callSocket.disconnect();
        setCallSocket(null);
      }
      stopFallbackPolling();
    }
  }, [location.pathname, socket, callSocket]);

  return (
    <SocketContext.Provider value={{ socket, callSocket, globalUnreadCount, setGlobalUnreadCount, showToast }}>
      {children}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-white border border-blue-200 shadow-xl rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 cursor-pointer hover:bg-gray-50 transition-colors"
             onClick={() => window.location.href = '/chat'}>
           <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
               {(toastMessage.sender[0] || 'N').toUpperCase()}
           </div>
           <div className="flex-1 min-w-0 pr-2">
               <h4 className="text-sm font-bold text-gray-800 truncate">{toastMessage.sender}</h4>
               <p className="text-xs text-gray-600 truncate mt-0.5">{toastMessage.message}</p>
           </div>
           <div className="w-2 h-2 rounded-full bg-blue-500 self-start mt-1"></div>
        </div>
      )}
    </SocketContext.Provider>
  );
};