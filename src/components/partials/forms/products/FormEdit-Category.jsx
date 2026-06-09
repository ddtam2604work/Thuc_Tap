import { useState, useEffect } from 'react';
import Button from '../../../skeleton/Button';
import CategoryFormInput from './CategoryFormInput';

const FormEditCategory = ({ initialData, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    code: '', 
    desc: '',
    isactive: 1 // 🎯 Đã đổi thành isactive với giá trị số nguyên
  });

  // Khởi tạo dữ liệu ban đầu khi mở form
  useEffect(() => {
    if (initialData) {
      let currentActive = 1;
      
      // Lấy chính xác dữ liệu isactive (hoặc ép từ status cũ nếu lỡ data bị lệch)
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

  const handleChange = (e) => {
    const { id, value } = e.target;
    // Tự động ép kiểu Number cho trường isactive
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
        <div className="w-full flex flex-col items-start gap-[6px]">
          <label className="font-inter font-semibold text-[12px] leading-[16px] text-[#434655] tracking-[0.6px] uppercase">
            Trạng thái <span className="text-red-500">*</span>
          </label>
          <select
            id="isactive" // 🎯 Đổi ID thành isactive để handleChange nhận dạng
            value={formData.isactive}
            onChange={handleChange}
            disabled={isSaving}
            className="w-full h-[42px] px-3 bg-white border border-[#747686] rounded-[4px] text-[14px] text-[#191C1D] outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]/20 transition-all cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {/* 🎯 Gán cứng lựa chọn theo chuẩn Database */}
            <option value={1}>Hoạt động</option>
            <option value={0}>Khoá</option>
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