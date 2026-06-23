import Table from '../../../skeleton/Table';
import { PRODUCT_TABLE_HEADERS } from '../../../../constants/product';
import Button from '../../../skeleton/Button';

const Tooltip = ({ content, children, className = "" }) => {
  if (!content || content === '---' || content === '-' || content === 'linkgoogledrive') {
    return <div className={`truncate block ${className}`}>{children}</div>;
  }
  
  return (
    <div className={`group/tt relative flex flex-col justify-center ${className}`}>
      <div className="truncate w-full block cursor-pointer">
        {children}
      </div>
      <div className="absolute z-[999] invisible opacity-0 group-hover/tt:visible group-hover/tt:opacity-100 transition-all duration-300 bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[280px] p-3 bg-[#191C1D] text-white text-xs font-normal rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] pointer-events-none whitespace-normal break-words leading-relaxed text-center">
        {content}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#191C1D] rotate-45 rounded-sm"></div>
      </div>
    </div>
  );
};

const ProductManagementTable = ({ data = [], categories = [], onEdit, onDelete, isLoading = false }) => {
  
  const getStatusLabel = (row) => {
    const isActive = (String(row.isactive) === '1' || row.isactive === true) || 
                     (String(row.status) === '1' || row.status === 'ACTIVE');

    if (isActive) {
      return { class: 'bg-[#DCFCE7] text-[#15803D]', text: 'HOẠT ĐỘNG' };
    } else {
      return { class: 'bg-[#FEE2E2] text-[#B91C1C]', text: 'NGỪNG KINH DOANH' };
    }
  };

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
            {/* 🎯 Đổi text-left thành text-center, thu hẹp min-w */}
            <td className="p-4 text-center text-[#191C1D] font-medium min-w-[100px] max-w-[150px]">
              <Tooltip content={row.code || row.id} className="w-full">
                <span className="font-medium text-[#191C1D]">
                  {row.code || row.id || '-'}
                </span>
              </Tooltip>
            </td>
            
            {/* 🎯 Tương tự, căn giữa và giới hạn độ rộng tối đa */}
            <td className="p-4 text-center text-slate-800 text-sm font-medium min-w-[120px] max-w-[180px]">
              <Tooltip content={row.name} className="w-full">
                <span className="font-bold">
                  {row.name || '-'}
                </span>
              </Tooltip>
            </td>
            
            <td className="p-4 text-center text-[#585F67] min-w-[100px] max-w-[130px]">
              <Tooltip content={currentCategoryName} className="w-full">
                <span className="text-[#585F67]">
                  {currentCategoryName}
                </span>
              </Tooltip>
            </td>
            
            {/* DUY NHẤT cột giá giữ text-right */}
            <td className="p-4 text-right text-[#191C1D] font-semibold whitespace-nowrap min-w-[120px]">
              {(Number(row.price) || 0).toLocaleString('en-US')} đ
            </td>
            
            <td className="p-4 text-center text-[#747686] min-w-[120px] max-w-[160px]">
              <Tooltip content={currentDescription} className="w-full">
                <span className="text-[#747686]">
                  {currentDescription || '---'}
                </span>
              </Tooltip>
            </td>
            
            <td className="p-4 text-center whitespace-nowrap min-w-[130px]">
              <span className={`inline-flex px-2 py-0.5 rounded-[2px] text-[12px] font-semibold uppercase tracking-wider ${statusObj.class}`}>
                {statusObj.text}
              </span>
            </td>
            
            <td className="p-4 text-center whitespace-nowrap min-w-[100px]">
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