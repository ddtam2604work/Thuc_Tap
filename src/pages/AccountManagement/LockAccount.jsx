import Button from '../../components/skeleton/Button';
import lockIcon from '../../assets/images/icon_lock_account.png';

// ĐÃ SỬA: Bổ sung thêm biến isActive vào tham số nhận (props)
const LockAccountModal = ({ isOpen, onClose, onConfirm, accountName, isActive }) => {
  if (!isOpen) return null;
  
  // LOGIC ĐỊNH TUYẾN: 
  // - Nếu isActive đang là 1 (hoặc true) -> Tài khoản đang sống -> Nhu cầu là KHÓA
  // - Nếu isActive đang là 0 (hoặc false) -> Tài khoản đã chết -> Nhu cầu là MỞ KHÓA
  const currentlyActive = String(isActive) === "1" || isActive === true;
  const isLocking = currentlyActive;

  return (
    // Thêm onClick={onClose} ở nền để click ra ngoài tự tắt form
    <div 
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-[#2E3132]/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-[448px] max-w-full rounded-lg border border-[#C4C5D7] shadow-lg flex flex-col overflow-hidden animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()} // Chặn click thủng qua Modal
      >
        
        {/* Header & Content Section */}
        <div className="flex flex-col items-center px-8 pt-8 pb-6 text-center">
          
          {/* ĐÃ SỬA UI: Đổi màu nền Icon đỏ (Khóa) hoặc xanh (Mở Khóa) */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-sm ${isLocking ? 'bg-[#FFDAD6] shadow-red-100' : 'bg-green-100 shadow-green-100'}`}>
            <img src={lockIcon} alt="lock" className="w-12 h-12" />
          </div>

          <h2 className="font-inter font-semibold text-[18px] text-[#191C1D] mb-2 leading-7">
            {isLocking ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?'}
          </h2>
          
          {/* ĐÃ SỬA UI: Thông báo thay đổi theo ngữ cảnh */}
          <p className="font-inter text-[14px] leading-[23px] text-[#434655]">
            {isLocking 
              ? <>Tài khoản <span className="font-bold text-gray-800">{accountName}</span> sẽ tạm thời không thể truy cập hệ thống.</>
              : <>Tài khoản <span className="font-bold text-gray-800">{accountName}</span> sẽ được khôi phục lại quyền truy cập.</>
            }
          </p>
        </div>

        {/* Action Buttons Section */}
        <div className="px-6 py-4 bg-[#F3F4F5] border-t border-[#C4C5D7] flex justify-end gap-3">
          <Button variant="outline-secondary" onClick={onClose} className="px-6 h-10 bg-[#E7E8E9] border border-[#C4C5D7] rounded-[4px] text-[16px] font-medium text-[#434655] hover:bg-gray-200 transition-all min-w-[104px]">
            Hủy bỏ
          </Button>
          
          {/* ĐÃ SỬA UI: Đổi màu nút bấm (Khóa = Đỏ cam, Mở Khóa = Xanh dương) */}
          <Button 
            onClick={onConfirm}
            className={`w-auto h-10 px-6 rounded-[4px] flex items-center gap-2 shadow-md text-white transition-colors ${isLocking ? 'bg-[#c95c09] hover:bg-[#a64a06]' : 'bg-[#0037B0] hover:bg-blue-800'}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {isLocking ? (
                // Vẽ Icon Ổ khóa đang đóng
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </>
              ) : (
                // Vẽ Icon Ổ khóa đã mở
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                </>
              )}
            </svg>
            <span className="text-[16px] font-semibold">{isLocking ? 'Khóa tài khoản' : 'Mở khóa'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LockAccountModal;