import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSocket } from '../../context/SocketContext';
import { notificationService } from '../../services/notificationService';

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const socketContext = useSocket();
  const socket = socketContext?.socket;

  // Trích xuất Token xác thực từ Redux Global State hoặc LocalStorage
  const authState = useSelector((state) => state.auth);
  const authToken = authState?.token || 
                    authState?.accessToken || 
                    localStorage.getItem('accessToken') || 
                    localStorage.getItem('token');

  const fetchNotifications = useCallback(async (page = 1, pageSize = 20, isReadFilter = undefined) => {
    if (!authToken) return;
    setIsLoading(true);
    try {
      const result = await notificationService.getPersonalPaging(authToken, page, pageSize, isReadFilter);
      
      if (result?.data) {
        const items = result.data.items || [];
        setNotifications(items);
        setTotalItems(result.data.total || 0);
        
        if (result.data.unread_count !== undefined) {
          setUnreadCount(Number(result.data.unread_count));
        } else {
          const unread = items.filter(n => !n.is_read && n.status !== 'read').length;
          setUnreadCount(unread);
        }
      }
    } catch (error) {
      console.error("❌ Lỗi nạp dữ liệu thông báo từ Hook:", error);
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  // 🎯 LẮNG NGHE SỰ KIỆN ĐỒNG BỘ: Bắt tín hiệu để xóa số trên icon ngay lập tức
  useEffect(() => {
    const handleSyncMarkAll = () => {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, status: 'read' })));
      setUnreadCount(0);
    };

    window.addEventListener('sync_notifications_read', handleSyncMarkAll);
    return () => window.removeEventListener('sync_notifications_read', handleSyncMarkAll);
  }, []);

  const markAllAsRead = async () => {
    if (!authToken || unreadCount === 0) return;

    const unreadNotifications = notifications.filter(n => !n.is_read && n.status !== 'read');

    // 🎯 PHÁT TÍN HIỆU ĐỒNG BỘ: Báo cho Dropdown và tất cả các component khác update UI
    window.dispatchEvent(new Event('sync_notifications_read'));

    try {
      await Promise.all(
        unreadNotifications.map(noti => 
          notificationService.getPersonalDetail(authToken, noti.id)
        )
      );
    } catch (error) {
      console.error("Lỗi đồng bộ trạng thái đọc tất cả:", error);
      fetchNotifications(1, 20); // Rollback dữ liệu nếu lỗi
    }
  };

  const handleNotificationClick = async (noti) => {
    if (!authToken) return;
    try {
      const result = await notificationService.getPersonalDetail(authToken, noti.id);
      const detailData = result?.data || result;

      setNotifications(prev => 
        prev.map(n => n.id === noti.id ? { ...n, is_read: true, status: 'read' } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      const targetPath = detailData?.redirect_url || detailData?.path || noti.redirect_url || noti.path;
      const businessId = detailData?.order_id || detailData?.reference_id || detailData?.data_id || 
                         noti.order_id || noti.reference_id || noti.data_id;

      if (targetPath) {
        navigate(targetPath);
      } else if (businessId) {
        navigate(`/orders/${businessId}`);
      } else {
        navigate('/orders');
      }
    } catch (error) {
      console.error("Lỗi xử lý điều hướng thông báo:", error);
      const fallbackId = noti.order_id || noti.reference_id || noti.data_id;
      navigate(fallbackId ? `/orders/${fallbackId}` : '/orders');
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchNotifications(1, 20);
    }

    if (socket) {
      socket.on('notification:web', (newNoti) => {
        if (newNoti) {
          setNotifications(prev => [newNoti, ...prev.slice(0, 19)]);
          setUnreadCount(prev => prev + 1);
          setTotalItems(prev => prev + 1);
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
  }, [socket, authToken, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    totalItems,
    isLoading,
    fetchNotifications,
    markAllAsRead,
    handleNotificationClick
  };
};