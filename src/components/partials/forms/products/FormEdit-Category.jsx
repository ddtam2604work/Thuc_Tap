import { useState, useEffect } from 'react';
import PrimaryButton from '../../../skeleton/PrimaryButton';
import CategoryFormInput from './CategoryFormInput';
import { STATUS_LABELS } from '../../../../constants/product';

const FormEditCategory = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    code: '', 
    desc: '',
    status: 'ACTIVE' // Giá trị mặc định
  });

  // Giữ nguyên logic khởi tạo dữ liệu ban đầu
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.id || '',
        desc: initialData.desc || '',
        status: initialData.status || 'ACTIVE'
      });
    }
  }, [initialData]);

  // Giữ nguyên logic xử lý thay đổi input
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Tên danh mục */}
      <CategoryFormInput 
        id="name"
        label="Tên danh mục"
        required
        value={formData.name}
        onChange={handleChange}
      />

      <div className="grid grid-cols-2 gap-4">
        {/* Mã danh mục - Chế độ chỉ đọc */}
        <CategoryFormInput 
          id="code"
          label="Mã danh mục"
          required
          readOnly
          className="bg-gray-50 opacity-70 cursor-not-allowed"
          value={formData.code}
          onChange={handleChange}
        />

        {/* Phần Trạng thái - Đồng bộ style với CategoryFormInput */}
        <div className="w-full flex flex-col items-start gap-[6px]">
          <label className="font-inter font-semibold text-[12px] leading-[16px] text-[#434655] tracking-[0.6px] uppercase">
            Trạng thái <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full h-[42px] px-3 bg-white border border-[#747686] rounded-[4px] text-[14px] text-[#191C1D] outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]/20 transition-all cursor-pointer"
          >
            {Object.keys(STATUS_LABELS).map((key) => (
              <option key={key} value={key}>
                {STATUS_LABELS[key].text}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mô tả */}
      <CategoryFormInput 
        id="desc"
        label="Mô tả"
        isTextarea
        value={formData.desc}
        onChange={handleChange}
      />

      {/* Nút thao tác */}
      <div className="flex justify-end items-center gap-3 pt-6 border-t border-gray-100 mt-4">
        <PrimaryButton 
          variant="secondary" 
          onClick={onCancel}
          className="px-8 !h-[40px]" 
        >
          Huỷ
        </PrimaryButton>

        <PrimaryButton 
          type="submit"
          className="px-10 bg-[#0014FF] !h-[40px]"
        >
          <span className="mr-2 text-lg">💾</span> Lưu danh mục
        </PrimaryButton>
      </div>
    </form>
  );
};

export default FormEditCategory;