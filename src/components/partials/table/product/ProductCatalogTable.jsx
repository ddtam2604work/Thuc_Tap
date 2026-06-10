import Table from '../../../skeleton/Table';
import Button from '../../../skeleton/Button';

// Component Tooltip hiển thị nội dung dài khi di chuột vào (Hover)
const Tooltip = ({ content, children, className = "" }) => {
  if (!content || content === '---' || content === '-' || content === 'linkgoogledrive') {
    return <div className={`truncate block ${className}`}>{children}</div>;
  }
  
  return (
    <div className={`group/tt relative flex flex-col justify-center ${className}`}>
      <div className="truncate w-full block cursor-pointer">
        {children}
      </div>
      <div className="absolute z-[999] invisible opacity-0 group-hover/tt:visible group-hover/tt:opacity-100 transition-all duration-300 bottom-full left-0 mb-2 w-max max-w-[280px] p-3 bg-[#191C1D] text-white text-xs font-normal rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] pointer-events-none whitespace-normal break-words leading-relaxed text-left">
        {content}
        <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-[#191C1D] rotate-45 rounded-sm"></div>
      </div>
    </div>
  );
};

const ProductCatalogTable = ({ data, onEdit, onDelete }) => {
  const headers = ["Mã DM", "Tên danh mục", "Mô tả", "Số Sản phẩm", "Trạng thái", "Thao tác"];

  return (
    <Table headers={headers}>
      {data.map((row) => {
        // 🎯 LOGIC MỚI: Kiểm tra trực tiếp biến isactive thay vì status
        // Bọc lót thêm trường hợp Backend trả về chuỗi '1' hoặc boolean true để chống sập UI
        const isActive = row.isactive === 1 || String(row.isactive) === '1' || row.isactive === true;

        return (
          <tr key={row.id || row.code} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
            <td className="p-4 text-center text-sm font-mono text-gray-700 max-w-[120px]">
              <Tooltip content={row.code} className="w-full">
                <span>{row.code}</span>
              </Tooltip>
            </td>
            
            <td className="p-4 text-left max-w-[180px]">
              <Tooltip content={row.name} className="w-full">
                <span className="text-sm font-semibold text-gray-900">{row.name}</span>
              </Tooltip>
            </td>
            
            <td className="p-4 text-left text-sm text-gray-500 max-w-[250px]">
              <Tooltip content={row.desc} className="w-[250px]">
                {row.desc || '-'}
              </Tooltip>
            </td>
            
            <td className="p-4 text-center text-sm text-gray-700 font-semibold">{row.count}</td>
            
            {/* 🎯 CẬP NHẬT GIAO DIỆN CỘT TRẠNG THÁI */}
            <td className="p-4 text-center">
              <span className={`inline-block px-3 py-1 rounded text-[11px] font-bold uppercase
                ${isActive ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEE2E2] text-[#B91C1C]'}`}>
                {isActive ? 'Hoạt động' : 'Khoá'}
              </span>
            </td>
            
            <td className="p-4 text-center">
              <div className="flex items-center justify-center gap-3 text-xs font-semibold">
                <Button variant="text" onClick={() => onEdit?.(row)}>
                  Sửa
                </Button>
                <span className="text-gray-300">|</span>
                <Button variant="text-danger" onClick={() => onDelete?.(row.id)}>
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

export default ProductCatalogTable;