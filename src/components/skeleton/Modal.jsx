import { useEffect } from 'react';

/**
 * Modal Component dùng chung cho toàn bộ hệ thống
 * @param {boolean} isOpen - Trạng thái đóng/mở
 * @param {function} onClose - Hàm xử lý khi nhấn đóng hoặc click ra ngoài
 * @param {string} title - Tiêu đề của Modal
 * @param {React.ReactNode} children - Nội dung bên trong Modal (thường là các Form)
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  // Xử lý đóng Modal khi nhấn phím Escape (Nguyên tắc Fail-Fast & UX)
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Ngăn cuộn trang phía sau khi Modal đang mở
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Lớp nền mờ (Backdrop) - Khớp với hình ảnh thiết kế */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity" 
        onClick={onClose}
      />

      {/* Nội dung Modal (Card) */}
      <div className="relative w-full max-w-[560px] bg-white rounded-[16px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header Modal */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-[24px] font-bold text-[#191C1D] leading-[32px]">
              {title}
            </h3>
            {/* Nút đóng nhanh (X) */}
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-[14px] text-gray-500 mt-1">
            Vui lòng điền đầy đủ các thông tin cần thiết bên dưới.
          </p>
        </div>

        {/* Body Modal - Nơi chứa FormInsertCategory hoặc FormEditCategory */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;