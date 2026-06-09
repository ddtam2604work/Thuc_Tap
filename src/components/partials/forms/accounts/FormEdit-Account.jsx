import React from 'react';
import FormInput from '../../../skeleton/FormInput';
import Button from '../../../skeleton/Button';

const FormEditAccount = ({ formData, onInputChange, onResetPassword, roles = [] }) => {
  
  const handleChange = (field) => (e) => {
    const val = e?.target !== undefined ? e.target.value : e;
    onInputChange(field, val);
  };

  const getCurrentRoleCode = () => {
    if (Array.isArray(formData?.roles) && formData.roles.length > 0) {
      return formData.roles[0].code || formData.roles[0].id || '';
    }
    if (formData?.role) {
      return typeof formData.role === 'string' ? formData.role : formData.role.code;
    }
    return '';
  };

  return (
    // 🛠️ ĐỒNG BỘ UI: Đồng nhất khoảng cách gap-5 giữa khối nội dung lớn
    <div className="flex flex-col gap-5 animate-in fade-in duration-500 font-inter text-[#191C1D]">
      
      {/* 2. LƯỚI NHẬP LIỆU CÁC TRƯỜNG THÔNG TIN */}
      {/* 🛠️ ĐỒNG BỘ UI: Tối ưu khoảng cách lưới gap-x-6 gap-y-4 */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        
        {/* Họ và tên */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700 ml-0.5">Họ và tên *</label>
          <FormInput 
            className="h-10 border border-gray-200 rounded-xl text-sm bg-gray-50/30 focus:outline-none focus:border-[#0037B0] focus:bg-white transition-all shadow-3xs"
            value={formData?.fullname || ''} 
            onChange={handleChange('fullname')} 
          />
        </div>

        {/* Tên đăng nhập */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400 ml-0.5">Tên đăng nhập</label>
          <FormInput 
            value={formData?.username || ''} 
            disabled 
            readOnly
            onChange={() => {}}
            className="h-10 px-3.5 bg-gray-100/50 text-gray-400 border border-gray-100 rounded-xl text-sm cursor-not-allowed italic outline-none" 
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700 ml-0.5">Email</label>
          <FormInput 
            className="h-10 border border-gray-200 rounded-xl text-sm bg-gray-50/30 focus:outline-none focus:border-[#0037B0] focus:bg-white transition-all shadow-3xs"
            value={formData?.email || ''} 
            onChange={handleChange('email')} 
          />
        </div>

        {/* Số điện thoại */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700 ml-0.5">Số điện thoại</label>
          <FormInput 
            className="h-10 border border-gray-200 rounded-xl text-sm bg-gray-50/30 focus:outline-none focus:border-[#0037B0] focus:bg-white transition-all shadow-3xs"
            value={formData?.phone || ''} 
            onChange={handleChange('phone')} 
          />
        </div>

        {/* Địa chỉ */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700 ml-0.5">Địa chỉ</label>
          <FormInput 
            className="h-10 border border-gray-200 rounded-xl text-sm bg-gray-50/30 focus:outline-none focus:border-[#0037B0] focus:bg-white transition-all shadow-3xs"
            value={formData?.address || ''} 
            onChange={handleChange('address')} 
          />
        </div>

        {/* Giới tính */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700 ml-0.5">Giới tính</label>
          <select 
            className="w-full h-10 px-3.5 bg-gray-50/30 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#0037B0] transition-all cursor-pointer shadow-3xs"
            value={formData?.gender !== undefined ? formData.gender : 1}
            onChange={(e) => onInputChange('gender', Number(e.target.value))}
          >
            <option value={1}>Nam</option>
            <option value={0}>Nữ</option>
          </select>
        </div>

        {/* Nhóm quyền */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700 ml-0.5">Nhóm quyền</label>
          <select 
            className="w-full h-10 px-3.5 bg-gray-50/30 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#0037B0] transition-all cursor-pointer shadow-3xs"
            value={getCurrentRoleCode()}
            onChange={(e) => {
              const selectedCode = e.target.value;
              const selectedRole = roles.find(r => r.code === selectedCode || r.id === selectedCode);
              if (selectedRole) {
                onInputChange('roles', [selectedRole]);
              }
            }}
          >
            <option value="" disabled>-- Chọn quyền --</option>
            {roles && roles.length > 0 ? (
              roles.map(role => (
                <option key={role.id} value={role.code}>
                  {role.name}
                </option>
              ))
            ) : (
              <option value="" disabled>Không có quyền nào</option>
            )}
          </select>
        </div>

        {/* Trạng thái */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700 ml-0.5">Trạng thái</label>
          <div className="flex items-center gap-6 h-10 px-1">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input 
                type="radio" 
                name="status"
                checked={formData?.isactive === 1 || String(formData?.isactive) === "1" || formData?.isActive === true} 
                className="w-4 h-4 accent-[#0037B0] cursor-pointer"
                onChange={() => onInputChange('isactive', 1)}
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-[#0037B0] transition-colors">Hoạt động</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input 
                type="radio" 
                name="status"
                checked={formData?.isactive === 0 || String(formData?.isactive) === "0" || formData?.isActive === false} 
                className="w-4 h-4 accent-[#0037B0] cursor-pointer"
                onChange={() => onInputChange('isactive', 0)}
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-[#0037B0] transition-colors">Tạm khóa</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. KHU VỰC ĐỔI MẬT KHẨU */}
      {/* 🛠️ ĐỒNG BỘ UI: Làm mượt nút Reset mật khẩu thành dạng border mỏng h-9 rounded-xl tinh tế */}
      <div className="pt-4 border-t border-gray-100 mt-1">
        <Button 
          variant="text" 
          className="flex items-center gap-2 h-9 px-4 text-xs font-bold border border-gray-200 text-[#0037B0] rounded-xl bg-blue-50/30 hover:bg-blue-50 transition-colors active:scale-[0.98]"
          onClick={() => onResetPassword && onResetPassword(formData)} 
        >
          <span>🔄</span> Cập nhật mật khẩu mới
        </Button>
      </div>

    </div>
  );
};

export default FormEditAccount;