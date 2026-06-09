import { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../skeleton/Button';

// --- IMPORT HOOK NOTIFICATION DÙNG CHUNG ---
import { useNotification } from '../../../../../context/NotificationContext';

const FormInsertCustomerGroup = ({ onClose, onSubmit, isSaving }) => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});
  
  // Kích hoạt hook thông báo
  const { showToast } = useNotification();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const clientErrors = {};
    if (!formData.name.trim()) clientErrors.name = 'Tên nhóm bắt buộc nhập';

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      // Bắn Toast cảnh báo validate phía Client
      showToast('Vui lòng nhập đầy đủ các trường bắt buộc (*)', 'warning');
      return;
    }

    // 🎯 LOGIC QUAN TRỌNG: Tự động sinh mã ngẫu nhiên để không bị lỗi trùng mã từ API
    const uniqueCode = "CG" + Date.now().toString().slice(-6); 

    const payload = {
      code: uniqueCode, // Bắt buộc gửi lên API
      name: formData.name.trim(),
      description: formData.description.trim(),
      sortorder: 0 // Gửi mặc định theo tài liệu API
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col font-inter bg-white text-[#191C1D] w-full max-w-lg mx-auto">
      {/* Khối nội dung chỉ gồm 2 trường */}
      <div className="flex-1 px-6 py-5 flex flex-col gap-5">
        
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700">
            Tên nhóm khách hàng <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            disabled={isSaving} 
            placeholder="Ví dụ: Khách hàng thân thiết" 
            className="h-10 px-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/30 focus:outline-none focus:border-[#0037B0] focus:bg-white transition-all shadow-3xs" 
          />
          {errors.name && <span className="text-xs text-red-500 font-medium mt-0.5">{errors.name}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700">Mô tả / Ghi chú</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            disabled={isSaving} 
            placeholder="Nhập thông tin mô tả chi tiết của nhóm khách hàng..." 
            className="w-full h-28 p-3.5 border border-gray-200 rounded-xl text-sm resize-none bg-gray-50/30 focus:outline-none focus:border-[#0037B0] focus:bg-white transition-all shadow-3xs" 
          />
        </div>

      </div>

      {/* Thanh nút điều khiển */}
      <div className="flex justify-end items-center gap-2.5 px-6 py-4 bg-gray-50/60 border-t border-gray-100 rounded-b-2xl">
        <Button 
          type="button" 
          variant="outline-secondary" 
          className="h-9 px-4 text-xs font-bold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors" 
          onClick={onClose} 
          disabled={isSaving}
        >
          Huỷ
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          disabled={isSaving} 
          className="bg-[#0037B0] hover:bg-[#00267A] h-9 px-5 text-xs font-bold uppercase tracking-wider text-white rounded-xl shadow-xs transition-all"
        >
          {isSaving ? '⏳ Đang lưu...' : 'Lưu nhóm khách hàng'}
        </Button>
      </div>
    </form>
  );
};

FormInsertCustomerGroup.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
};

export default FormInsertCustomerGroup;