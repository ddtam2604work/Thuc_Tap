import { useState, useEffect } from 'react';
import Button from '../../../skeleton/Button';
import CategoryFormInput from './CategoryFormInput';

// Hàm helper để format số dạng xxx,xxx
const formatPrice = (val) => {
  if (!val) return '';
  const rawValue = String(val).replace(/\D/g, ''); // Loại bỏ mọi ký tự không phải số
  return rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Thêm dấu phẩy phân cách hàng nghìn
};

const FormInsertProduct = ({ initialData, onSave, onCancel, isSaving, categories = [], units = [] }) => {
  // Khởi tạo state không còn material và size
  const [formData, setFormData] = useState({ 
    name: '', 
    code: initialData?.code || '', 
    productcategory_id: initialData?.productcategory_id || '', 
    units_id: initialData?.units_id || '',
    price: initialData?.price ? formatPrice(initialData.price) : '', // Format ngay nếu có dữ liệu đầu vào
    status: 1, 
    desc: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ 
        ...prev, 
        code: initialData.code || prev.code,
        productcategory_id: initialData.productcategory_id || prev.productcategory_id || '',
        units_id: initialData.units_id || prev.units_id || '',
        price: initialData.price ? formatPrice(initialData.price) : prev.price // Cập nhật format
      }));
    }
  }, [initialData]); 

  const handleChange = (e) => {
    const { id, value, selectionStart } = e.target;

    if (id === 'price') {
      const rawValue = value.replace(/\D/g, '');
      const formattedValue = formatPrice(rawValue);

      setFormData(prev => ({ ...prev, [id]: formattedValue }));

      // THUẬT TOÁN GIỮ NGUYÊN VỊ TRÍ CON TRỎ CHUỘT
      // 1. Đếm số lượng chữ số nằm trước con trỏ chuột hiện tại
      const beforeCursorStr = value.substring(0, selectionStart);
      const digitsBeforeCursor = beforeCursorStr.replace(/\D/g, '').length;

      // 2. Tìm vị trí con trỏ mới dựa trên chuỗi đã format
      let newCursorPos = 0;
      let digitCount = 0;
      for (let i = 0; i < formattedValue.length; i++) {
        if (/\d/.test(formattedValue[i])) {
          digitCount++;
        }
        if (digitCount === digitsBeforeCursor) {
          newCursorPos = i + 1;
          break;
        }
      }

      // 3. Sử dụng requestAnimationFrame để set lại vị trí con trỏ sau khi React render xong
      window.requestAnimationFrame(() => {
        if (e.target) {
          e.target.setSelectionRange(newCursorPos, newCursorPos);
        }
      });
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  // CHỈ GIỮ LẠI 1 HÀM handleSubmit DUY NHẤT
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Gói dữ liệu gọn gàng hơn
    const dataToSend = {
      ...formData,
      // Khi gửi API, trả lại giá trị số nguyên gốc (xóa bỏ dấu phẩy)
      price: formData.price ? Number(String(formData.price).replace(/\D/g, '')) : ''
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
          <select 
            id="productcategory_id"
            required
            disabled={isSaving}
            value={formData.productcategory_id}
            onChange={handleChange}
            className="h-[56px] px-5 bg-white border border-gray-200 rounded-xl text-[14px] text-[#191C1D] outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]/20 transition-all cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
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
            label="Giá cơ bản" id="price" required placeholder="Ví dụ: 350,000"
            value={formData.price} onChange={handleChange} disabled={isSaving}
          />
          {/* Đã cập nhật class: dùng bottom-7 và translate-y-1/2 để căn giữa toán học */}
          <span className="absolute right-4 bottom-7 translate-y-1/2 text-xs font-semibold text-gray-500 pointer-events-none">
            VNĐ
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-inter font-semibold text-[12px] text-[#434655] tracking-[0.6px] uppercase">Trạng thái</label>
          <select 
            id="status" disabled={isSaving}
            className="h-[56px] px-4 bg-white border border-gray-200 rounded-xl text-[14px] text-[#191C1D] outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]/20 transition-all cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
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
          {isSaving ? 'Đang lưu...' : 'Lưu sản phẩm'}
        </Button>
      </div>
    </form>
  );
};

export default FormInsertProduct;