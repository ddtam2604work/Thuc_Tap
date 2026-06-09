import { useState, useEffect } from 'react';
import Button from '../../components/skeleton/Button';
import saveIcon from '../../assets/images/icon_luu.png';
import AccountFormInput from '../../components/partials/forms/accounts/FormInsert-Account'; 

const InsertAccount = ({ isOpen, onClose, onSave, roles = [] }) => {
  const [formData, setFormData] = useState({
    fullname: '', username: '', password: '', phone: '', email: '', address: '', gender: 1, role: '', isactive: '1'
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
    if (field === 'username') {
      value = value.replace(/\s+/g, '_');
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.fullname?.trim()) errors.fullname = 'Họ tên không được để trống';
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
    } else if (!/[!@#$%^&*()_+=[\] {};':"\\|,.<>/?-]/.test(formData.password)) {
      errors.password = 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Email không hợp lệ';
    if (formData.phone && !/^0\d{9}$/.test(formData.phone)) errors.phone = 'Số điện thoại phải có định dạng 0XXXXXXXXX';
    if (!formData.role) errors.role = 'Nhóm quyền không được để trống';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('Vui lòng sửa những lỗi trong form trước khi lưu');
      return;
    }
    
    try {
      setIsSaving(true);
      const payload = {
        username: formData.username.trim(),
        password: formData.password,
        fullname: formData.fullname.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        gender: Number(formData.gender),      
        role: String(formData.role),          
        isactive: String(formData.isactive)    
      };

      await onSave(payload); 
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
        // 🛠️ ĐỒNG BỘ UI: Mở rộng max-w-2xl, bo tròn mượt rounded-2xl đồng bộ hoàn toàn form khách hàng mẫu
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

        {/* Body */}
        {/* 🛠️ ĐỒNG BỘ UI: Sử dụng lưới cấu trúc chuẩn tự động co giãn, hợp nhất các dòng rời rạc cũ */}
        <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto flex-1">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="w-full">
              <AccountFormInput 
                label="Họ tên" placeholder="Nguyễn Văn A" required disabled={isSaving}
                value={formData.fullname} onChange={(e) => handleChange('fullname', e.target.value)} 
              />
              {validationErrors.fullname && <span className="text-xs text-red-500 font-medium mt-0.5 block">{validationErrors.fullname}</span>}
            </div>
            <div className="w-full">
              <AccountFormInput 
                label="Username" placeholder="Ví dụ: thanh_binh" required disabled={isSaving}
                value={formData.username} onChange={(e) => handleChange('username', e.target.value)} 
              />
              {validationErrors.username ? (
                <span className="text-xs text-red-500 font-medium mt-0.5 block">{validationErrors.username}</span>
              ) : (
                <span className="text-[11px] text-gray-400 mt-1 block leading-normal">Tự động đổi khoảng trắng thành "_". Từ 6-20 ký tự.</span>
              )}
            </div>
          </div>
          
          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="w-full">
              <AccountFormInput 
                label="Mật khẩu" type="password" placeholder="Nhập mật khẩu an toàn..." required disabled={isSaving}
                value={formData.password} onChange={(e) => handleChange('password', e.target.value)} 
              />
              {validationErrors.password ? (
                <span className="text-xs text-red-500 font-medium mt-0.5 block">{validationErrors.password}</span>
              ) : (
                <span className="text-[11px] text-gray-400 mt-1 block leading-normal">Mật khẩu gồm 8+ ký tự (1 hoa, 1 thường, 1 số, 1 đặc biệt).</span>
              )}
            </div>
            <div className="w-full">
              <AccountFormInput 
                label="Email" type="email" placeholder="example@email.com" disabled={isSaving}
                value={formData.email} onChange={(e) => handleChange('email', e.target.value)} 
              />
              {validationErrors.email && <span className="text-xs text-red-500 font-medium mt-0.5 block">{validationErrors.email}</span>}
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="w-full">
              <AccountFormInput 
                label="Số điện thoại" placeholder="0901234567" disabled={isSaving}
                value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} 
              />
              {validationErrors.phone && <span className="text-xs text-red-500 font-medium mt-0.5 block">{validationErrors.phone}</span>}
            </div>
            <div className="w-full">
              <AccountFormInput 
                label="Địa chỉ" placeholder="Nhập địa chỉ cư trú..." disabled={isSaving}
                value={formData.address} onChange={(e) => handleChange('address', e.target.value)} 
              />
            </div>
          </div>

          {/* Row 4: Select boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">Giới tính</label>
              <select 
                disabled={isSaving}
                value={formData.gender} 
                onChange={(e) => handleChange('gender', Number(e.target.value))} 
                className="h-10 px-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/30 outline-none focus:border-[#0037B0] focus:bg-white transition-all shadow-3xs cursor-pointer"
              >
                <option value={1}>Nam</option>
                <option value={0}>Nữ</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">Nhóm quyền</label>
              <select 
                disabled={isSaving}
                value={formData.role} 
                onChange={(e) => handleChange('role', e.target.value)} 
                className={`h-10 px-3.5 border rounded-xl text-sm bg-gray-50/30 outline-none focus:border-[#0037B0] focus:bg-white transition-all shadow-3xs cursor-pointer ${validationErrors.role ? 'border-red-400 bg-red-50/10' : 'border border-gray-200'}`}
              >
                <option value="">-- Chọn quyền --</option>
                {roles.length > 0 ? (
                  roles.map(role => <option key={role.id} value={role.code}>{role.name}</option>)
                ) : (
                  <option value="MANAGER">Đang tải quyền...</option>
                )}
              </select>
              {validationErrors.role && <span className="text-xs text-red-500 font-medium mt-0.5 block">{validationErrors.role}</span>}
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">Trạng thái</label>
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
        {/* 🛠专 ĐỒNG BỘ UI: Chuyển đổi footer về cấu trúc thanh mẫu bg-gray-50/60, border-t, nút bo tròn h-9 rounded-xl */}
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