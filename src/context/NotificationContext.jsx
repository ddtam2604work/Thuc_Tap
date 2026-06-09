import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

// Nhúng trực tiếp hiệu ứng chuyển động ẩn/hiện để đảm bảo "cắm là chạy" 
// không cần phải cấu hình lại file tailwind.config.js phức tạp
const injectStyles = `
  @keyframes toastSlideIn {
    from { opacity: 0; transform: translateX(24px) scale(0.95); filter: blur(4px); }
    to { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
  }
  .animate-toast-in {
    animation: toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`;

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Hàm kích hoạt hiệu ứng đóng trước khi xóa hoàn toàn khỏi DOM
  const removeToast = useCallback((id) => {
    // Giai đoạn 1: Bật cờ chuyển trạng thái đóng (isExiting = true) để Tailwind chạy hiệu ứng fade-out
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, isExiting: true } : toast))
    );

    // Giai đoạn 2: Đợi hiệu ứng kết thúc (300ms) rồi mới chính thức xóa khỏi State
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 300);
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    // Thêm thuộc tính isExiting để kiểm soát vòng đời animation
    setToasts((prev) => [...prev, { id, message, type, isExiting: false }]);

    // Tự động kích hoạt chu trình đóng sau khi hết thời gian duration chỉ định
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  // Thiết kế hiện đại: Dạng thẻ trắng tối giản viền màu + đổ bóng nhẹ
  const themeClasses = {
    success: 'bg-white text-gray-800 border-l-4 border-green-500 shadow-xl shadow-green-500/5',
    error: 'bg-white text-gray-800 border-l-4 border-red-500 shadow-xl shadow-red-500/5',
    warning: 'bg-white text-gray-800 border-l-4 border-yellow-500 shadow-xl shadow-yellow-500/5',
    info: 'bg-white text-gray-800 border-l-4 border-blue-500 shadow-xl shadow-blue-500/5',
  };

  // Hệ thống SVG Icons tăng tính nhận diện trực quan cho người dùng
  const icons = {
    success: (
      <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-yellow-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <NotificationContext.Provider value={{ showToast }}>
      <style>{injectStyles}</style>
      {children}
      
      {/* Khung chứa danh sách Toast ở góc phải màn hình */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto min-w-[320px] max-w-md p-4 rounded-xl border border-gray-100/80
              flex items-start gap-3 transform transition-all duration-300 ease-in-out
              ${themeClasses[toast.type]}
              ${toast.isExiting 
                ? 'opacity-0 translate-x-16 scale-90 blur-sm pointer-events-none' 
                : 'animate-toast-in opacity-100 translate-x-0 scale-100'
              }
            `}
          >
            {/* Render Icon động dựa trên type */}
            {icons[toast.type]}

            {/* Nội dung thông điệp */}
            <div className="flex-1 pt-0.5">
              <span className="text-sm font-semibold text-gray-700 leading-snug break-words">
                {toast.message}
              </span>
            </div>

            {/* Nút đóng chủ động (X) */}
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none p-0.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};