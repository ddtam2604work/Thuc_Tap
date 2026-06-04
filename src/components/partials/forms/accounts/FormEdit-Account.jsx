import React from 'react';
import FormInput from '../../../skeleton/FormInput';
import Button from '../../../skeleton/Button';

const FormEditAccount = ({ formData, onInputChange, roles = [] }) => {
  
  // Hàm bọc lót chống lỗi lấy value bất kể cấu trúc FormInput của bạn (Giữ nguyên)
  const handleChange = (field) => (e) => {
    const val = e?.target !== undefined ? e.target.value : e;
    onInputChange(field, val);
  };

  // Hàm lấy role hiện tại từ formData (Giữ nguyên)
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
    <div className="flex flex-col gap-7 animate-in fade-in duration-500 font-inter">
      
      {/* 1. KHU VỰC ẢNH ĐẠI DIỆN (Đồng bộ theo giao diện mềm mại mới) */}
      <div className="flex items-center p-4 gap-6 bg-slate-50/60 border border-gray-100 rounded-xl shadow-sm">
        <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center text-gray-700 text-xl font-bold shadow-inner overflow-hidden shrink-0 select-none">
          {formData?.avatar ? (
            <img src={formData.avatar} className="w-full h-full object-cover" alt="avatar" />
          ) : (
            <span className="opacity-60 text-sm font-semibold">US</span>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] font-bold text-blue-700 uppercase tracking-wider">Ảnh đại diện</span>
          <p className="text-[12px] text-gray-400">Định dạng JPG, PNG. Tối đa 2MB.</p>
          <button type="button" className="text-[12px] font-bold text-blue-600 hover:text-blue-800 transition-colors mt-1 text-left outline-none">
            Thay đổi ảnh
          </button>
        </div>
      </div>

      {/* 2. LƯỚI NHẬP LIỆU CÁC TRƯỜNG THÔNG TIN */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Họ và tên *</label>
          <FormInput value={formData?.fullname || ''} onChange={handleChange('fullname')} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1 text-gray-400">Tên đăng nhập</label>
          <FormInput 
            value={formData?.username || ''} 
            disabled 
            readOnly
            onChange={() => {}}
            className="bg-gray-100/50 text-gray-400 border-transparent cursor-not-allowed italic" 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email</label>
          <FormInput value={formData?.email || ''} onChange={handleChange('email')} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Số điện thoại</label>
          <FormInput value={formData?.phone || ''} onChange={handleChange('phone')} />
        </div>

        {/* TRƯỜNG ĐỊA CHỈ (Khớp với payload của Backend) */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Địa chỉ</label>
          <FormInput value={formData?.address || ''} onChange={handleChange('address')} />
        </div>

        {/* TRƯỜNG GIỚI TÍNH (Khớp với payload của Backend) */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Giới tính</label>
          <select 
            className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-[12px] text-[15px] outline-none focus:bg-white focus:border-blue-500 transition-all cursor-pointer"
            value={formData?.gender !== undefined ? formData.gender : 1}
            onChange={(e) => onInputChange('gender', Number(e.target.value))}
          >
            <option value={1}>Nam</option>
            <option value={0}>Nữ</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nhóm quyền</label>
          <select 
            className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-[12px] text-[15px] outline-none focus:bg-white focus:border-blue-500 transition-all cursor-pointer"
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

        <div className="flex flex-col gap-3">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Trạng thái</label>
          <div className="flex items-center gap-6 h-14 px-1">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input 
                type="radio" 
                name="status"
                checked={formData?.isactive === 1 || String(formData?.isactive) === "1" || formData?.isActive === true} 
                className="w-5 h-5 accent-blue-600 cursor-pointer"
                onChange={() => onInputChange('isactive', 1)}
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Hoạt động</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input 
                type="radio" 
                name="status"
                checked={formData?.isactive === 0 || String(formData?.isactive) === "0" || formData?.isActive === false} 
                className="w-5 h-5 accent-blue-600 cursor-pointer"
                onChange={() => onInputChange('isactive', 0)}
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Tạm khóa</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. KHU VỰC ĐỔI MẬT KHẨU (Sử dụng component Button đã import) */}
      <div className="pt-4 border-t border-gray-100 mt-2">
        <Button 
          variant="text" 
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-700 hover:bg-blue-100/70 font-semibold text-[12px] uppercase tracking-wider transition-all active:scale-[0.98]"
          onClick={() => console.log("Yêu cầu cập nhật mật khẩu mới")}
        >
          <span>🔄</span> Cập nhật mật khẩu mới
        </Button>
      </div>

    </div>
  );
};

export default FormEditAccount;