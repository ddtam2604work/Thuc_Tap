import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Hợp nhất URL để tránh lỗi kết nối chéo khi chỉ có VITE_BE_URL được set
const BE_URL = import.meta.env.VITE_BE_URL || 'wss://qlkd.nosomovo.xyz:7002';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || BE_URL;
const CALL_SERVER_URL = import.meta.env.VITE_CALL_SERVER_URL || BE_URL;

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [callSocket, setCallSocket] = useState(null);
  const [globalUnreadCount, setGlobalUnreadCount] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);
  const pollingIntervalRef = useRef(null);
  const location = useLocation();
  const locationRef = useRef(location);
  
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

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

  useEffect(() => {
    if (!token || token.length < 30) {
      return;
    }

    const safeSocketUrl = String(SOCKET_URL);
    const targetUrl = safeSocketUrl.includes('localhost') 
      ? safeSocketUrl.replace('https://', 'http://') 
      : safeSocketUrl;

    const localRefreshToken = localStorage.getItem('refreshToken') || '';

    const socketInstance = io(targetUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'], 
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      withCredentials: true,
      rejectUnauthorized: false, 
      auth: { 
        accessToken: token.replace(/^Bearer\s+/i, '').trim(), 
        refreshToken: localRefreshToken 
      }
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('🟢 Kết nối Socket thành công đến:', targetUrl);
      stopFallbackPolling(); 

      try {
        const currentToken = localStorage.getItem('accessToken') || token;
        const payload = JSON.parse(window.atob(currentToken.split('.')[1]));
        const isStaff = !payload.customer_id; 

        if (isStaff) {
          socketInstance.emit('chat:join_company', { company_id: '0e3b15dc-c1d8-4d1c-90a0-dde7333ac791' });
          console.log('🏢 [Hạ tầng Realtime] Đã kích hoạt kênh nhận thông báo tin nhắn toàn cục.');
        }
      } catch (e) {
        console.error("❌ Lỗi phân giải Token để tự động join Company Channel:", e);
      }
    });

    socketInstance.on('connect_error', (err) => {
      console.error('🔴 Lỗi kết nối Socket:', err.message);
      startFallbackPolling();
    });

    const handleIncomingMessage = (data) => {
      try {
        const currentToken = localStorage.getItem('accessToken') || token;
        const payload = JSON.parse(window.atob(currentToken.split('.')[1]));
        const role = payload.customer_id ? 'customer' : 'staff';
        const senderType = Number(data.sendertype || data.sender_type);
        
        const isFromOther = (role === 'staff' && senderType === 1) || (role === 'customer' && senderType === 2);

        if (isFromOther) {
          if (!locationRef.current.pathname.startsWith('/chat')) {
            setGlobalUnreadCount(prev => prev + 1);
            
            if (data?.content) {
              showToast(data.content, data.sender_name || (senderType === 1 ? 'Khách hàng' : 'Tin nhắn mới'));
            }
          }
        }
      } catch (e) {
        console.error("Lỗi xử lý tin nhắn socket:", e);
      }
    };

    socketInstance.on('chat:message', handleIncomingMessage);
    socketInstance.on('chat:new_message', handleIncomingMessage);

    socketInstance.on('chat:access_token_refreshed', (data) => {
      if (data?.accessToken) {
        console.log('🔄 Đã tự động cập nhật Access Token mới từ Socket.');
        localStorage.setItem('accessToken', data.accessToken);
      }
    });

    const safeCallUrl = String(CALL_SERVER_URL);
    let targetCallUrl = safeCallUrl;

    const isLocalTest = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isLocalTest) {
      targetCallUrl = 'http://localhost:4001';
    } else {
      targetCallUrl = safeCallUrl.replace(/^http:/, 'https:');
    }

    const callSocketInstance = io(targetCallUrl, {
      path: '/call-socket', // Tự động đồng bộ bắt tay 1:1 theo cơ chế Transparent Proxy của Nginx mới
      transports: ['websocket', 'polling'], 
      rejectUnauthorized: false,
      withCredentials: true, 
      auth: { 
        token: token.replace(/^Bearer\s+/i, '').trim(),
        accessToken: token.replace(/^Bearer\s+/i, '').trim()
      }
    });
    setCallSocket(callSocketInstance);

    callSocketInstance.on('connect', () => {
      console.log('🟢 Kết nối Call Socket thành công đến:', targetCallUrl);
    });

    callSocketInstance.on('connect_error', (err) => {
      console.error('🔴 Lỗi kết nối Call Socket tại:', targetCallUrl, '| Chi tiết:', err.message);
    });

    callSocketInstance.on('call:incoming', (data) => {
      setGlobalUnreadCount(prev => prev + 1);
      const callTypeLabel = data?.type === 'video' ? '📹 Cuộc gọi Video đến...' : '📞 Cuộc gọi thoại đến...';
      showToast(callTypeLabel, data?.callerName || 'Khách hàng hỗ trợ');
    });

    return () => {
      socketInstance.disconnect();
      callSocketInstance.disconnect();
      stopFallbackPolling();
    };
  }, [token]);

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