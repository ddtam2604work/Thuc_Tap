import PropTypes from 'prop-types';
import { useProductItemRow } from '../../../hooks/Order/useProductItemRow';

const ProductItemRow = ({ product, index, catalog, isLoadingCatalog, isRemovable, onRemove, onUpdate }) => {
  const {
    formatCurrency,
    handleSelectProduct,
    handleQuantityChange,
    handleAppliedPriceChange,
    handleFileUpload,
    handleRemoveImage,
    handleDriveLinkChange,
    handleNoteChange
  } = useProductItemRow({ product, catalog, onUpdate });

  return (
    <div className="relative bg-white border border-gray-100 border-l-4 border-l-blue-500/90 shadow-xs rounded-xl p-5 flex flex-col gap-4 pt-7 transition-all duration-200 hover:shadow-sm">
      
      {/* Floating Badge số thứ tự dòng */}
      <div className="absolute -left-2.5 -top-2 w-5.5 h-5.5 bg-gradient-to-tr from-blue-600 to-blue-500 text-white rounded-full flex items-center justify-center shadow-md z-10 text-[10px] font-bold">
        {index + 1}
      </div>

      {/* Nút Xóa dòng sản phẩm cấu hình */}
      {isRemovable && (
        <button 
          type="button" 
          onClick={onRemove} 
          className="absolute right-3 top-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 active:scale-90" 
        >
          🗑️
        </button>
      )}

      {/* Grid cấu hình thông tin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        
        {/* Dropdown Sản Phẩm In lấy trực tiếp dữ liệu sạch từ useProducts */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Sản phẩm</label>
          <select 
            value={product.productId || product.product_id || ''} 
            onChange={handleSelectProduct}
            disabled={isLoadingCatalog}
            className="w-full h-9 px-3 border border-gray-200 rounded-lg text-[12px] bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-700 cursor-pointer"
          >
            <option value="" disabled>-- Vui lòng chọn sản phẩm cần in --</option>
            {catalog?.map(item => (
              <option key={item.id || item.product_id} value={item.id || item.product_id}>
                {/* 🌟 ĐỒNG BỘ HIỂN THỊ: Map chuẩn theo item.code và item.name từ useProducts */}
                {item.code ? `[${item.code}] ` : ''}{item.name || 'Sản phẩm không tên'}
              </option>
            ))}
          </select>
        </div>

        {/* Số lượng */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Số lượng</label>
          <input 
            type="number" 
            min="1" 
            value={product.quantity ?? ''} 
            onChange={handleQuantityChange}
            className="w-full h-9 px-3 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-gray-800" 
          />
        </div>

        {/* Giá Cơ Bản (Đọc từ trường .price của useProducts) */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Giá cơ bản</label>
          <input 
            type="text" 
            disabled 
            value={`${formatCurrency(product.basePrice || product.price || 0)}`}
            className="w-full h-9 px-3 border border-gray-100 rounded-lg text-[12px] bg-gray-50 text-gray-400 font-medium select-none focus:outline-none" 
          />
        </div>

        {/* Giá Áp Dụng */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Giá áp dụng (VNĐ)</label>
          <input 
            type="number" 
            value={product.appliedPrice || product.applied_price || 0}
            onChange={handleAppliedPriceChange}
            className="w-full h-9 px-3 border border-gray-200 rounded-lg text-[12px] font-bold text-blue-600 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" 
          />
        </div>
      </div>

      {/* Quản lý Đính Kèm Tệp Tin / Đường dẫn Drive */}
      <div className="flex flex-col gap-3">
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">File thiết kế</label>
        
        {/* Google Drive Link */}
        <div className="flex items-center gap-2">
             <input 
              type="text"
              placeholder="Dán link Google Drive tại đây..."
              value={product.driveLink || ''}
              onChange={handleDriveLinkChange}
              className="flex-1 h-9 px-3 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-gray-700 data-all"
             />
             <button
               type="button"
               onClick={() => window.open('https://drive.google.com', '_blank')}
               className="h-9 px-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-2xs shrink-0 hover:brightness-105 active:scale-95"
             >
               🌐 Truy cập Drive
             </button>
        </div>

        {/* Direct Upload */}
        <div className="flex flex-wrap gap-2 mt-1">
          {(product.images || []).map((imgObj, i) => (
            <div key={i} className="w-[82px] h-[82px] bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center overflow-hidden relative group shadow-2xs">
              <img src={imgObj.previewUrl} alt={imgObj.name} className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => handleRemoveImage(i)} 
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              >
                ✕
              </button>
            </div>
          ))}
          
          <label className="w-[82px] h-[82px] border-2 border-dashed border-gray-200 hover:border-blue-500/40 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer bg-gray-50/50 hover:bg-blue-50/20 transition-all duration-200 active:scale-95">
            <span className="text-gray-400 text-sm">📷</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Tải trực tiếp</span>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
          </label>
        </div>
      </div>

      {/* Ghi chú riêng */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ghi chú riêng cho sản phẩm</label>
        <textarea 
          rows="2" 
          value={product.note || ''}
          onChange={handleNoteChange}
          placeholder="Yêu cầu cụ thể về kỹ thuật in ấn, quy cách gia công cho sản phẩm này..."
          className="w-full p-2.5 border border-gray-200 rounded-lg text-[12px] placeholder-gray-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-700"
        />
      </div>
    </div>
  );
};

ProductItemRow.propTypes = {
  product: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  catalog: PropTypes.array,
  isLoadingCatalog: PropTypes.bool,
  isRemovable: PropTypes.bool,
  onRemove: PropTypes.func,
  onUpdate: PropTypes.func.isRequired,
};

export default ProductItemRow;