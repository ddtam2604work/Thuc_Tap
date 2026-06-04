import { useState, useEffect } from 'react';
import Button from '../../../skeleton/Button';
import CategoryFormInput from './CategoryFormInput';

const FormInsertProduct = ({ initialData, onSave, onCancel, isSaving, categories = [], units = [] }) => {
  // Khởi tạo state không còn material và size
  const [formData, setFormData] = useState({ 
    name: '', 
    code: initialData?.code || '', 
    productcategory_id: initialData?.productcategory_id || '', 
    units_id: initialData?.units_id || '',
    price: '', 
    status: 1, 
    desc: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ 
        ...prev, 
        code: initialData.code || prev.code,
        productcategory_id: initialData.productcategory_id || prev.productcategory_id || '',
        units_id: initialData.units_id || prev.units_id || ''
      }));
    }
  }, [initialData]); 

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // CHỈ GIỮ LẠI 1 HÀM handleSubmit DUY NHẤT
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Gói dữ liệu gọn gàng hơn
    const dataToSend = {
      ...formData,
      price: formData.price
    };
    
    // Đẩy dữ liệu lên Component cha (ProductManagementPage) để gọi API thông qua Hook
    onSave(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <CategoryFormInput 
        label="Tên sản phẩm" id="name" required placeholder="Nhập tên sản phẩm"
        value={formData.name} onChange={handleChange} disabled={isSaving}
      />
      
      <div className="grid grid-cols-2 gap-6">
        <CategoryFormInput 
          label="Mã sản phẩm" id="code" required 
          value={formData.code} readOnly 
          className="bg-gray-100 text-gray-500 cursor-not-allowed italic font-mono"
        />
        
        <div className="flex flex-col gap-2">
          <label className="font-inter font-semibold text-[12px] text-[#434655] tracking-[0.6px] uppercase">
            Danh mục <span className="text-red-500">*</span>
          </label>
          {/* Đã gỡ dòng text comment thừa ở đây và chỉnh lại onChange */}
          <select 
            id="productcategory_id"
            required
            disabled={isSaving}
            value={formData.productcategory_id}
            onChange={handleChange}
            className="h-[42px] px-3 bg-white border border-[#747686] rounded-[4px] text-[14px] outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]/20 transition-all cursor-pointer disabled:bg-gray-100"
          >
            <option value="" disabled>-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="relative">
          <CategoryFormInput 
            label="Giá cơ bản" id="price" required placeholder="Ví dụ: 350000"
            value={formData.price} onChange={handleChange} disabled={isSaving}
          />
          <span className="absolute right-3 bottom-[11px] text-xs font-semibold text-gray-500">VNĐ</span>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-inter font-semibold text-[12px] text-[#434655] tracking-[0.6px] uppercase">Trạng thái</label>
          <select 
            id="status" disabled={isSaving}
            className="h-[42px] px-3 bg-white border border-[#747686] rounded-[4px] text-[14px] outline-none focus:border-[#1D4ED8] transition-all cursor-pointer disabled:bg-gray-100"
            value={formData.status} onChange={handleChange}
          >
            <option value={1}>Hoạt động</option>
            <option value={0}>Ngừng kinh doanh</option>
          </select>
        </div>
      </div>

      <CategoryFormInput 
        label="Mô tả" id="desc" isTextarea placeholder="Chi tiết sản phẩm..."
        value={formData.desc} onChange={handleChange} disabled={isSaving}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving} className="px-8">
          Huỷ
        </Button>
        <Button type="submit" disabled={isSaving} className={`px-10 ${isSaving ? 'bg-gray-400' : 'bg-[#0014FF]'}`}>
          {isSaving ? 'Đang lưu...' : '💾 Lưu sản phẩm'}
        </Button>
      </div>
    </form>
  );
};

export default FormInsertProduct;