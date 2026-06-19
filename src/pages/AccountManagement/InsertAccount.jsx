import { useState, useEffect } from 'react';
import Button from '../../components/skeleton/Button';
import AccountFormInput from '../../components/partials/forms/accounts/FormInsert-Account'; 

// 🌟 HELPER: Format số điện thoại dạng xxx xxx xxxx và giới hạn 10 số
const formatPhone = (val) => {
  if (!val) return '';
  let rawValue = String(val).replace(/\D/g, ''); 
  rawValue = rawValue.substring(0, 10); 
  
  if (rawValue.length > 6) {
    return `${rawValue.slice(0, 3)} ${rawValue.slice(3, 6)} ${rawValue.slice(6)}`;
  } else if (rawValue.length > 3) {
    return `${rawValue.slice(0, 3)} ${rawValue.slice(3)}`;
  }
  return rawValue;
};

const InsertAccount = ({ isOpen, onClose, onSave, roles = [] }) => {
  const [formData, setFormData] = useState({
    fullname: '', 
    username: '', 
    password: '', 
    phone: '', 
    email: '', 
    address: '', 
    gender: 1, 
    role: '', 
    isactive: '1'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isOpen && roles.length > 0) {
      setFormData(prev => {
        if (!prev.role) {
          return { ...prev, role: roles[0].code || roles[0].id };
        }
        return prev;
      });
    }
  }, [isOpen, roles]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 🎯 HÀM XỬ LÝ RIÊNG CHO SỐ ĐIỆN THOẠI (Format + Giữ vị trí con trỏ)
  const handlePhoneChange = (e) => {
    const { value, selectionStart } = e.target;
    const formattedValue = formatPhone(value);

    setFormData(prev => ({ ...prev, phone: formattedValue }));
    if (validationErrors.phone) {
      setValidationErrors(prev => ({ ...prev, phone: '' }));
    }

    const beforeCursorStr = value.substring(0, selectionStart);
    const digitsBeforeCursor = beforeCursorStr.replace(/\D/g, '').length;

    let newCursorPos = 0;
    let digitCount = 0;
    for (let i = 0; i < formattedValue.length; i++) {
      if (/\d/.test(formattedValue[i])) {
        digitCount++;
      }
      if (digitCount === Math.min(digitsBeforeCursor, 10)) {
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
  };

  // 🛠️ ĐIỀU CHỈNH LOGIC VALIDATE
  const validateForm = () => {
    const errors = {};
    
    if (!formData.fullname?.trim()) errors.fullname = 'Họ tên không được để trống';
    
    // Validate Phone với chuỗi gốc (đã bỏ dấu cách)
    const rawPhone = formData.phone ? String(formData.phone).replace(/\D/g, '') : '';
    if (!rawPhone) {
      errors.phone = 'Số điện thoại không được để trống';
    } else if (!rawPhone.startsWith('0')) {
      errors.phone = 'Số điện thoại phải bắt đầu bằng số 0';
    } else if (rawPhone.length !== 10) {
      errors.phone = 'Số điện thoại phải có đủ 10 chữ số';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (!formData.role) errors.role = 'Nhóm quyền không được để trống';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSaving(true);
      
      // 🌟 TRÍCH XUẤT SỐ GỐC để gửi Backend
      const rawPhone = formData.phone.replace(/\D/g, '');

      // 🛠️ ĐỒNG BỘ PAYLOAD ĐĂNG KÝ
      const payload = {
        username: rawPhone, // Dùng số nguyên gốc
        fullname: formData.fullname.trim(),
        role: String(formData.role),
        address: formData.address?.trim() || "",
        email: formData.email.trim(),
        gender: Number(formData.gender ?? 1),      
        isactive: Number(formData.isactive), 
        phone: rawPhone     // Dùng số nguyên gốc
      };

      await onSave(payload); 
      
      // Reset form sạch sẽ sau khi thêm thành công
      setFormData({
        fullname: '', username: '', password: '', phone: '', email: '', address: '', gender: 1, role: roles[0]?.code || '', isactive: '1'
      });
      setValidationErrors({});
    } catch (error) {
      console.error("[InsertAccount] Lỗi nghiệp vụ:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200"
      onClick={!isSaving ? onClose : undefined}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] font-inter text-[#191C1D]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <h2 className="font-semibold text-lg text-[#191C1D]">Thêm tài khoản mới</h2>
          <button type="button" onClick={onClose} disabled={isSaving} className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-50">
             <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 1L13 13M1 13L13 1"/>
             </svg>
          </button>
        </div>

        {/* Body Form chuẩn 5 trường điều chỉnh */}
        <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto flex-1">
          {/* Hàng 1: Họ tên & Số điện thoại */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="w-full">
              <AccountFormInput 
                label="Họ tên" placeholder="Ví dụ: Nguyễn Văn A" required disabled={isSaving}
                value={formData.fullname} onChange={(e) => handleChange('fullname', e.target.value)} 
              />
              {validationErrors.fullname && <span className="text-xs text-red-500 font-medium mt-0.5 block">{validationErrors.fullname}</span>}
            </div>
            <div className="w-full">
              <AccountFormInput 
                label="Số điện thoại (Tên đăng nhập)" placeholder="Ví dụ: 083 725 7268" required disabled={isSaving}
                value={formData.phone} onChange={handlePhoneChange} /* 🎯 Thay bằng handle riêng */
              />
              {validationErrors.phone && <span className="text-xs text-red-500 font-medium mt-0.5 block">{validationErrors.phone}</span>}
            </div>
          </div>
          
          {/* Hàng 2: Email & Nhóm quyền */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="w-full">
              <AccountFormInput 
                label="Email" type="email" placeholder="example@email.com" required disabled={isSaving}
                value={formData.email} onChange={(e) => handleChange('email', e.target.value)} 
              />
              {validationErrors.email && <span className="text-xs text-red-500 font-medium mt-0.5 block">{validationErrors.email}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">Nhóm quyền *</label>
              <select 
                disabled={isSaving}
                value={formData.role} 
                onChange={(e) => handleChange('role', e.target.value)} 
                className={`h-10 px-3.5 border rounded-xl text-sm bg-gray-50/30 outline-none focus:border-[#0037B0] focus:bg-white transition-all shadow-3xs cursor-pointer ${validationErrors.role ? 'border-red-400 bg-red-50/10' : 'border border-gray-200'}`}
              >
                <option value="">-- Chọn quyền --</option>
                {roles.map(role => <option key={role.id} value={role.code}>{role.name}</option>)}
              </select>
              {validationErrors.role && <span className="text-xs text-red-500 font-medium mt-0.5 block">{validationErrors.role}</span>}
            </div>
          </div>

          {/* Hàng 3: Trạng thái hệ thống */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">Trạng thái *</label>
              <select 
                disabled={isSaving}
                value={formData.isactive} 
                onChange={(e) => handleChange('isactive', String(e.target.value))} 
                className="h-10 px-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/30 outline-none focus:border-[#0037B0] focus:bg-white transition-all shadow-3xs cursor-pointer font-medium"
              >
                <option value="1">Hoạt động</option>
                <option value="0">Ngừng hoạt động</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-2.5 px-6 py-4 bg-gray-50/60 border-t border-gray-100 rounded-b-2xl shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSaving} className="h-9 px-4 text-xs font-bold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
            Huỷ bỏ
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving}
            className="bg-[#0037B0] hover:bg-[#00267A] h-9 px-5 text-xs font-bold uppercase tracking-wider text-white rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <span>{isSaving ? 'Đang thêm...' : 'Lưu tài khoản'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InsertAccount;