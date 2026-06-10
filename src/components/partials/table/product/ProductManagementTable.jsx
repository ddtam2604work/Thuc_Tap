import Table from '../../../skeleton/Table';
import { PRODUCT_TABLE_HEADERS } from '../../../../constants/product';
import Button from '../../../skeleton/Button';

// Component Tooltip custom cao cấp từ OrderTable (GIỮ NGUYÊN HOÀN TOÀN LOGIC)
const Tooltip = ({ content, children, className = "" }) => {
  if (!content || content === '---' || content === '-' || content === 'linkgoogledrive') {
    // 🎯 Loại bỏ w-full, dùng block kết hợp className có width cứng
    return <div className={`truncate block ${className}`}>{children}</div>;
  }
  
  return (
    <div className={`group/tt relative flex flex-col justify-center ${className}`}>
      <div className="truncate w-full block cursor-pointer">
        {children}
      </div>
      {/* 🎯 Trả Tooltip về neo góc trái (left-0) để đồng bộ tuyệt đối với text-left */}
      <div className="absolute z-[999] invisible opacity-0 group-hover/tt:visible group-hover/tt:opacity-100 transition-all duration-300 bottom-full left-0 mb-2 w-max max-w-[280px] p-3 bg-[#191C1D] text-white text-xs font-normal rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] pointer-events-none whitespace-normal break-words leading-relaxed text-left">
        {content}
        <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-[#191C1D] rotate-45 rounded-sm"></div>
      </div>
    </div>
  );
};

const ProductManagementTable = ({ data = [], categories = [], onEdit, onDelete, isLoading = false }) => {
  
  // HÀM BỌC LÓT GIAO DIỆN: Xử lý màu sắc và chữ cho Trạng thái (GIỮ NGUYÊN LOGIC)
  const getStatusLabel = (row) => {
    const isActive = (String(row.isactive) === '1' || row.isactive === true) || 
                     (String(row.status) === '1' || row.status === 'ACTIVE');

    if (isActive) {
      return { class: 'bg-[#DCFCE7] text-[#15803D]', text: 'HOẠT ĐỘNG' };
    } else {
      return { class: 'bg-[#FEE2E2] text-[#B91C1C]', text: 'NGỪNG KINH DOANH' };
    }
  };

  // HÀM DỊCH UUID THÀNH TÊN DANH MỤC (GIỮ NGUYÊN LOGIC)
  const getCategoryName = (row) => {
    if (typeof row.category_name === 'string') return row.category_name;
    if (typeof row.category === 'string') return row.category;
    if (row.productCategoryName) return row.productCategoryName;

    const catIdFromProduct = 
      row.productcategory_id || 
      row.category_id || 
      row.productCategoryId || 
      row.categoryId;

    if (!catIdFromProduct) return "Thiếu ID (Check lại API)";

    if (categories && categories.length > 0) {
      const found = categories.find(c => {
        const catIdFromList = String(c.id || c.productcategory_id || c.categoryId).trim().toLowerCase();
        const catIdFromProd = String(catIdFromProduct).trim().toLowerCase();
        
        return catIdFromList === catIdFromProd;
      });
      return found ? found.name : "Không khớp mã";
    }
    
    return "Đang tải...";
  };

  return (
    <Table headers={PRODUCT_TABLE_HEADERS}>
      {data.map((row, index) => {
        const statusObj = getStatusLabel(row);
        const rowKey = row.id || row.product_id || `fallback-${index}`;
        const currentCategoryName = getCategoryName(row);
        const currentDescription = row.desc || row.description;

        return (
          <tr key={rowKey} className="hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors text-xs">
            {/* Cột 1: Mã sản phẩm - Ép khung bảo vệ min-w-[120px] chống xâm lấn */}
            <td className="p-4 text-left text-[#191C1D] font-medium max-w-[120px]">
              <Tooltip content={row.code || row.id} className="w-full">
                <span className="font-medium text-[#191C1D]">
                  {row.code || row.id || '-'}
                </span>
              </Tooltip>
            </td>
            
            {/* Cột 2: Tên sản phẩm - Dùng w-[220px] cứng cho Tooltip để tạo vách ngăn tuyệt đối */}
            <td className="p-4 text-left text-slate-800 text-sm font-medium max-w-[220px]">
              <Tooltip content={row.name} className="w-full">
                <span className="font-bold">
                  {row.name || '-'}
                </span>
              </Tooltip>
            </td>
            
            {/* Cột 3: Tên Danh mục - Dùng w-[140px] cứng */}
            <td className="p-4 text-left text-[#585F67]">
              <Tooltip content={currentCategoryName} className="w-[140px]">
                <span className="text-[#585F67]">
                  {currentCategoryName}
                </span>
              </Tooltip>
            </td>
            
            {/* Cột 4: Giá bán - Khóa cứng min-w */}
            <td className="p-4 text-right text-[#191C1D] font-semibold whitespace-nowrap w-[130px] min-w-[130px]">
              {(Number(row.price) || 0).toLocaleString('vi-VN')} đ
            </td>
            
            {/* Cột 5: Mô tả - Dùng max-w-[160px] */}
            <td className="p-4 text-left text-[#747686] max-w-[160px]">
              <Tooltip content={currentDescription} className="w-[160px]">
                <span className="text-[#747686]">
                  {currentDescription || '---'}
                </span>
              </Tooltip>
            </td>
            
            {/* Cột 6: Trạng thái */}
            <td className="p-4 text-center whitespace-nowrap w-[150px] min-w-[150px]">
              <span className={`inline-flex px-2 py-0.5 rounded-[2px] text-[12px] font-semibold uppercase tracking-wider ${statusObj.class}`}>
                {statusObj.text}
              </span>
            </td>
            
            {/* Cột 7: Thao tác */}
            <td className="p-4 text-center whitespace-nowrap w-[100px] min-w-[100px]">
              <div className="flex items-center justify-center gap-3 font-semibold">
                <Button variant="text" onClick={() => onEdit?.(row)} disabled={isLoading} className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}>
                  {isLoading ? '⏳' : 'Sửa'}
                </Button>
                <span className="text-gray-300">|</span>
                <Button variant="text-danger" onClick={() => onDelete?.(row.id)} disabled={isLoading} className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}>
                  Xoá
                </Button>
              </div>
            </td>
          </tr>
        );
      })}
    </Table>
  );
};

export default ProductManagementTable;