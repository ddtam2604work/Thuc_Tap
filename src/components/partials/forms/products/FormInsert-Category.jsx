import { useState } from 'react';
import PrimaryButton from '../../../skeleton/PrimaryButton'; 
import CategoryFormInput from './CategoryFormInput';

const FormInsertCategory = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({ name: '', code: '', desc: '' });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="flex flex-col gap-6">
      <CategoryFormInput 
        id="name"
        label="Tên danh mục"
        required
        placeholder="Nhập tên danh mục"
        value={formData.name}
        onChange={handleChange}
      />

      <CategoryFormInput 
        id="code"
        label="Mã danh mục"
        required
        note="(hệ thống tự sinh mã, có thể chỉnh sửa)"
        placeholder="Được tạo tự động"
        value={formData.code}
        onChange={handleChange}
      />

      <CategoryFormInput 
        id="desc"
        label="Mô tả"
        isTextarea
        placeholder="Ghi chú danh mục..."
        value={formData.desc}
        onChange={handleChange}
      />

      <div className="flex justify-end items-center gap-3 pt-6 border-t border-gray-100 mt-4">
        {/* Nút Huỷ sử dụng variant secondary */}
        <PrimaryButton 
          variant="secondary" 
          onClick={onCancel}
          className="px-8" // Chỉ định độ rộng bằng padding thay vì w-full
        >
          Huỷ
        </PrimaryButton>

        {/* Nút Lưu sử dụng variant primary mặc định */}
        <PrimaryButton 
          type="submit"
          className="px-10 bg-[#0014FF]" // Giữ màu đặc trưng bạn muốn
        >
          <span className="text-lg">💾</span> Lưu danh mục
        </PrimaryButton>
      </div>
    </form>
  );
};

export default FormInsertCategory;