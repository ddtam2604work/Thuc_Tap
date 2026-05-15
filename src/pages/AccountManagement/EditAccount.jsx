import { useState } from 'react';
import FormEditAccount from '../../components/partials/forms/FormEdit-Account';
import PrimaryButton from '../../components/skeleton/PrimaryButton';
import saveIcon from '../../assets/images/icon_luu.png';
import editIcon  from '../../assets/images/icon_edit_account.png';

const EditAccount = ({ isOpen, onClose, accountData, onSave }) => {
  // Khởi tạo state TRỰC TIẾP từ props. 
  // Nhờ prop 'key' ở AccountPage, dòng này sẽ chạy lại mỗi khi chọn người mới.
  const [formData, setFormData] = useState(() => 
    accountData ? structuredClone(accountData) : null
  );

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (onSave) onSave(formData);
    console.log("Dữ liệu chuẩn bị gửi API:", formData);
    onClose();
  };

  // Guard clause
  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#585F67]/60 backdrop-blur-[2px] p-4 font-inter">
      <div className="bg-white w-[672px] max-w-full rounded-[4px] shadow-2xl border border-[#C4C5D7] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C4C5D7] bg-white">
          <div className="flex items-center gap-3">
            <img src={editIcon} alt="edit" className="w-[19px] h-[17px]" />
            <h2 className="font-semibold text-[18px] text-[#191C1D]">Sửa tài khoản</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-[#434655]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 1L13 13M1 13L13 1"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:pb-10 overflow-y-auto max-h-[75vh]">
          <FormEditAccount 
            formData={formData} 
            onInputChange={handleInputChange} 
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F3F4F5] border-t border-[#C4C5D7] flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white border border-[#C4C5D7] rounded-[2px] text-[12px] font-semibold text-[#585F67] uppercase tracking-[0.6px] hover:bg-gray-50 h-10 shadow-sm transition-all"
          >
            Hủy bỏ
          </button>
          
          <PrimaryButton 
            onClick={handleSave}
            className="w-auto h-10 px-8 bg-[#0037B0] rounded-[2px] flex items-center gap-2 shadow-lg"
          >
            <img src={saveIcon} alt="save" className="w-[15px] h-[15px] brightness-0 invert" />
            <span className="text-[12px] uppercase tracking-[0.6px] font-semibold">Lưu</span>
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default EditAccount;