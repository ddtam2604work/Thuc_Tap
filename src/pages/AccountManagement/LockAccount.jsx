import Button from '../../components/skeleton/Button';
import lockIcon from '../../assets/images/icon_lock_account.png';

const LockAccountModal = ({ isOpen, onClose, onConfirm, accountName, isActive }) => {
  if (!isOpen) return null;
  
  const currentlyActive = String(isActive) === "1" || isActive === true;
  const isLocking = currentlyActive;

  return (
    <div 
      // 🛠️ ĐỔNG BỘ UI: Nền backdrop mờ nhẹ kết hợp blur chuẩn form mẫu tài khoản
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        // 🛠️ ĐỔNG BỘ UI: Bo góc rounded-2xl hiện đại giống form mẫu
        className="bg-white w-[448px] max-w-full rounded-2xl border border-gray-100 shadow-xl flex flex-col overflow-hidden animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* Header & Content Section */}
        <div className="flex flex-col items-center px-8 pt-8 pb-6 text-center">
          
          {/* Đổi màu nền Icon và bo góc nhẹ */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-sm ${isLocking ? 'bg-[#FFDAD6] shadow-red-100' : 'bg-green-100 shadow-green-100'}`}>
            <img src={lockIcon} alt="lock" className="w-12 h-12" />
          </div>

          <h2 className="font-inter font-semibold text-[18px] text-[#191C1D] mb-2 leading-7">
            {isLocking ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?'}
          </h2>
          
          <p className="font-inter text-[14px] leading-[23px] text-gray-500">
            {isLocking 
              ? <>Tài khoản <span className="font-semibold text-gray-800">{accountName}</span> sẽ tạm thời không thể truy cập hệ thống.</>
              : <>Tài khoản <span className="font-semibold text-gray-800">{accountName}</span> sẽ được khôi phục lại quyền truy cập.</>
            }
          </p>
        </div>

        {/* Action Buttons Section */}
        {/* 🛠️ ĐỔNG BỘ UI: Biến đổi footer chứa cụm nút bấm chuẩn khung bg-gray-50/60, border-t và rounded-b-2xl từ form mẫu */}
        <div className="flex justify-end items-center gap-2.5 px-6 py-4 bg-gray-50/60 border-t border-gray-100 rounded-b-2xl">
          
          {/* Nút Hủy */}
          <Button 
            variant="outline-secondary" 
            onClick={onClose} 
            className="h-9 px-4 text-xs font-bold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors min-w-[90px]"
          >
            Hủy bỏ
          </Button>
          
          {/* Nút Xác nhận Khóa / Mở Khóa */}
          <Button 
            onClick={onConfirm}
            className={`h-9 px-5 text-xs font-bold uppercase tracking-wider text-white rounded-xl shadow-xs transition-all flex items-center gap-2 ${
              isLocking 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                : 'bg-[#0037B0] hover:bg-[#00267A] shadow-blue-200'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {isLocking ? (
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </>
              ) : (
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                </>
              )}
            </svg>
            <span>{isLocking ? 'Khóa tài khoản' : 'Mở khóa'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LockAccountModal;