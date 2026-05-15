import AccountFormInput from '../../components/partials/forms/FormInsert-Account';
import PrimaryButton from '../../components/skeleton/PrimaryButton';
import saveIcon from '../../assets/images/icon_luu.png';

const AccountModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      {/* Modal Container: width 512px */}
      <div className="bg-white w-[512px] rounded-lg shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] border border-[#C4C5D7] overflow-hidden">
        
        {/* Modal Header: bg #F8F9FA, padding 16px 24px */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F8F9FA] border-b border-[#C4C5D7]">
          <h2 className="font-inter font-semibold text-[18px] text-[#191C1D]">Thêm tài khoản</h2>
          <button onClick={onClose} className="text-[#434655] hover:opacity-60 transition-opacity">
             <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 1L13 13M1 13L13 1"/>
             </svg>
          </button>
        </div>

        {/* Modal Body: Grid layout dựa trên hình mẫu */}
        <div className="p-6 flex flex-col gap-6">
          <AccountFormInput label="Họ tên" placeholder="Nhập họ và tên" required id="full-name" />
          
          <div className="flex gap-4">
            <AccountFormInput label="Username" placeholder="Tên đăng nhập" required id="username" />
            <AccountFormInput label="Số điện thoại" placeholder="090..." required id="phone" />
          </div>

          <AccountFormInput label="Email" type="email" placeholder="example@factory.com" required id="email" />

          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-[6px]">
              <label className="font-inter font-semibold text-[12px] text-[#434655] tracking-[0.6px] uppercase">Nhóm quyền</label>
              <select className="h-[42px] px-3 border border-[#747686] rounded-[4px] text-[14px] outline-none bg-white">
                <option>Chọn nhóm quyền</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-[6px]">
              <label className="font-inter font-semibold text-[12px] text-[#434655] tracking-[0.6px] uppercase">Trạng thái</label>
              <select className="h-[42px] px-3 border border-[#747686] rounded-[4px] text-[14px] outline-none bg-white font-medium">
                <option>Hoạt động</option>
                <option>Ngừng hoạt động</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer: background #F8F9FA */}
        <div className="px-6 py-4 bg-[#F8F9FA] border-t border-[#C4C5D7] flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 border border-[#747686] rounded-[4px] text-[12px] font-semibold text-[#191C1D] uppercase tracking-[0.6px] hover:bg-gray-100 transition-all"
          >
            Huỷ
          </button>
          <PrimaryButton 
            className="w-auto h-auto px-10 py-2 bg-[#1D4ED8] rounded-[4px] text-[12px] font-semibold tracking-[0.6px] uppercase flex items-center gap-2"
            >
            <img 
            src={saveIcon} 
            alt="save" 
            className="w-4 h-4 object-contain brightness-0 invert" // brightness/invert để chuyển icon sang màu trắng nếu cần
            />
            Lưu
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;