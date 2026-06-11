import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSocket } from '../../context/SocketContext';
import { notificationService } from '../../services/notificationService';
import Button from '../skeleton/Button';
import notificationIcon from '../../assets/images/icon_chuong_thong_bao.png';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const socketContext = useSocket();
  const socket = socketContext?.socket;

  // Lấy Token xác thực đồng bộ với App.jsx (accessToken)
  const authState = useSelector((state) => state.auth);
  const authToken = authState?.token || 
                    authState?.accessToken || 
                    localStorage.getItem('accessToken') || 
                    localStorage.getItem('token');

  // Hàm nạp danh sách thông báo ban đầu
  const loadNotifications = async () => {
    if (!authToken) return;
    setIsLoading(true);
    try {
      const result = await notificationService.getPersonalPaging(authToken, 1, 20, "");
      if (result?.data) {
        const list = Array.isArray(result.data) ? result.data : (result.data.items || []);
        setNotifications(list);
        
        const unread = list.filter(n => !n.is_read && n.status !== 'read').length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Lỗi nạp danh sách thông báo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // HÀM XỬ LÝ ĐỌC TẤT CẢ THÔNG BÁO CHƯA ĐỌC
  const handleMarkAllAsRead = async () => {
    if (!authToken || unreadCount === 0) return;

    // 1. Lọc tìm các thông báo chưa đọc hiện có trong danh sách hiển thị
    const unreadNotifications = notifications.filter(n => !n.is_read && n.status !== 'read');

    // 2. Thực hiện cập nhật UI Đột biến lập tức (Optimistic Update) giúp ứng dụng mượt mà không bị khựng
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true, status: 'read' }))
    );
    setUnreadCount(0);

    try {
      // 3. Sử dụng Promise.all kích hoạt đồng thời các request detail lên Server để đồng bộ trạng thái lưu trữ
      await Promise.all(
        unreadNotifications.map(noti => 
          notificationService.getPersonalDetail(authToken, noti.id)
        )
      );
    } catch (error) {
      console.error("Lỗi đồng bộ trạng thái đọc tất cả lên Server:", error);
      // Phương án phòng thủ dự phòng: Nếu mạng lỗi thì kéo lại danh sách chuẩn từ DB
      loadNotifications();
    }
  };

  // XỬ LÝ CLICK: ĐỌC API DETAIL VÀ CHUYỂN THẲNG ĐẾN TRANG ĐÍCH (VÍ DỤ: /orders/[id])
  const handleItemClick = async (noti) => {
    if (!authToken) return;
    try {
      // 1. Thực hiện chuẩn xác Request POST 'get-personal-detail' giống Postman của bạn
      // Mục đích: Để Backend cập nhật trạng thái thông báo này thành "Đã đọc"
      const result = await notificationService.getPersonalDetail(authToken, noti.id);
      
      // Bóc tách dữ liệu phản hồi từ API detail vừa gọi
      const detailData = result?.data || result;

      // 2. Cập nhật nhanh trạng thái giao diện Dropdown tại chỗ
      setNotifications(prev => 
        prev.map(n => n.id === noti.id ? { ...n, is_read: true, status: 'read' } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      setIsOpen(false);

      // 3. ĐIỀU HƯỚNG TRỰC TIẾP ĐẾN TRANG NGHIỆP VỤ GỐC (KHÔNG QUA TRANG PHỤ)
      // Tìm kiếm ID đơn hàng hoặc đường dẫn được trả về trong chi tiết thông báo
      const targetPath = detailData?.redirect_url || detailData?.path || noti.redirect_url || noti.path;
      const businessId = detailData?.order_id || detailData?.reference_id || detailData?.data_id || 
                         noti.order_id || noti.reference_id || noti.data_id;

      if (targetPath) {
        // Nếu Backend trả về sẵn một chuỗi path đầy đủ (ví dụ: "/orders/be3ccce8-...")
        navigate(targetPath);
      } else if (businessId) {
        // Nếu Backend trả về mã ID đơn hàng riêng biệt, ghép trực tiếp vào Route hệ thống của bạn
        navigate(`/orders/${businessId}`);
      } else {
        // Trường hợp bất khả kháng nếu không tìm thấy ID liên kết nào khác, đưa về trang danh sách đơn hàng
        navigate('/orders');
      }

    } catch (error) {
      console.error("Lỗi xử lý điều hướng thông báo trực tiếp:", error);
      // Phòng thủ lỗi mạng: Dự phòng tìm ID từ dữ liệu thô ban đầu để chuyển trang cho user
      const fallbackId = noti.order_id || noti.reference_id || noti.data_id;
      if (fallbackId) {
        navigate(`/orders/${fallbackId}`);
      } else {
        navigate('/orders');
      }
    }
  };

  // Lắng nghe cổng Socket thời gian thực
  useEffect(() => {
    if (authToken) {
      loadNotifications();
    }

    if (socket) {
      socket.on('notification:web', (newNoti) => {
        if (newNoti) {
          setNotifications(prev => [newNoti, ...prev.slice(0, 19)]);
          setUnreadCount(prev => prev + 1);
        }
      });

      socket.on('notification:web_read', (data) => {
        if (data?.id) {
          setNotifications(prev => 
            prev.map(n => n.id === data.id ? { ...n, is_read: true, status: 'read' } : n)
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('notification:web');
        socket.off('notification:web_read');
      }
    };
  }, [socket, authToken]);

  // Tự động đóng Dropdown khi click ra ngoài vùng Ref
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
        className={`relative h-[34px] w-[34px] p-0 flex items-center justify-center rounded-lg text-white transition-colors ${isOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications();
        }}
      >
        <div 
          style={{ maskImage: `url(${notificationIcon})` }}
          className="h-[19px] w-[15px] bg-white [mask-size:contain] [mask-repeat:no-repeat]" 
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-[#0037B0] animate-in zoom-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Giao diện danh sách thông báo xổ xuống */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 text-gray-800 animate-in fade-in slide-in-from-top-3 duration-200 flex flex-col">
          <div className="px-4 py-2.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-lg">
            <span className="font-bold text-sm text-[#191C1D]">Thông báo</span>
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
                    onClick={() => handleItemClick(noti)}
                    className={`px-4 py-3 text-left hover:bg-gray-50 cursor-pointer transition-colors flex gap-2.5 items-start ${isUnread ? 'bg-blue-50/30' : ''}`}
                  >
                    {isUnread && (
                      <span className="w-2 h-2 mt-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs text-gray-900 leading-snug ${isUnread ? 'font-semibold' : 'font-normal'}`}>
                        {noti.title || noti.content || 'Thông báo hệ thống'}
                      </p>
                      {noti.title && noti.content && (
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{noti.content}</p>
                      )}
                      <span className="text-[10px] text-gray-400 block mt-1">
                        {noti.created_at ? new Date(noti.created_at).toLocaleDateString('vi-VN') : 'Vừa xong'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 🌟 BỔ SUNG THÊM NÚT THỨ HAI (FOOTER BUTTON): Tự động xuất hiện dưới đáy danh sách khi có thông báo chưa đọc */}
          {unreadCount > 0 && (
            <div className="border-t border-gray-100 p-2 text-center bg-gray-50/30 rounded-b-lg">
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 font-semibold hover:text-[#0037B0] hover:underline transition-colors w-full block py-1.5"
              >
                Đánh dấu tất cả đã đọc
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;