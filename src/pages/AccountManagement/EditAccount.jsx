import { useState, useEffect } from 'react';
import FormEditAccount from "../../components/partials/forms/accounts/FormEdit-Account";
import Button from '../../components/skeleton/Button';
import saveIcon from '../../assets/images/icon_luu.png';
import editIcon  from '../../assets/images/icon_edit_account.png';

const EditAccount = ({ isOpen, onClose, accountData, onSave, roles = [] }) => {
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false); // Thêm state chống click nhiều lần (Double-click)

  // Đồng bộ dữ liệu mỗi khi mở form
  useEffect(() => {
    if (isOpen && accountData) {
      setFormData({ ...accountData });
    } else {
      setFormData(null);
    }
  }, [isOpen, accountData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    // Validate cơ bản
    if (!formData?.fullname?.trim()) {
      alert("Vui lòng không để trống Họ và tên!");
      return;
    }

    try {
      setIsSaving(true);
      if (onSave) {
        await onSave(formData); // Gọi hàm gọi API từ AccountPage.jsx
      }
      onClose(); // Tự động đóng Modal khi API thành công
    } catch (error) {
       // Lỗi đã được console log ở useAccounts, có thể hiển thị alert nếu cần
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !formData) return null;

  return (
    // Click vào nền mờ (backdrop) để đóng Modal
    <div 
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#585F67]/60 backdrop-blur-[2px] p-4 font-inter"
      onClick={onClose} 
    >
      <div 
        className="bg-white w-[672px] max-w-full rounded-[4px] shadow-2xl border border-[#C4C5D7] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()} // Bắt buộc: Chặn click thủng qua Modal
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C4C5D7] bg-white">
          <div className="flex items-center gap-3">
            <img src={editIcon} alt="edit" className="w-[19px] h-[17px]" />
            <h2 className="font-semibold text-[18px] text-[#191C1D]">Sửa tài khoản</h2>
          </div>
          {/* Nút X Tắt Form */}
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors p-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 1L13 13M1 13L13 1"/>
            </svg>
          </button>
        </div>

        {/* Body (GIỮ NGUYÊN HOÀN TOÀN FILE CỦA BẠN) */}
        <div className="p-6 md:pb-10 overflow-y-auto max-h-[75vh]">
          <FormEditAccount formData={formData} onInputChange={handleInputChange} roles={roles} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F3F4F5] border-t border-[#C4C5D7] flex justify-end gap-3">
          {/* Nút Hủy */}
          <Button variant="outline-secondary" type="button" onClick={onClose} disabled={isSaving}>
            Hủy bỏ
          </Button>
          
          {/* Nút Lưu */}
          <Button 
            type="button" 
            onClick={handleSave} 
            disabled={isSaving}
            className={`w-auto h-10 px-8 rounded-[2px] flex items-center gap-2 shadow-lg transition-all ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0037B0] hover:bg-blue-800'}`}
          >
            {!isSaving && <img src={saveIcon} alt="save" className="w-[15px] h-[15px] brightness-0 invert" />}
            <span className="text-[12px] uppercase tracking-[0.6px] font-semibold text-white">
              {isSaving ? "Đang xử lý..." : "Lưu thay đổi"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditAccount;