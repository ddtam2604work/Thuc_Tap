// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/Login/useAuth';
import { NAV_LINKS } from '../../constants/navigation';
import { useSocket } from '../../context/SocketContext'; 
import { getUserRoleFromToken } from '../../utils/auth'; 
import Button from '../skeleton/Button'; 
import ActiveWrapper from '../skeleton/ActiveWrapper'; 
import NotificationDropdown from '../../pages/Notification/NotificationDropdown';

// ==========================================
// 1. COMPONENT LOGO (ĐIỀU CHỈNH ROUTE ĐỘNG)
// ==========================================
const Logo = () => {
  const role = getUserRoleFromToken();
  // Khách hàng click Logo sẽ về /products, Admin/Staff sẽ về /home
  const targetPath = role === 'customer' ? "/products" : "/home";

  return (
    <Link to={targetPath} className="flex items-center gap-2" title="Trang chủ">
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path d="M13 21H3a2 2 0 01-2-2V5a2 2 0 012-2h8l4 4v2" />
          <path d="M3 21v-2a4 4 0 014-4h7" />
          <path d="M18.88 19.12l-3.76-3.76" />
          <path d="M21 14l-1.5 1.5" />
      </svg>
      <span className="text-xl font-bold text-white tracking-tight">QuanLy</span>
    </Link>
  );
};

// ==========================================
// 2. NAVIGATION LINKS (ĐIỀU CHỈNH LỌC THEO QUYỀN)
// ==========================================
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

// ==========================================
// 3. COMPONENT USER MENU (GIỮ NGUYÊN LOGIC)
// ==========================================
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

// ==========================================
// 4. MAIN HEADER COMPONENT (MỞ KHÓA CHO CUSTOMER)
// ==========================================
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const socketContext = useSocket();
  const globalUnreadCount = socketContext?.globalUnreadCount || 0; 
  const role = getUserRoleFromToken(); 

  // HÀM LỌC MENU: Chỉ hiển thị các route mà Role hiện tại được phép dùng
  const filteredLinks = NAV_LINKS.filter(link => {
    // Cách 1: Nếu file constants/navigation.js của bạn có cấu hình mảng allowedRoles
    if (link.allowedRoles) return link.allowedRoles.includes(role);
    
    // Cách 2: Nếu chưa cấu hình, ta lọc thủ công bằng code dựa trên yêu cầu mới của bạn
    if (role === 'customer') {
      const customerPaths = ['/products', '/orders', '/chat', '/notifications', '/profile'];
      // Chỉ giữ lại những path bắt đầu bằng các tuyến đường trên
      return customerPaths.some(p => link.path.startsWith(p));
    }
    return true; // Admin/Staff xem được hết
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
            {/* Desktop-only icons (Notification and Chat) */}
            <div className="hidden md:flex items-center gap-4">
              {/* ĐÃ BỎ CHẶN role !== 'customer' -> Khách hàng giờ đã thấy Thông báo và Chat */}
              <NotificationDropdown />
              
              {/* Chat Icon */}
              <Link to="/chat" className="relative flex items-center justify-center" title="Tin nhắn">
                <Button 
                  variant="icon" 
                  className="h-9 w-9 p-0 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </Button>
                
                {globalUnreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-[#0037B0] animate-in zoom-in">
                    {globalUnreadCount > 99 ? '99+' : globalUnreadCount}
                  </span>
                )}
              </Link>
            </div>
            
            {/* UserMenu luôn hiển thị trên desktop */}
            <div className="hidden md:block">
              <UserMenu />
            </div>
            
            {/* Mobile Burger Button */}
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0037B0] absolute top-[56px] left-0 w-full shadow-lg z-50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Render các menu mobile đã được lọc quyền */}
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
            
            {/* Hiển thị đếm tin nhắn cho mọi đối tượng (Kể cả customer) */}
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