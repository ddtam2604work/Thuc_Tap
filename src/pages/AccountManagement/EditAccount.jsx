// src/pages/Account/EditAccount.jsx
import { useState, useEffect } from 'react';
import FormEditAccount from "../../components/partials/forms/accounts/FormEdit-Account";
import Button from '../../components/skeleton/Button';
import saveIcon from '../../assets/images/icon_luu.png';
import editIcon  from '../../assets/images/icon_edit_account.png';

const EditAccount = ({ isOpen, onClose, accountData, onSave, roles = [], onResetPassword }) => {
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

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
    if (!formData?.fullname?.trim()) {
      alert("Vui lòng không để trống Họ và tên!"); 
      return;
    }
    try {
      setIsSaving(true);
      if (onSave) {
        await onSave(formData); 
      }
      onClose(); 
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !formData) return null;

  return (
    <div 
      // 🛠️ ĐỒNG BỘ UI: Đổi nền che backdrop sang tone màu tối nhẹ kết hợp hiệu ứng blur của form chuẩn
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 font-inter" 
      onClick={onClose}
    >
      <div 
        // 🛠️ ĐỒNG BỘ UI: Chuyển đổi bo góc từ vuông thành tròn mượt rounded-2xl, viền border-gray-100 và đổ bóng shadow-xl
        className="bg-white w-[672px] max-w-full rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        {/* 🛠️ ĐỒNG BỘ UI: Làm sạch viền phân cách thành border-gray-100 trên nền trắng thuần khiết */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <img src={editIcon} alt="edit" className="w-[19px] h-[17px]" />
            <h2 className="font-semibold text-lg text-[#191C1D]">Sửa tài khoản</h2>
          </div>
          {/* Tinh chỉnh nút đóng X nhẹ nhàng, bo góc nhẹ tương tự form mẫu */}
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-50">
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
            roles={roles} 
            onResetPassword={onResetPassword} 
          />
        </div>

        {/* Footer */}
        {/* 🛠️ ĐỒNG BỘ UI: Tái cấu trúc thanh chân trang về đúng khuôn mẫu bg-gray-50/60, viền border-gray-100 và bo tròn đáy rounded-b-2xl */}
        <div className="flex justify-end items-center gap-2.5 px-6 py-4 bg-gray-50/60 border-t border-gray-100 rounded-b-2xl">
          
          {/* Nút Huỷ bỏ cấu hình h-9, rounded-xl */}
          <Button 
            variant="outline-secondary" 
            type="button" 
            onClick={onClose} 
            disabled={isSaving}
            className="h-9 px-4 text-xs font-bold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Hủy bỏ
          </Button>
          
          {/* Nút Lưu thay đổi cấu hình h-9, rounded-xl và flex căn giữa icon */}
          <Button 
            type="button" 
            onClick={handleSave} 
            disabled={isSaving} 
            className="bg-[#0037B0] hover:bg-[#00267A] h-9 px-5 text-xs font-bold uppercase tracking-wider text-white rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <span>{isSaving ? "⏳ Đang xử lý..." : "Cập nhật tài khoản"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditAccount;