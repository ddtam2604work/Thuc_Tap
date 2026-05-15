import FormInput from '../../../skeleton/FormInput';

const FormEditAccount = ({ formData, onInputChange }) => {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      
      {/* Avatar Section: Thiết kế lại cho mềm mại hơn */}
      

      {/* Grid nhập liệu */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Họ và tên *</label>
          <FormInput value={formData?.name} onChange={(e) => onInputChange('name', e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1 text-gray-400">Tên đăng nhập</label>
          <FormInput 
            value={formData?.username} 
            readOnly 
            className="bg-gray-100/50 text-gray-400 border-transparent cursor-not-allowed italic" 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email công ty</label>
          <FormInput value={formData?.email} onChange={(e) => onInputChange('email', e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Số điện thoại</label>
          <FormInput value={formData?.phone} onChange={(e) => onInputChange('phone', e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nhóm quyền</label>
          <select 
            className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-[12px] text-[15px] outline-none focus:bg-white focus:border-blue-500 transition-all"
            value={formData?.role}
            onChange={(e) => onInputChange('role', e.target.value)}
          >
            <option value="Admin">Admin</option>
            <option value="Staff">Nhân viên</option>
          </select>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Trạng thái</label>
          <div className="flex items-center gap-6 h-14 px-1">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input 
                type="radio" 
                checked={formData?.status === 'ACTIVE'} 
                className="w-5 h-5 accent-blue-600"
                onChange={() => onInputChange('status', 'ACTIVE')}
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Hoạt động</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input 
                type="radio" 
                checked={formData?.status !== 'ACTIVE'} 
                className="w-5 h-5 accent-blue-600"
                onChange={() => onInputChange('status', 'INACTIVE')}
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Tạm khóa</span>
            </label>
          </div>
        </div>
      </div>

      {/* Nút cập nhật mật khẩu: Tách biệt để giảm cảm giác dày đặc của Form */}
      <div className="pt-4 border-t border-gray-100">
        <button className="flex items-center gap-3 px-5 py-3 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-700 hover:bg-blue-100 transition-all active:scale-[0.98]">
          <span className="text-lg">🛡️</span>
          <span className="text-[12px] font-bold uppercase tracking-wider">Cập nhật mật khẩu bảo mật</span>
        </button>
      </div>
    </div>
  );
};

export default FormEditAccount;