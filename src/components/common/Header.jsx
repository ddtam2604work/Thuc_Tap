// src/components/layout/Header.jsx
import React, { useState, useEffect } from 'react'; 
import { useSelector } from 'react-redux';
import { Link, NavLink, useLocation } from 'react-router-dom'; // Thêm useLocation
import { useAuth } from '../../hooks/Login/useAuth';
import { NAV_LINKS } from '../../constants/navigation';
import { useSocket } from '../../context/SocketContext'; 
import { getUserRoleFromToken } from '../../utils/auth'; 
import Button from '../skeleton/Button'; 
import ActiveWrapper from '../skeleton/ActiveWrapper'; 
import NotificationDropdown from '../../pages/Notification/NotificationDropdown';
import chaticon from '../../assets/images/icon_chat.png';
import { chatService } from '../../services/chatService'; 

const COMPANY_ID = '0e3b15dc-c1d8-4d1c-90a0-dde7333ac791';

const Logo = () => {
  const role = getUserRoleFromToken();
  const targetPath = role === 'customer' ? "/products" : "/home";

  return (
    <Link to={targetPath} className="flex items-center gap-2" title="Trang chủ">
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path d="M13 21H3a2 2 0 01-2-2V5a2 2 0 012-2h8l4 4v2" />
          <path d="M3 21v-2a4 4 0 014-4h7" />
          <path d="M18.88 19.12l-3.76-3.76" />
          <path d="M21 14l-1.5 1.5" />
      </svg>
      <span className="text-xl font-bold text-white tracking-tight">QLKD</span>
    </Link>
  );
};

