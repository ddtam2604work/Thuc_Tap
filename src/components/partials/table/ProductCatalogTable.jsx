import Table from '../../skeleton/Table';

const ProductCatalogTable = ({ data, onEdit, onDelete }) => {
  // Tiêu đề cột chính xác theo hình
  const headers = ["Mã DM", "Tên danh mục", "Mô tả", "Số Sản phẩm", "Trạng thái", "Thao tác"];

  return (
    <Table headers={headers}>
      {data.map((row) => (
        <tr key={row.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
          <td className="p-4 text-center text-sm text-gray-700">{row.id}</td>
          <td className="p-4 text-center text-[16px] font-bold text-[#2E478A]">{row.name}</td>
          <td className="p-4 text-center text-sm text-gray-500">{row.desc}</td>
          <td className="p-4 text-center text-sm text-gray-700">{row.count}</td>
          <td className="p-4 text-center">
            <span className={`px-3 py-1 rounded text-[11px] font-bold uppercase
              ${row.status === 'ACTIVE' ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEE2E2] text-[#B91C1C]'}`}>
              {row.status === 'ACTIVE' ? 'Hoạt động' : 'Khoá'}
            </span>
          </td>
          <td className="p-4 text-center">
            <div className="flex items-center justify-center gap-3 text-xs font-semibold">
              <button 
                onClick={() => onEdit?.(row)}
                className="text-[#007BFF] hover:underline transition-colors"
              >
                Sửa
              </button>
              <span className="text-gray-300">|</span>
              <button 
                onClick={() => onDelete?.(row.id)}
                className="text-red-500 hover:underline transition-colors"
              >
                Xoá
              </button>
            </div>
          </td>
        </tr>
      ))}
    </Table>
  );
};

export default ProductCatalogTable;