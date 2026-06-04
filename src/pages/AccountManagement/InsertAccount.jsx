import { useState, useEffect } from 'react';
import Button from '../../components/skeleton/Button';
import saveIcon from '../../assets/images/icon_luu.png';
// Import component input chuẩn mà bạn vừa tạo (Nhớ điều chỉnh lại đường dẫn nếu cần)
import AccountFormInput from '../../components/partials/forms/accounts/FormInsert-Account'; 

const InsertAccount = ({ isOpen, onClose, onSave, roles = [] }) => {
  const [formData, setFormData] = useState({
    fullname: '', username: '', password: '', phone: '', email: '', address: '', gender: 1, role: '', isactive: '1'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Tự động chọn Role đầu tiên làm mặc định khi form mở lên
  useEffect(() => {
    if (isOpen && roles.length > 0) {
      setFormData(prev => {
        // Chỉ cập nhật nếu role chưa được set
        if (!prev.role) {
          return { ...prev, role: roles[0].code || roles[0].id };
        }
        return prev;
      });
    }
  }, [isOpen, roles]);

  const handleChange = (field, value) => {
    // Tự động chuyển khoảng trắng thành dấu '_' ngay khi đang gõ
    if (field === 'username') {
      value = value.replace(/\s+/g, '_');
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    // Xóa lỗi validation khi người dùng bắt đầu chỉnh sửa
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Hàm validate dữ liệu
  const validateForm = () => {
    const errors = {};
    
    if (!formData.fullname?.trim()) {
      errors.fullname = 'Họ tên không được để trống';
    }
    
    if (!formData.username?.trim()) {
      errors.username = 'Tên đăng nhập không được để trống';
    } else if (formData.username.length < 6) {
      errors.username = 'Tên đăng nhập phải từ 6 ký tự trở lên';
    } else if (formData.username.length > 20) {
      errors.username = 'Tên đăng nhập không vượt quá 20 ký tự';
    }
    
    if (!formData.password) {
      errors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 8) {
      errors.password = 'Mật khẩu phải từ 8 ký tự trở lên';
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Mật khẩu phải chứa ít nhất 1 chữ cái hoa';
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = 'Mật khẩu phải chứa ít nhất 1 chữ cái thường';
    } else if (!/\d/.test(formData.password)) {
      errors.password = 'Mật khẩu phải chứa ít nhất 1 chữ số';
    } else if (!/[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]/.test(formData.password)) {
      errors.password = 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (formData.phone && !/^0\d{9}$/.test(formData.phone)) {
      errors.phone = 'Số điện thoại phải có định dạng 0XXXXXXXXX';
    }
    
    if (!formData.role) {
      errors.role = 'Nhóm quyền không được để trống';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    // Validate form
    if (!validateForm()) {
      alert('Vui lòng sửa những lỗi trong form trước khi lưu');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // 🎯 CHUẨN HOÁ DỮ LIỆU ĐÚNG 100% THEO REQUEST MẪU
      const payload = {
        username: formData.username.trim(),
        password: formData.password,
        fullname: formData.fullname.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        gender: Number(formData.gender),       // Bắt buộc là SỐ (1 hoặc 0)
        role: String(formData.role),           // Bắt buộc là CHUỖI (VD: "MANAGER")
        isactive: String(formData.isactive)    // Bắt buộc là CHUỖI ("1" hoặc "0")
      };

      // Gọi onSave và ném cái payload đã được gọt dũa này đi
      await onSave(payload); 
      
      // Reset form sau khi lưu thành công
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
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={!isSaving ? onClose : undefined}
    >
      <div 
        className="bg-white w-[650px] max-w-[95vw] rounded-lg shadow-2xl border border-[#C4C5D7] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F8F9FA] border-b border-[#C4C5D7]">
          <h2 className="font-inter font-semibold text-[18px] text-[#191C1D]">Thêm tài khoản mới</h2>
          <Button variant="ghost" onClick={onClose} disabled={isSaving} className="p-0 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-500">
             <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 1L13 13M1 13L13 1"/>
             </svg>
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Row 1: Họ Tên & Username */}
          <div className="flex gap-4">
            <div className="w-full">
              <AccountFormInput 
                label="Họ tên" placeholder="Nhập họ và tên..." required disabled={isSaving}
                value={formData.fullname} onChange={(e) => handleChange('fullname', e.target.value)} 
              />
              {validationErrors.fullname && <span className="text-[11px] text-red-500 mt-1 block">{validationErrors.fullname}</span>}
            </div>
            <div className="w-full">
              <AccountFormInput 
                label="Username" placeholder="Ví dụ: Thanh_Binh" required disabled={isSaving}
                value={formData.username} onChange={(e) => handleChange('username', e.target.value)} 
              />
              {validationErrors.username ? (
                <span className="text-[11px] text-red-500 mt-1 block">{validationErrors.username}</span>
              ) : (
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Tự động đổi khoảng trắng thành "_". Từ 6-20 ký tự.
                </span>
              )}
            </div>
          </div>
          
          {/* Row 2: Mật khẩu & Email */}
          <div className="flex gap-4">
            <div className="w-full">
              <AccountFormInput 
                label="Mật khẩu" type="password" placeholder="Nhập mật khẩu..." required disabled={isSaving}
                value={formData.password} onChange={(e) => handleChange('password', e.target.value)} 
              />
              {validationErrors.password ? (
                <span className="text-[11px] text-red-500 mt-1 block">{validationErrors.password}</span>
              ) : (
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Ít nhất 1 hoa, 1 thường, 1 số, 1 ký tự đặc biệt. (8-20 ký tự)
                </span>
              )}
            </div>
            <div className="w-full">
              <AccountFormInput 
                label="Email" type="email" placeholder="example@gmail.com" disabled={isSaving}
                value={formData.email} onChange={(e) => handleChange('email', e.target.value)} 
              />
              {validationErrors.email && <span className="text-[11px] text-red-500 mt-1 block">{validationErrors.email}</span>}
            </div>
          </div>

          {/* Row 3: Số điện thoại & Địa chỉ */}
          <div className="flex gap-4">
            <div className="w-full">
              <AccountFormInput 
                label="Số điện thoại" placeholder="0901234567" disabled={isSaving}
                value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} 
              />
              {validationErrors.phone && <span className="text-[11px] text-red-500 mt-1 block">{validationErrors.phone}</span>}
            </div>
            <AccountFormInput 
              label="Địa chỉ" placeholder="Hà Nội, TP.HCM..." disabled={isSaving}
              value={formData.address} onChange={(e) => handleChange('address', e.target.value)} 
            />
          </div>

          {/* Row 4: Các Select box (Giới tính, Quyền, Trạng thái) */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-[6px]">
              <label className="font-inter font-semibold text-[12px] text-[#434655] tracking-[0.6px] uppercase">Giới tính</label>
              <select 
                disabled={isSaving}
                value={formData.gender} 
                onChange={(e) => handleChange('gender', Number(e.target.value))} 
                className="h-[42px] px-3 border border-[#747686] focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]/20 rounded-[4px] text-[14px] outline-none bg-white disabled:bg-gray-100 cursor-pointer"
              >
                <option value={1}>Nam</option>
                <option value={0}>Nữ</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-[6px]">
              <label className="font-inter font-semibold text-[12px] text-[#434655] tracking-[0.6px] uppercase">Nhóm quyền {validationErrors.role && <span className="text-red-500">*</span>}</label>
              <select 
                disabled={isSaving}
                value={formData.role} 
                onChange={(e) => handleChange('role', e.target.value)} 
                className={`h-[42px] px-3 border ${validationErrors.role ? 'border-red-500 bg-red-50' : 'border-[#747686]'} focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]/20 rounded-[4px] text-[14px] outline-none bg-white disabled:bg-gray-100 cursor-pointer`}
              >
                <option value="">-- Chọn quyền --</option>
                {roles.length > 0 ? (
                  roles.map(role => (
                    // Lấy role.code làm value gửi đi như yêu cầu của backend
                    <option key={role.id} value={role.code}>
                      {role.name}
                    </option>
                  ))
                ) : (
                  <option value="MANAGER">Đang tải quyền...</option>
                )}
              </select>
              {validationErrors.role && <span className="text-[11px] text-red-500 mt-1 block">{validationErrors.role}</span>}
            </div>
            
            <div className="flex-1 flex flex-col gap-[6px]">
              <label className="font-inter font-semibold text-[12px] text-[#434655] tracking-[0.6px] uppercase">Trạng thái</label>
              <select 
                disabled={isSaving}
                value={formData.isactive} 
                onChange={(e) => handleChange('isactive', String(e.target.value))} 
                className="h-[42px] px-3 border border-[#747686] focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]/20 rounded-[4px] text-[14px] outline-none bg-white font-medium disabled:bg-gray-100 cursor-pointer"
              >
                <option value="1">Hoạt động</option>
                <option value="0">Ngừng hoạt động</option>
              </select>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="px-6 py-4 bg-[#F8F9FA] border-t border-[#C4C5D7] flex justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSaving} className="bg-white hover:bg-gray-50 border-gray-300">Huỷ bỏ</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving}
            className={`w-auto px-8 py-2 rounded-[4px] text-[12px] font-semibold tracking-[0.6px] uppercase flex items-center gap-2 text-white transition-colors ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1D4ED8] hover:bg-blue-800'}`}
          >
            {!isSaving && <img src={saveIcon} alt="save" className="w-4 h-4 object-contain brightness-0 invert" />}
            {isSaving ? 'Đang thêm...' : 'Lưu tài khoản'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InsertAccount;