import PrimaryButton from '../../components/skeleton/PrimaryButton';
import lockIcon from '../../assets/images/icon_lock_account.png';

const LockAccountModal = ({ isOpen, onClose, onConfirm, accountName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-[#2E3132]/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
      
      {/* Modal Container: 448px */}
      <div className="bg-white w-[448px] max-w-full rounded-lg border border-[#C4C5D7] shadow-lg flex flex-col overflow-hidden animate-in zoom-in duration-300">
        
        {/* Header & Content Section */}
        <div className="flex flex-col items-center px-8 pt-8 pb-6 text-center">
          {/* Warning Icon: Background #FFDAD6, Icon #BA1A1A */}
          <div className="w-12 h-12 bg-[#FFDAD6] rounded-xl flex items-center justify-center mb-5 shadow-sm shadow-red-100">
            <img src={lockIcon} alt="lock" className="w-12 h-12" />
          </div>

          <h2 className="font-inter font-semibold text-[18px] text-[#191C1D] mb-2 leading-7">
            Khóa tài khoản?
          </h2>
          
          <p className="font-inter text-[14px] leading-[23px] text-[#434655]">
            Tài khoản <span className="font-bold text-gray-800">{accountName}</span> sẽ tạm thời không thể truy cập cho đến khi được mở khóa lại bởi quản trị viên.
          </p>
        </div>

        {/* Action Buttons Section: Background #F3F4F5 */}
        <div className="px-6 py-4 bg-[#F3F4F5] border-t border-[#C4C5D7] flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 h-10 bg-[#E7E8E9] border border-[#C4C5D7] rounded-[4px] text-[16px] font-medium text-[#434655] hover:bg-gray-200 transition-all min-w-[104px]"
          >
            Hủy bỏ
          </button>
          
          <PrimaryButton 
            onClick={onConfirm}
            className="w-auto h-10 px-6 bg-[#c95c09] rounded-[4px] flex items-center gap-2 shadow-md"
          >
            {/* Icon Lock mờ bên trái text */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span className="text-[16px] font-semibold">Khóa tài khoản</span>
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default LockAccountModal;