import { useState, useEffect } from 'react';
import Button from '../../../skeleton/Button'; 
import CategoryFormInput from './CategoryFormInput';

const FormInsertCategory = ({ initialData, onSave, onCancel, isSaving }) => {
  // Lấy mã (code) đã được generate từ initialData truyền vào
  const [formData, setFormData] = useState({ name: '', code: initialData?.code || '', desc: '' });

  // Đồng bộ lại nếu initialData thay đổi
  useEffect(() => {
    if (initialData?.code) {
      setFormData(prev => ({ ...prev, code: initialData.code }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="flex flex-col gap-6">
      <CategoryFormInput 
        id="name" label="Tên danh mục" required placeholder="Nhập tên danh mục"
        value={formData.name} onChange={handleChange} disabled={isSaving}
      />

      <CategoryFormInput 
        id="code" label="Mã danh mục" required
        note="(Mã được hệ thống cấp tự động)"
        value={formData.code} 
        readOnly // KHÓA KHÔNG CHO NHẬP
        onChange={() => {}}
        className="bg-gray-100 text-gray-500 cursor-not-allowed italic font-mono"
      />

      <CategoryFormInput 
        id="desc" label="Mô tả" isTextarea placeholder="Ghi chú danh mục..."
        value={formData.desc} onChange={handleChange} disabled={isSaving}
      />

      <div className="flex justify-end items-center gap-3 pt-6 border-t border-gray-100 mt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving} className="px-8">
          Huỷ
        </Button>
        <Button type="submit" disabled={isSaving} className={`px-10 ${isSaving ? 'bg-gray-400' : 'bg-[#0014FF]'}`}>
          <span className="text-lg mr-2">💾</span> {isSaving ? 'Đang lưu...' : 'Lưu danh mục'}
        </Button>
      </div>
    </form>
  );
};

export default FormInsertCategory;