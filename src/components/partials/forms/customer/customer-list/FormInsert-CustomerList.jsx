import { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../skeleton/Button';

// --- IMPORT HOOK THÔNG BÁO DÙNG CHUNG ---
import { useNotification } from '../../../../../context/NotificationContext';

// Helper: Format số điện thoại dạng xxx xxx xxxx và giới hạn 10 số
const formatPhone = (val) => {
  if (!val) return '';
  let rawValue = String(val).replace(/\D/g, ''); // Bỏ mọi ký tự không phải số
  rawValue = rawValue.substring(0, 10); // Khóa cứng tối đa 10 số
  
  if (rawValue.length > 6) {
    return `${rawValue.slice(0, 3)} ${rawValue.slice(3, 6)} ${rawValue.slice(6)}`;
  } else if (rawValue.length > 3) {
    return `${rawValue.slice(0, 3)} ${rawValue.slice(3)}`;
  }
  return rawValue;
};

const FormInsertCustomerList = ({ onClose, onSubmit, isSaving, categories = [] }) => {
  const [formData, setFormData] = useState({
    fullname: '', 
    studioname: '', 
    phone: '', 
    email: '',
    address: '', 
    customercategories_id: '', 
    description: '',
    isportal: false, 
    isactive: 1 // 🎯 Mặc định thêm mới là Hoạt động (1)
  });
  const [errors, setErrors] = useState({});

  // Kích hoạt hook thông báo
  const { showToast } = useNotification();

  const handleChange = (e) => {
    const { name, value, type, checked, selectionStart } = e.target;

    if (name === 'phone') {
      const formattedValue = formatPhone(value);
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));

      // THUẬT TOÁN GIỮ NGUYÊN VỊ TRÍ CON TRỎ CHUỘT
      const beforeCursorStr = value.substring(0, selectionStart);
      const digitsBeforeCursor = beforeCursorStr.replace(/\D/g, '').length;

      let newCursorPos = 0;
      let digitCount = 0;
      for (let i = 0; i < formattedValue.length; i++) {
        if (/\d/.test(formattedValue[i])) {
          digitCount++;
        }
        if (digitCount === Math.min(digitsBeforeCursor, 10)) { // Cắt cursor không vượt quá 10 số
          newCursorPos = i + 1;
          break;
        }
      }
      
      if (digitsBeforeCursor === 0) newCursorPos = 0;

      window.requestAnimationFrame(() => {
        if (e.target) {
          e.target.setSelectionRange(newCursorPos, newCursorPos);
        }
      });
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : (name === 'isactive' ? Number(value) : value)
      }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const clientErrors = {};
    
    // Validate Tên
    if (!formData.fullname.trim()) clientErrors.fullname = 'Bắt buộc nhập';
    
    // Lấy chuỗi số nguyên gốc của điện thoại để validate
    const rawPhone = String(formData.phone).replace(/\D/g, '');

    // Validate Số điện thoại chuẩn 10 số & bắt đầu bằng 0
    if (!rawPhone) {
      clientErrors.phone = 'Bắt buộc nhập';
    } else if (!rawPhone.startsWith('0')) {
      clientErrors.phone = 'SĐT phải bắt đầu bằng số 0';
    } else if (rawPhone.length !== 10) {
      clientErrors.phone = 'SĐT phải có đủ 10 chữ số';
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors); 
      // Bắn Toast Warning cảnh báo nhập thiếu thông tin bắt buộc
      showToast('Vui lòng kiểm tra lại thông tin các trường bắt buộc (*)', 'warning');
      return;
    }

    const payload = {
      username: rawPhone, // Đẩy số gốc lên Backend
      password: "Password@123",        
      fullname: formData.fullname.trim(),
      phone: rawPhone,    // Đẩy số gốc lên Backend
      address: formData.address.trim(),
      email: formData.email.trim(),
      gender: 1,                        
      studioname: formData.studioname.trim(),
      description: formData.description.trim(),
      isportal: formData.isportal ? 1 : 0,
      isactive: formData.isactive
    };

    if (formData.customercategories_id) {
      payload.customercategories_id = formData.customercategories_id;
    }
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col font-inter bg-white text-[#191C1D] w-full max-w-2xl mx-auto">
      <div className="flex-1 px-6 py-5 flex flex-col gap-4 max-h-[65vh] overflow-y-auto">
        
        {/* Tên khách hàng & Tên Studio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">
              Tên khách hàng <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="fullname" 
              value={formData.fullname} 
              onChange={handleChange} 
              disabled={isSaving} 
              placeholder="Nguyễn Văn A" 
              className={`h-10 px-3.5 border rounded-xl text-sm bg-gray-50/30 focus:bg-white outline-none transition-all shadow-3xs ${
                errors.fullname ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#0037B0]'
              }`} 
            />
            {errors.fullname && <span className="text-xs text-red-500 mt-0.5 font-medium">{errors.fullname}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Tên Studio</label>
            <input 
              type="text" 
              name="studioname" 
              value={formData.studioname} 
              onChange={handleChange} 
              disabled={isSaving} 
              placeholder="Tên studio (nếu có)" 
              className="h-10 px-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/30 focus:border-[#0037B0] focus:bg-white outline-none transition-all shadow-3xs" 
            />
          </div>
        </div>

        {/* Số điện thoại & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              disabled={isSaving} 
              placeholder="093 648 1540" 
              className={`h-10 px-3.5 border rounded-xl text-sm bg-gray-50/30 focus:bg-white outline-none transition-all shadow-3xs ${
                errors.phone ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#0037B0]'
              }`} 
            />
            {errors.phone && <span className="text-xs text-red-500 mt-0.5 font-medium">{errors.phone}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              disabled={isSaving} 
              placeholder="example@email.com" 
              className="h-10 px-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/30 focus:border-[#0037B0] focus:bg-white outline-none transition-all shadow-3xs" 
            />
          </div>
        </div>

        {/* Nhóm Khách Hàng & Trạng Thái */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Nhóm khách hàng</label>
            <select 
              name="customercategories_id" 
              value={formData.customercategories_id} 
              onChange={handleChange} 
              disabled={isSaving} 
              className="h-10 px-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/30 focus:border-[#0037B0] outline-none shadow-3xs cursor-pointer"
            >
              <option value="">-- Chọn nhóm khách hàng --</option>
              {Array.isArray(categories) && categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Trạng thái</label>
            <select 
              name="isactive" 
              value={formData.isactive} 
              onChange={handleChange} 
              disabled={isSaving} 
              className={`h-10 px-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/30 focus:border-[#0037B0] outline-none shadow-3xs cursor-pointer font-semibold ${
                Number(formData.isactive) === 1 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              <option value={1} className="text-emerald-600 font-medium">✅ Hoạt động (Mặc định)</option>
              <option value={0} className="text-rose-600 font-medium">⛔ Ngừng hoạt động</option>
            </select>
          </div>
        </div>

        {/* Địa chỉ */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700">Địa chỉ</label>
          <input 
            type="text" 
            name="address" 
            value={formData.address} 
            onChange={handleChange} 
            disabled={isSaving} 
            placeholder="Nhập địa chỉ..." 
            className="h-10 px-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/30 focus:border-[#0037B0] outline-none shadow-3xs" 
          />
        </div>

        {/* Ghi chú / Mô tả */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700">Ghi chú / Mô tả</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            disabled={isSaving} 
            placeholder="Nhập ghi chú về khách hàng..." 
            rows="3" 
            className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/30 focus:border-[#0037B0] outline-none shadow-3xs resize-none" 
          />
        </div>

        {/* Quyền tạo tài khoản Portal */}
        <div className="flex items-center gap-2.5 py-1 mt-1">
          <input 
            type="checkbox" 
            id="portalCheckIns" 
            name="isportal" 
            checked={formData.isportal} 
            onChange={handleChange} 
            disabled={isSaving} 
            className="w-4 h-4 border border-gray-300 rounded-[4px] cursor-pointer accent-[#0037B0]" 
          />
          <label htmlFor="portalCheckIns" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
            Tạo tài khoản Portal (Quyền truy cập hệ thống)
          </label>
        </div>
      </div>

      {/* Footer chứa Button thao tác */}
      <div className="flex justify-end gap-2.5 px-6 py-4 bg-gray-50/60 border-t border-gray-100 rounded-b-2xl">
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
          className="bg-[#0037B0] hover:bg-[#00267A] h-9 px-5 text-xs font-bold uppercase tracking-wider text-white rounded-xl shadow-xs transition-colors"
        >
          {isSaving ? '⏳ Đang lưu...' : 'Lưu khách hàng'}
        </Button>
      </div>
    </form>
  );
};

FormInsertCustomerList.propTypes = { 
  onClose: PropTypes.func.isRequired, 
  onSubmit: PropTypes.func.isRequired, 
  isSaving: PropTypes.bool.isRequired, 
  categories: PropTypes.array 
};

export default FormInsertCustomerList;