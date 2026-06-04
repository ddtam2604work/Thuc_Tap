import Table from '../../../skeleton/Table';
import Button from '../../../skeleton/Button';

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
            <td className="p-4 text-center text-sm font-mono text-gray-700">{row.code}</td>
            <td className="p-4 text-center text-[16px] font-bold text-[#2E478A]">{row.name}</td>
            <td className="p-4 text-center text-sm text-gray-500 max-w-xs truncate">{row.desc}</td>
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