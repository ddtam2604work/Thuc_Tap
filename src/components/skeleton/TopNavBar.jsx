// src/components/TopNavBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS, HEADER_TITLE } from '../../constants/navigation';
import { useAuth } from '../../hooks/Login/useAuth';
import { useSocket } from '../../context/SocketContext'; // Tích hợp Hook Socket
import { getUserRoleFromToken } from '../../utils/auth';

// Import ICON & Component
import Button from './Button'; // Chú ý kiểm tra lại đường dẫn import Button của bạn
import notificationIcon from '../../assets/images/icon_chuong_thong_bao.png';
import chatIcon from '../../assets/images/icon_chat.png';
import NotificationDropdown from '../common/NotificationDropdown';

const TopNavBar = () => {
  const { logout } = useAuth();
  const location = useLocation(); // Hook lấy path hiện tại để xử lý Active Menu
  const role = getUserRoleFromToken();
  
  // Lấy state đếm số tin nhắn từ Socket
  // Dùng fallback an toàn (?.) để tránh crash app nếu chưa bọc Provider
  const socketContext = useSocket();
  const globalUnreadCount = socketContext?.globalUnreadCount || 0;
  
  // State quản lý Dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Logic: Đóng dropdown khi click ra ngoài vùng avatar/menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout(); // Gọi logic logout từ useAuth (đã bao gồm xóa token và chuyển trang)
  };

  return (
    <header className="sticky top-0 z-50 flex h-[56px] w-full items-center justify-between bg-[#0037B0] px-4 shadow-md border-b border-white/20">
      
      {/* Left side: Title */}
      <div className="flex items-center w-[122px]">
        <h1 className="text-[24px] font-bold leading-[32px] tracking-[-0.24px] text-white whitespace-nowrap">
          {HEADER_TITLE.TITLE}
        </h1>
      </div>

      {/* Middle: Links */}
      <nav className="flex flex-1 items-center justify-start pl-8">
        {role !== 'customer' && (
        <ul className="flex items-center gap-[24px]">
          {NAV_LINKS.map((link) => {
            // Kiểm tra xem path hiện tại có khớp với link không (tạo trạng thái active)
            const isActive = location.pathname.includes(link.path);
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`inline-block rounded-[4px] px-3 py-1.5 text-[12px] font-medium uppercase tracking-[0.6px] transition-all whitespace-nowrap
                    ${isActive 
                      ? 'bg-white/10 text-white font-bold shadow-inner' 
                      : 'text-white opacity-80 hover:opacity-100 hover:bg-white/5'
                    }
                  `}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
        )}
      </nav>

      {/* Right side: Icons & Avatar */}
      <div className="flex items-center gap-4">
        
        {role !== 'customer' && (
          <>
            {/* Notification Icon */}
            <NotificationDropdown />
            
            {/* Chat Icon (Tích hợp link & Badge đếm tin nhắn) */}
            <Link to="/chat" className="relative flex items-center justify-center">
              <Button variant="icon" className="h-[34px] w-[34px] p-0 hover:bg-white/10 transition-colors rounded-lg flex items-center justify-center">
                <div 
                  style={{ maskImage: `url(${chatIcon})` }}
                  className="h-[19px] w-[19px] bg-white [mask-size:contain] [mask-repeat:no-repeat]" 
                />
              </Button>
              
              {/* Badge: Chỉ hiển thị khi có tin nhắn chưa đọc (globalUnreadCount > 0) */}
              {globalUnreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-[#0037B0] animate-in zoom-in">
                  {globalUnreadCount > 99 ? '99+' : globalUnreadCount}
                </span>
              )}
            </Link>
          </>
        )}

        {/* Profile Avatar & Dropdown Logic */}
        <div className="relative ml-2" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex h-8 w-8 items-center justify-center rounded-xl border-2 p-[2px] transition-all focus:outline-none 
              ${isDropdownOpen ? 'border-white bg-white/20' : 'border-white/20 hover:border-white/60'}
            `}
          >
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white/30 overflow-hidden text-white text-[12px] font-bold">
              <span>A</span>
            </div>
          </button>

          {/* Dropdown Menu Box */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg py-1 border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200">
              
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Tài khoản</p>
                <p className="text-[13px] font-bold text-[#1E293B] truncate">Quản trị viên</p>
              </div>
              
              {/* Menu Links */}
              <div className="py-1">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-[#F0F5FF] hover:text-[#0037B0] transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Thông tin cá nhân
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-[#F0F5FF] hover:text-[#0037B0] transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Cài đặt hệ thống
                </Link>
              </div>

              {/* Logout Action */}
              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-[13px] font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default TopNavBar;