const NavigationLinks = ({ filteredLinks }) => {
  return (
    <nav className="hidden md:flex items-center gap-[16px] pl-8 flex-1 justify-start">
      {filteredLinks.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className="p-0" 
        >
          {({ isActive }) => (
            <ActiveWrapper
              isActive={isActive}
              as="span" 
              className="px-3 py-1.5 rounded-md" 
            >
              {link.label}
            </ActiveWrapper>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

const UserMenu = () => {
  const { user } = useSelector((state) => state.auth);
  const { logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <Link to="/profile" className="flex items-center gap-3 group" title="Thông tin cá nhân">
        <span className="text-sm font-medium text-white opacity-90 group-hover:opacity-100 hidden sm:block">
          {user.fullname || user.username}
        </span>
        <div className="w-9 h-9 bg-white/30 rounded-full flex items-center justify-center text-sm font-bold text-white group-hover:bg-white/40 border border-white/20 transition-colors">
          {(user.fullname?.charAt(0) || user.username?.charAt(0) || 'A').toUpperCase()}
        </div>
      </Link>
      <button 
        onClick={handleLogout} 
        title="Đăng xuất" 
        className="w-9 h-9 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  );
};

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const socketContext = useSocket();
  const globalUnreadCount = socketContext?.globalUnreadCount || 0; 
  const setGlobalUnreadCount = socketContext?.setGlobalUnreadCount;
  const socket = socketContext?.socket; 
  const role = getUserRoleFromToken(); 
  const location = useLocation(); // 🎯 Bắt URL hiện tại

  // =========================================================================
  // 🎯 ĐIỀU CHỈNH CỐT LÕI: Thêm location.pathname vào dependency array.
  // Giúp Header tự động gọi API đồng bộ lại unread chuẩn chỉ ngay khi chuyển trang mà không cần F5.
  // =========================================================================
  useEffect(() => {
    const syncUnreadCount = async () => {
      if (role !== 'customer' && typeof setGlobalUnreadCount === 'function') {
        try {
          const response = await chatService.getConversations(COMPANY_ID);
          const rows = response?.data?.rows || [];
          const totalUnread = rows.reduce((acc, room) => acc + Number(room.unreadcount_staff || 0), 0);
          setGlobalUnreadCount(totalUnread);
        } catch (error) {
          console.error("❌ [Header Init Unread Error]:", error);
        }
      }
    };
    syncUnreadCount();
  }, [role, setGlobalUnreadCount, location.pathname]); 

  useEffect(() => {
      const handleRoomRead = (event) => {
          const clearedCount = event.detail?.unreadCleared || 0;
          if (clearedCount > 0 && typeof setGlobalUnreadCount === 'function') {
              setGlobalUnreadCount(prev => Math.max(0, prev - clearedCount));
          }
      };

      window.addEventListener('chat:mark_room_read', handleRoomRead);
      return () => window.removeEventListener('chat:mark_room_read', handleRoomRead);
  }, [setGlobalUnreadCount]);

  // 🎯 Lắng nghe Socket liên tục trên toàn cục Header
  useEffect(() => {
    if (!socket) return; 

    const handleGlobalMessage = (data) => {
        const incomingSenderType = Number(data.sendertype || data.sender_type);
        
        let isFromOther = false;
        
        if (role === 'staff' && incomingSenderType === 1) {
            isFromOther = true;
        } 
        else if (role === 'customer' && incomingSenderType === 2) {
            isFromOther = true;
        }

        if (isFromOther && typeof setGlobalUnreadCount === 'function') {
            // Chỉ tăng bộ đếm nếu user KHÔNG Ở TRANG CHAT
            // Dùng location.pathname thay vì window.location để React theo dõi chính xác hơn
            if(!location.pathname.startsWith('/chat')) {
                 setGlobalUnreadCount(prev => prev + 1);
            }
        }
    };

    socket.on('chat:message', handleGlobalMessage);
    return () => socket.off('chat:message', handleGlobalMessage);
  }, [socket, role, setGlobalUnreadCount, location.pathname]);

  const filteredLinks = NAV_LINKS.filter(link => {
    if (link.allowedRoles) return link.allowedRoles.includes(role);
    
    if (role === 'customer') {
      const customerPaths = ['/products', '/orders', '/chat', '/notifications', '/profile'];
      return customerPaths.some(p => link.path.startsWith(p));
    }
    return true; 
  });

  return (
    <header className="w-full bg-[#0037B0] border-b border-white/20 sticky top-0 z-40 shadow-md h-[56px] flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center flex-1">
            <Logo />
            <NavigationLinks filteredLinks={filteredLinks} />
          </div>
          
          <div className="flex items-center gap-4"> 
            <div className="hidden md:flex items-center gap-4">
              <NotificationDropdown />
              
              <Link to="/chat" className="relative flex items-center justify-center group" title="Tin nhắn">
                <Button 
                  variant="icon" 
                  className="h-10 w-10 p-0 flex items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-md shadow-[#002780]/30 transition-all duration-300 hover:bg-white/15 hover:border-white/25 hover:scale-105 active:scale-95"
                >
                  <img 
                    src={chaticon} 
                    alt="Chat Icon" 
                    className="h-[22px] w-[22px] object-contain opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110"
                  />
                </Button>
                
                {/* 🎯 Bỏ chặn role === 'staff', áp dụng chung cho mọi user */}
                {globalUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold text-white shadow-lg shadow-red-500/40 border border-[#0037B0] transition-transform duration-300 group-hover:scale-110">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                    <span className="relative z-10">{globalUnreadCount > 99 ? '99+' : globalUnreadCount}</span>
                  </span>
                )}
              </Link>
            </div>
            
            <div className="hidden md:block">
              <UserMenu />
            </div>
            
            <div className="md:hidden flex items-center -mr-2">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-expanded="false"
              >
                <span className="sr-only">Mở menu chính</span>
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0037B0] absolute top-[56px] left-0 w-full shadow-lg z-50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {filteredLinks.map(link => (
              <NavLink 
                key={`mobile-${link.path}`} 
                to={link.path} 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="block p-0"
              >
                {({ isActive }) => (
                  <ActiveWrapper
                    isActive={isActive}
                    as="span"
                    className="block px-3 py-2 rounded-md text-base"
                  >
                    {link.label}
                  </ActiveWrapper>
                )}
              </NavLink>
            ))}
            
            {globalUnreadCount > 0 && (
              <Link to="/chat" className="block px-3 py-2 rounded-md text-base font-medium text-white/80 hover:bg-white/10 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                Tin nhắn <span className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">{globalUnreadCount > 99 ? '99+' : globalUnreadCount}</span>
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-white/10">
            <div className="px-4">
              <UserMenu />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;