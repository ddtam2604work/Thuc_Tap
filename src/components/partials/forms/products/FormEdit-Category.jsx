import { useState, useEffect } from 'react';
import Button from '../../../skeleton/Button';
import CategoryFormInput from './CategoryFormInput';

const FormEditCategory = ({ initialData, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    code: '', 
    desc: '',
    isactive: 1 
  });

  // Khởi tạo dữ liệu ban đầu khi mở form (GIỮ NGUYÊN)
  useEffect(() => {
    if (initialData) {
      let currentActive = 1;
      
      if (initialData.isactive !== undefined) {
        currentActive = Number(initialData.isactive);
      } else if (initialData.status !== undefined) {
        currentActive = (initialData.status === 'ACTIVE' || String(initialData.status) === "1") ? 1 : 0;
      }

      setFormData({
        name: initialData.name || '',
        code: initialData.code || '', 
        desc: initialData.desc || '',
        isactive: currentActive
      });
    }
  }, [initialData]);

  // Hàm xử lý thay đổi dữ liệu (GIỮ NGUYÊN)
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [id]: id === 'isactive' ? Number(value) : value 
    }));
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
        disabled={isSaving}
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

        {/* Phần Trạng thái */}
        <CategoryFormInput 
          id="isactive" 
          label="Trạng thái" 
          required
          isSelect
          options={[
            { value: 1, label: 'Hoạt động' },
            { value: 0, label: 'Khoá' }
          ]}
          value={formData.isactive}
          onChange={handleChange}
          disabled={isSaving}
        />
      </div>

      {/* Mô tả */}
      <CategoryFormInput 
        id="desc"
        label="Mô tả"
        isTextarea
        value={formData.desc}
        onChange={handleChange}
        disabled={isSaving}
      />

      {/* Nút thao tác */}
      <div className="flex justify-end items-center gap-3 pt-6 border-t border-gray-100 mt-4">
        <Button 
          variant="secondary" 
          onClick={onCancel}
          disabled={isSaving}
          className="px-8 !h-[40px] disabled:opacity-50" 
        >
          Huỷ
        </Button>

        <Button 
          type="submit"
          disabled={isSaving}
          className={`px-10 !h-[40px] text-white transition-colors ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0014FF] hover:bg-blue-800'}`}
        >
          {isSaving ? 'Đang lưu...' : <> Cập nhật danh mục</>}
        </Button>
      </div>
    </form>
  );
};

export default FormEditCategory;