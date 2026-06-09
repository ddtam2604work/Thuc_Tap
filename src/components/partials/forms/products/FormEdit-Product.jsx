import { useState, useEffect } from 'react';
import Button from '../../../skeleton/Button';
import CategoryFormInput from './CategoryFormInput';

const FormEditProduct = ({ initialData, onSave, onCancel, isSaving, categories = [], units = [] }) => {
  const [formData, setFormData] = useState({ 
    name: '', code: '', productcategory_id: '', units_id: '', price: '', status: 1, desc: '', thumbnail: '' 
  });

  useEffect(() => {
    console.log('📝 FormEditProduct init - initialData:', initialData);
    if (initialData) {
      const isActive = (String(initialData.isactive) === '1' || initialData.isactive === true) || 
                       (String(initialData.status) === '1' || initialData.status === 'ACTIVE');

      // 🔄 SAFE PRICE EXTRACTION
      // Thay vì code cũ sử dụng Regex .replace(/[^0-9]/g, '') trực tiếp trên chuỗi "350000.00"
      // Hãy dùng Math.floor(Number(...)) để loại bỏ triệt để phần thập phân trước khi chuyển về String:
      const priceRaw = initialData.price || initialData.productprice || initialData.standard_price || 0;
      const priceClean = priceRaw ? String(Math.floor(Number(priceRaw))) : '';

      const newFormData = { 
        name: initialData.name || initialData.product_name || '',
        code: initialData.code || initialData.product_code || '',
        productcategory_id: initialData.productcategory_id || initialData.category_id || initialData.productCategoryId || '', 
        units_id: initialData.units_id || initialData.unitId || '',
        desc: initialData.description || initialData.desc || initialData.product_description || '',
        price: priceClean,
        status: isActive ? 1 : 0,
        thumbnail: initialData.thumbnail || initialData.image || ''
      };
      console.log('📝 FormEditProduct field mapping:', {
        name: newFormData.name || 'EMPTY',
        code: newFormData.code || 'EMPTY',
        productcategory_id: newFormData.productcategory_id || 'EMPTY',
        price: newFormData.price || 'EMPTY',
        desc: newFormData.desc || 'EMPTY',
        status: newFormData.status
      });
      console.log('📝 FormEditProduct newFormData:', newFormData);
      setFormData(newFormData);
    } else {
      console.warn('⚠️ FormEditProduct: initialData is null/undefined');
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 🌟 LÀM SẠCH DỮ LIỆU: Loại bỏ mọi ký tự dấu phẩy/dấu chấm để tránh lỗi NaN
    const rawPrice = String(formData.price).replace(/[^0-9]/g, '');
    
    const dataToSend = {
      ...formData,
      price: Number(rawPrice) || 0,
      status: Number(formData.status) // Đảm bảo luôn gửi số nguyên 0 hoặc 1
    };
    onSave(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <CategoryFormInput 
        label="Tên sản phẩm" id="name" required
        value={formData.name} onChange={handleChange} disabled={isSaving}
      />
      
      <div className="grid grid-cols-2 gap-6">
        <CategoryFormInput 
          label="Mã sản phẩm" id="code" required readOnly 
          className="bg-gray-100 text-gray-500 cursor-not-allowed italic font-mono"
          value={formData.code} onChange={() => {}} 
        />
        
        <div className="flex flex-col gap-2">
          <label className="font-inter font-semibold text-[12px] leading-4 text-[#434655] tracking-[0.6px] uppercase">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <select 
            id="productcategory_id" required disabled={isSaving}
            className="h-[42px] px-3 bg-white border border-[#747686] rounded-[4px] text-[14px] text-[#191C1D] outline-none focus:border-[#1D4ED8] transition-all cursor-pointer disabled:bg-gray-100"
            value={formData.productcategory_id} onChange={handleChange}
          >
            <option value="" disabled>-- Chọn danh mục --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="relative">
          <CategoryFormInput 
            label="Giá cơ bản (Standard)" id="price" required
            value={formData.price} onChange={handleChange} disabled={isSaving}
          />
          <span className="absolute right-3 bottom-[11px] text-xs font-semibold text-gray-500">VNĐ</span>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="font-inter font-semibold text-[12px] leading-4 text-[#434655] tracking-[0.6px] uppercase">Trạng thái</label>
          <select 
            id="status" disabled={isSaving}
            className="h-[42px] px-3 bg-white border border-[#747686] rounded-[4px] text-[14px] text-[#191C1D] outline-none focus:border-[#1D4ED8] transition-all cursor-pointer disabled:bg-gray-100"
            value={formData.status} onChange={handleChange}
          >
            <option value={1}>Hoạt động</option>
            <option value={0}>Ngừng kinh doanh</option>
          </select>
        </div>
      </div>

      <CategoryFormInput 
        label="Mô tả" id="desc" isTextarea 
        value={formData.desc} onChange={handleChange} disabled={isSaving}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving} className="px-8">
          Huỷ
        </Button>
        <Button type="submit" disabled={isSaving} className={`px-10 ${isSaving ? 'bg-gray-400' : 'bg-[#0014FF]'}`}>
          {isSaving ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
        </Button>
      </div>
    </form>
  );
};

export default FormEditProduct;