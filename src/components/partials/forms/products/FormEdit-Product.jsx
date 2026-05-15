// Form Sửa sản phẩm - Tương tự FormInsert nhưng có initialData populate
import { useState, useEffect } from 'react';
import PrimaryButton from '../../../skeleton/PrimaryButton';
import CategoryFormInput from './CategoryFormInput';
import { STATUS_LABELS } from '../../../../constants/product';

const FormEditProduct = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ name: '', code: '', category: 'Album ảnh', price: '', status: 'ACTIVE', desc: '' });

  useEffect(() => {
    if (initialData) setFormData({ ...initialData, code: initialData.id });
  }, [initialData]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="flex flex-col gap-8">
      <CategoryFormInput 
        label="Tên sản phẩm" 
        id="name" 
        required
        value={formData.name} 
        onChange={handleChange} 
      />
      
      <div className="grid grid-cols-2 gap-6">
        <CategoryFormInput 
          label="Mã sản phẩm" 
          id="code" 
          required 
          readOnly 
          className="bg-gray-50 opacity-70"
          value={formData.code} 
          onChange={handleChange} 
        />
        <div className="flex flex-col gap-2">
          <label className="font-inter font-semibold text-[12px] leading-4 text-[#434655] tracking-[0.6px] uppercase">Danh mục</label>
          <select 
            id="category"
            className="h-10.5 px-3 bg-white border border-gray-400 rounded-sm text-sm text-gray-900 
                     placeholder-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
            value={formData.category} 
            onChange={handleChange}
          >
            <option>Album ảnh</option>
            <option>Photobook</option>
            <option>Ảnh gỗ</option>
            <option>Backdrop & Decor</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="relative">
          <CategoryFormInput 
            label="Giá cơ bản (Standard)" 
            id="price" 
            required
            value={formData.price} 
            onChange={handleChange} 
          />
          <span className="absolute right-3 bottom-3 text-xs font-semibold text-gray-500">VNĐ</span>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-inter font-semibold text-[12px] leading-4 text-[#434655] tracking-[0.6px] uppercase">Trạng thái</label>
          <select 
            id="status"
            className="h-10.5 px-3 bg-white border border-gray-400 rounded-sm text-sm text-gray-900 
                     placeholder-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
            value={formData.status} 
            onChange={handleChange}
          >
            {Object.keys(STATUS_LABELS).map(key => <option key={key} value={key}>{STATUS_LABELS[key].text}</option>)}
          </select>
        </div>
      </div>

      <CategoryFormInput 
        label="Mô tả" 
        id="desc" 
        isTextarea 
        placeholder="Chi tiết cấu hình, vật liệu, tính năng..."
        value={formData.desc} 
        onChange={handleChange} 
      />

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <PrimaryButton 
          type="button"
          variant="secondary" 
          onClick={onCancel}
          className="px-8"
        >
          Huỷ
        </PrimaryButton>
        <PrimaryButton 
          type="submit"
          className="px-10 bg-blue-600"
        >
          💾 Cập nhật
        </PrimaryButton>
      </div>
    </form>
  );
};

export default FormEditProduct;