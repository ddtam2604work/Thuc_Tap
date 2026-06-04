import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../skeleton/Button';

const FormEditCustomerGroup = ({ initialData, onClose, onSubmit, isSaving }) => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [originalCode, setOriginalCode] = useState('');
  const [originalSort, setOriginalSort] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setOriginalCode(initialData.code || '');
      setOriginalSort(initialData.sortorder || 0);
      setFormData({
        name: initialData.name || '',
        description: initialData.description || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const clientErrors = {};
    if (!formData.name.trim()) clientErrors.name = 'Tên nhóm không được để trống';

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    const payload = {
      code: originalCode, // Gửi trả lại mã code cũ ngầm
      name: formData.name.trim(),
      description: formData.description.trim(),
      sortorder: originalSort
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col font-inter bg-white text-[#191C1D] w-full max-w-lg mx-auto">
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
            placeholder="Nhập tên nhóm mới" 
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
            placeholder="Cập nhật mô tả ngắn gọn..." 
            className="w-full h-28 p-3.5 border border-gray-200 rounded-xl text-sm resize-none bg-gray-50/30 focus:outline-none focus:border-[#0037B0] focus:bg-white transition-all shadow-3xs" 
          />
        </div>

      </div>

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
          {isSaving ? '⏳ Đang cập nhật...' : '💾 Cập nhật'}
        </Button>
      </div>
    </form>
  );
};

FormEditCustomerGroup.propTypes = {
  initialData: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
};

export default FormEditCustomerGroup;