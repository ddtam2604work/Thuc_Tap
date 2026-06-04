import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useLocation } from 'react-router-dom';

// Lấy VITE_SOCKET_URL để chạy Local Mock Server, nếu không có thì mới fallback về BE_URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BE_URL;

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [globalUnreadCount, setGlobalUnreadCount] = useState(0);
  const pollingIntervalRef = useRef(null);
  const location = useLocation();

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

  // Tách riêng logic kết nối Socket chỉ chạy 1 lần khi có Token
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (!token || token.length < 30) {
      return;
    }

    // Ép cứng giao thức http thuần túy nếu url chứa chữ localhost
  const targetUrl = SOCKET_URL.includes('localhost') 
    ? SOCKET_URL.replace('https://', 'http://') 
    : SOCKET_URL;

  const socketInstance = io(targetUrl, {
    transports: ['polling', 'websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    withCredentials: true,
    rejectUnauthorized: false, // Bỏ qua xác thực chứng chỉ nếu chạy môi trường dev
    auth: { token: token }
  });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('🟢 Kết nối Socket thành công:', SOCKET_URL);
      stopFallbackPolling(); 
    });

    socketInstance.on('connect_error', (err) => {
      // console.error('🔴 Lỗi kết nối mạng Socket:', err.message);
      startFallbackPolling();
    });

    socketInstance.on('receive_message', () => {
      setGlobalUnreadCount(prev => prev + 1);
    });

    // Cleanup khi component bị unmount
    return () => {
      socketInstance.disconnect();
      stopFallbackPolling();
    };
  }, []); // Bỏ location.pathname ra khỏi mảng này để không bị reconnect khi đổi trang

  // Lắng nghe việc đăng xuất (chuyển về trang login) để ngắt kết nối thủ công
  useEffect(() => {
    if (location.pathname === '/login' && socket) {
      socket.disconnect();
      setSocket(null);
      stopFallbackPolling();
    }
  }, [location.pathname, socket]);

  return (
    <SocketContext.Provider value={{ socket, globalUnreadCount, setGlobalUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};