import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNotification } from '../../hooks/Notification/useNotification';
import Button from '../../components/skeleton/Button';

const NotificationPage = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' hoặc 'unread'
  const [displayLimit, setDisplayLimit] = useState(20); // Điều khiển số lượng phần tử render hiển thị khi cuộn
  const scrollContainerRef = useRef(null);

  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    fetchNotifications, 
    markAllAsRead, 
    handleNotificationClick 
  } = useNotification();

  // 🎯 LUỒNG NẠP MỘT LƯỢNG BẢN GHI LỚN VỪA ĐỦ ĐỂ PHỤC VỤ VIỆC CUỘN XEM (INFINITE SCROLL)
  useEffect(() => {
    const readParam = activeTab === 'unread' ? 0 : undefined;
    // Nạp max 150 tin gần nhất để cuộn mượt mà thay vì phân trang nút bấm
    fetchNotifications(1, 150, readParam);
    setDisplayLimit(20); // Reset giới hạn ảo về 20 khi chuyển Tab
  }, [activeTab, fetchNotifications]);

  // 🎯 ĐÁNH CHẶN SỰ KIỆN CUỘN CONTAINER ĐỂ LOAD THÊM DATA ĐỘT BIẾN GIỐNG TRONG CLIP
  const handleContainerScroll = useCallback((e) => {
    const target = e.target;
    // Khi người dùng cuộn đến cách đáy khung 30px, tiến hành mở rộng view hiển thị
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 30) {
      if (displayLimit < notifications.length) {
        setDisplayLimit(prev => prev + 25);
      }
    }
  }, [displayLimit, notifications.length]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div className="w-full min-h-screen bg-gray-100/40 p-4 font-inter text-[#191C1D]">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xs border border-gray-100 flex flex-col h-[calc(100vh-40px)] bg-white">
        
        {/* Header Bar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-xl shrink-0">
          <div>
            <h1 className="text-base font-bold text-gray-900">
              Thông báo
            </h1>
          </div>
          {unreadCount > 0 && (
            <button 
              type="button"
              onClick={markAllAsRead} 
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              Đánh dấu đã đọc tất cả
            </button>
          )}
        </div>

        {/* 🎯 TABS ĐIỀU HƯỚNG CẤP CAO ĐỒNG BỘ THEO PHÂN CẢNH GIÂY 0:11 */}
        <div className="px-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleTabChange('all')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'all' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('unread')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'unread' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Chưa đọc
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* 🎯 KHUNG CONTAINER CUỘN HOÀN TOÀN TỰ ĐỘNG - KHÔNG PHÂN TRANG */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleContainerScroll}
          className="flex-1 overflow-y-auto divide-y divide-gray-100 bg-white"
        >
          {isLoading && notifications.length === 0 ? (
            <div className="p-16 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Đang đồng bộ hóa thông báo...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-16 text-center text-xs text-gray-400 italic">
              {activeTab === 'unread' ? 'Không có thông báo chưa đọc nào' : 'Hộp thư thông báo trống'}
            </div>
          ) : (
            notifications.slice(0, displayLimit).map((noti) => {
              const isUnread = !noti.is_read && noti.status !== 'read';
              return (
                <div
                  key={noti.id}
                  onClick={() => handleNotificationClick(noti)}
                  className={`p-4 text-left hover:bg-gray-50/50 cursor-pointer transition-all flex gap-3.5 items-start ${
                    isUnread ? 'bg-blue-50/10' : ''
                  }`}
                >
                  {/* 🎯 BADGE TRÒN CHỮ "CS" KHỚP CHUẨN THEO VIDEO MINH HỌA */}
                  <div className="shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white ${
                      isUnread ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}>
                      CS
                    </div>
                  </div>

                  {/* Chi tiết nội dung thông báo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col justify-between gap-0.5">
                      <p className={`text-xs text-gray-900 leading-relaxed ${isUnread ? 'font-normal' : 'font-normal'}`}>
                        <span className="font-bold text-gray-900 mr-1">{noti.title || 'Chỉnh sửa đơn hàng'}</span>
                        {noti.message}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2.5 mt-1.5">
                      <span className="text-[10px] text-gray-400 font-medium">
                        {noti.createdate ? new Date(noti.createdate).toLocaleDateString('vi-VN') : 'Vừa xong'}
                      </span>
                      {noti.reference_code && (
                        <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
                          Mã: {noti.reference_code}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Cảnh báo chân trang khi người dùng đã cuộn hết dữ liệu thô */}
          {!isLoading && notifications.length > 0 && displayLimit >= notifications.length && (
            <div className="p-4 text-center text-[11px] text-gray-400 bg-gray-50/40 select-none">
              ✓ Bạn đã xem hết tất cả thông báo mới nhất
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NotificationPage;