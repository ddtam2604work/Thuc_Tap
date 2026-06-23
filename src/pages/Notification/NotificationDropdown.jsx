import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../hooks/Notification/useNotification';
import Button from "../../components/skeleton/Button";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownTab, setDropdownTab] = useState('all'); // 'all' hoặc 'unread'
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  // Nạp các hàm nghiệp vụ từ Hook tách biệt
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    fetchNotifications, 
    markAllAsRead, 
    handleNotificationClick 
  } = useNotification();

  // 🎯 TỰ ĐỘNG RE-FETCH THEO TAB KHI DROPDOWN ĐANG MỞ
  useEffect(() => {
    if (isOpen) {
      const isReadParam = dropdownTab === 'unread' ? 0 : undefined;
      fetchNotifications(1, 20, isReadParam);
    }
  }, [isOpen, dropdownTab, fetchNotifications]);

  // Tự động đóng Dropdown khi click ra ngoài vùng hiển thị
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="icon" 
        className={`relative h-10 w-10 flex items-center justify-center rounded-full border border-white/10 shadow-md shadow-[#002780]/30 transition-all duration-300 group hover:scale-105 active:scale-95 ${
          isOpen ? 'bg-white/20 border-white/30 scale-105' : 'bg-white/5 hover:bg-white/15 hover:border-white/25'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={`h-[22px] w-[22px] transition-all duration-300 ${
            isOpen ? 'text-white scale-110' : 'text-white/80 group-hover:text-white group-hover:scale-110'
          }`}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold text-white shadow-lg shadow-red-500/40 border border-[#0037B0] transition-transform duration-300 group-hover:scale-110">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
            <span className="relative z-10">{unreadCount > 99 ? '99+' : unreadCount}</span>
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 text-gray-800 animate-in fade-in slide-in-from-top-3 duration-200 flex flex-col">
          
          <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-lg">
            <span className="font-bold text-sm text-[#191C1D]">Thông báo</span>
            <div className="flex bg-gray-200/70 p-0.5 rounded-md text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setDropdownTab('all')}
                className={`px-2.5 py-1 rounded transition-all ${dropdownTab === 'all' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setDropdownTab('unread')}
                className={`px-2.5 py-1 rounded transition-all ${dropdownTab === 'unread' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Chưa đọc
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
            {isLoading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Đang tải dữ liệu...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">
                Không có thông báo mới nào
              </div>
            ) : (
              notifications.map((noti) => { 
                const isUnread = !noti.is_read && noti.status !== 'read';
                return (
                  <div 
                    key={noti.id}
                    onClick={() => {
                      handleNotificationClick(noti);
                      setIsOpen(false);
                    }}
                    className={`px-4 py-3 text-left hover:bg-gray-50 cursor-pointer transition-colors flex gap-2.5 items-start ${isUnread ? 'bg-blue-50/30' : ''}`}
                  >
                    {isUnread && (
                      <span className="w-2 h-2 mt-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs text-gray-900 leading-snug ${isUnread ? 'font-semibold' : 'font-normal'}`}>
                        {noti.title || noti.message || 'Thông báo hệ thống'}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{noti.message}</p>
                      <span className="text-[10px] text-gray-400 block mt-1">
                        {noti.createdate ? new Date(noti.createdate).toLocaleDateString('vi-VN') : 'Vừa xong'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-gray-100 p-2 text-center bg-gray-50/30 rounded-b-lg flex flex-col gap-1">
            <button
              type="button"
              onClick={() => { setIsOpen(false); navigate('/notifications'); }}
              className="text-xs text-gray-500 font-medium hover:text-blue-600 transition-colors w-full block py-1 border-t border-gray-100/60 mt-0.5"
            >
              Xem tất cả các thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;