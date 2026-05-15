import Table from '../../skeleton/Table';
import { STATUS_LABELS, PRODUCT_TABLE_HEADERS } from '../../../constants/product';

const ProductManagementTable = ({ data, onEdit, onDelete }) => {
  return (
    <Table headers={PRODUCT_TABLE_HEADERS}>
      {data.map((row) => (
        <tr key={row.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors">
          <td className="p-4 text-center text-[#191C1D]">{row.id}</td>
          <td className="p-4 text-center font-medium text-[#191C1D]">{row.name}</td>
          <td className="p-4 text-center text-[#585F67]">{row.category}</td>
          <td className="p-4 text-center text-[#191C1D] font-semibold">{row.price}đ</td>
          <td className="p-4 text-center text-[#747686]">{row.desc}</td>
          <td className="p-4 text-center">
            <span className={`inline-flex px-2 py-0.5 rounded-[2px] text-[12px] font-semibold uppercase tracking-wider ${STATUS_LABELS[row.status].class}`}>
              {STATUS_LABELS[row.status].text}
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

export default ProductManagementTable;