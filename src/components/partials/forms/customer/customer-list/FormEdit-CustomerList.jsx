import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../skeleton/Button';

// --- IMPORT HOOK THÔNG BÁO DÙNG CHUNG ---
import { useNotification } from '../../../../../context/NotificationContext';

const FormEditCustomerList = ({ initialData, onClose, onSubmit, isSaving, categories = [] }) => {
  const [formData, setFormData] = useState({
    fullname: '', studioname: '', phone: '', email: '',
    address: '', customercategories_id: '', description: '',
    isportal: false, isactive: 1
  });
  const [errors, setErrors] = useState({});

  // Kích hoạt hook thông báo
  const { showToast } = useNotification();

  // 🎯 THEO DÕI VÀ ĐẬP DỮ LIỆU CỦA HÀNG ĐƯỢC CHỌN LÊN Ô INPUT TRỰC QUAN
  useEffect(() => {
    if (initialData) {
      setFormData({
        fullname: initialData.fullname || '',
        studioname: initialData.studioname || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        address: initialData.address || '',
        customercategories_id: initialData.customercategories_id || '',
        description: initialData.description || '',
        isportal: !!initialData.isportal, // Ép kiểu về true/false cho checkbox
        isactive: initialData.isactive === 1 ? 1 : 0
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : (name === 'isactive' ? Number(value) : value) 
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullname.trim()) {
      setErrors({ fullname: 'Tên khách hàng không được để trống' });
      // Bắn Toast Warning khi validate thất bại
      showToast('Tên khách hàng không được để trống!', 'warning');
      return;
    }

    const payload = {
      username: formData.phone.trim(), 
      fullname: formData.fullname.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      email: formData.email.trim(),
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
        
        {/* Trường nhập dữ liệu đồng bộ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Tên khách hàng <span className="text-red-500">*</span></label>
            <input type="text" name="fullname" value={formData.fullname} onChange={handleChange} disabled={isSaving} className="h-10 px-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/30 focus:border-[#0037B0] outline-none transition-all shadow-3xs" />
            {errors.fullname && <span className="text-xs text-red-500 mt-0.5">{errors.fullname}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Tên Studio</label>
            <input type="text" name="studioname" value={formData.studioname} onChange={handleChange} disabled={isSaving} className="h-10 px-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/30 focus:border-[#0037B0] outline-none transition-all shadow-3xs" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 select-none">Số điện thoại (Tài khoản cố định)</label>
            <input type="text" name="phone" value={formData.phone} disabled className="h-10 px-3.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-400 font-semibold outline-none cursor-not-allowed select-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={isSaving} className="h-10 px-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/30 focus:border-[#0037B0] outline-none transition-all shadow-3xs" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Nhóm khách hàng</label>
            <select name="customercategories_id" value={formData.customercategories_id} onChange={handleChange} disabled={isSaving} className="h-10 px-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/30 focus:border-[#0037B0] outline-none shadow-3xs cursor-pointer">
              <option value="">-- Chọn nhóm khách hàng --</option>
              {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Trạng thái hoạt động</label>
            <select name="isactive" value={formData.isactive} onChange={handleChange} disabled={isSaving} className={`h-10 px-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/30 focus:border-[#0037B0] outline-none shadow-3xs cursor-pointer font-medium ${formData.isactive === 1 ? 'text-emerald-700' : 'text-rose-600'}`}>
              <option value={1}>✅ Đang hoạt động</option>
              <option value={0}>⛔ Đã ngừng hoạt động</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700">Địa chỉ</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} disabled={isSaving} className="h-10 px-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/30 focus:border-[#0037B0] outline-none shadow-3xs" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700">Ghi chú / Mô tả</label>
          <textarea name="description" value={formData.description} onChange={handleChange} disabled={isSaving} placeholder="Nhập ghi chú về khách hàng..." rows="3" className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/30 focus:border-[#0037B0] outline-none shadow-3xs resize-none" />
        </div>

        <div className="flex items-center gap-2.5 py-1 mt-1">
          <input type="checkbox" id="portalCheckEdit" name="isportal" checked={formData.isportal} onChange={handleChange} disabled={isSaving} className="w-4 h-4 border border-gray-300 rounded-[4px] cursor-pointer accent-[#0037B0]" />
          <label htmlFor="portalCheckEdit" className="text-sm font-medium text-gray-700 cursor-pointer select-none">Cấp quyền truy cập Portal</label>
        </div>
      </div>

      <div className="flex justify-end gap-2.5 px-6 py-4 bg-gray-50/60 border-t border-gray-100 rounded-b-2xl">
        <Button type="button" variant="outline-secondary" className="h-9 px-4 text-xs font-bold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100" onClick={onClose} disabled={isSaving}>Huỷ</Button>
        <Button type="submit" variant="primary" disabled={isSaving} className="bg-[#0037B0] hover:bg-[#00267A] h-9 px-5 text-xs font-bold uppercase tracking-wider text-white rounded-xl shadow-xs">{isSaving ? '⏳ Đang lưu...' : 'Cập nhật khách hàng'}</Button>
      </div>
    </form>
  );
};

FormEditCustomerList.propTypes = { initialData: PropTypes.object, onClose: PropTypes.func.isRequired, onSubmit: PropTypes.func.isRequired, isSaving: PropTypes.bool.isRequired, categories: PropTypes.array };
export default FormEditCustomerList;