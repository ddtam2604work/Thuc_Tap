import PropTypes from 'prop-types';
import { useProductItemRow } from '../../../hooks/Order/useProductItemRow';

const ProductItemRow = ({ product, index, catalog, isLoadingCatalog, isRemovable, onRemove, onUpdate }) => {
  const {
    isUploading,
    formatCurrency,
    handleSelectProduct,
    handleQuantityChange,
    handleAppliedPriceChange,
    handleFileUpload,
    handleRemoveImage,
    handleDriveLinkChange,
    handleNoteChange
  } = useProductItemRow({ product, catalog, onUpdate });

  // 🎯 LUỒNG KIỂM TRA PHÒNG THỦ: Xác định sản phẩm hiện tại trong dòng đơn hàng có bị khóa hay không
  const isProductDisabled = (() => {
    const currentId = product.productId || product.product_id;
    if (!currentId || !catalog) return false;
    
    const found = catalog.find(item => String(item.id || item.product_id) === String(currentId));
    if (found) {
      // Nhận diện theo cấu trúc API của ProductManagementTable (isactive string/bool hoặc status Khóa)
      return String(found.isactive) === '0' || found.isactive === false || found.status === 'Khóa';
    }
    // Fallback: Nếu đơn hàng cũ có ID nhưng API catalog đã lọc bỏ hoàn toàn không trả về nữa
    return true;
  })();

  return (
    <div className={`relative bg-white border shadow-xs rounded-xl p-5 flex flex-col gap-4 pt-7 transition-all duration-200 hover:shadow-sm ${
      isProductDisabled ? 'border-l-4 border-l-red-500 bg-red-50/10' : 'border-gray-100 border-l-4 border-l-blue-500/90'
    }`}>
      
      {isUploading && (
        <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center rounded-xl">
          <span className="text-sm font-bold text-blue-600">Đang tải lên...</span>
          <span className="text-xs text-gray-500">Vui lòng chờ trong giây lát.</span>
        </div>
      )}

      {/* Floating Badge số thứ tự dòng */}
      <div className={`absolute -left-2.5 -top-2 w-5.5 h-5.5 text-white rounded-full flex items-center justify-center shadow-md z-10 text-[10px] font-bold ${
        isProductDisabled ? 'bg-gradient-to-tr from-red-600 to-red-500' : 'bg-gradient-to-tr from-blue-600 to-blue-500'
      }`}>
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
        
        {/* Dropdown Sản Phẩm In */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Sản phẩm</label>
            {/* Chú thích trạng thái khóa đồng bộ thời gian thực */}
            {isProductDisabled && (
              <span className="text-[11px] font-bold text-red-500 animate-pulse">
                ⚠️ Sản phẩm không hoạt động
              </span>
            )}
          </div>
          <select 
            value={product.productId || product.product_id || ''} 
            onChange={handleSelectProduct}
            disabled={isLoadingCatalog}
            className={`w-full h-9 px-3 border rounded-lg text-[12px] bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium cursor-pointer ${
              isProductDisabled ? 'border-red-300 text-red-700 bg-red-50/20' : 'border-gray-200 text-gray-700'
            }`}
          >
            <option value="" disabled>-- Vui lòng chọn sản phẩm cần in --</option>
            
            {/* Ghi vết an toàn: Nếu sản phẩm cũ bị khóa hoàn toàn khỏi danh mục trả về, tự sinh option ẩn để bảo toàn UI */}
            {isProductDisabled && (product.productId || product.product_id) && !catalog.some(item => String(item.id || item.product_id) === String(product.productId || product.product_id)) && (
              <option value={product.productId || product.product_id}>
                {product.name || 'Sản phẩm lưu vết cũ'} (Sản phẩm không hoạt động)
              </option>
            )}

            {catalog?.map(item => {
              const itemDisabled = String(item.isactive) === '0' || item.isactive === false || item.status === 'Khóa';
              return (
                <option key={item.id || item.product_id} value={item.id || item.product_id}>
                  {item.code ? `[${item.code}] ` : ''}{item.name || 'Sản phẩm không tên'}
                  {itemDisabled ? ' (Sản phẩm không hoạt động)' : ''}
                </option>
              );
            })}
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
            type="text" 
            value={product.appliedPriceDisplay !== undefined ? product.appliedPriceDisplay : formatCurrency(product.appliedPrice || product.applied_price || 0)}
            onChange={handleAppliedPriceChange}
            className="w-full h-9 px-3 border border-gray-200 rounded-lg text-[12px] font-bold text-blue-600 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" 
          />
        </div>
      </div>

      {/* Quản lý Đính Kèm Tệp Tin / Đường dẫn Drive */}
      <div className="flex flex-col gap-3">
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">File thiết kế</label>
        
        {/* Google Drive Link */}
        <div className="relative flex items-center gap-2">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path fill="#4285F4" d="M11.996 10.994l-5.498.002-2.999-5.25H9.497z" />
              <path fill="#34A853" d="M6.501 5.744l-2.999 5.251-2.5-4.329h5.499z" />
              <path fill="#FBBC04" d="M6.501 5.744L9.497.493 11.996 4.82h-5.495z" />
              <path fill="#EA4335" d="M12.496 11.411l2.502-4.33h-5.498l2.996 4.33z" />
              <path fill="none" d="M.002.493h15.996v15.023H.002z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Dán link Google Drive tại đây..."
            value={product.driveLink || ''}
            onChange={handleDriveLinkChange}
            className="flex-1 h-9 pl-9 pr-3 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-gray-700 data-all"
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