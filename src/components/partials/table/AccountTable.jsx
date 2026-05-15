import Table from '../../skeleton/Table'; // Sử dụng skeleton table dùng chung
import { ACCOUNT_STATUS, ACCOUNT_ROLES } from '../../../constants/account';

const AccountTable = ({ accounts, onEdit, onLock }) => {
  // Định nghĩa danh sách tiêu đề bảng khớp với Hình 3
  const headers = [
    'STT', 
    'Họ tên', 
    'Username', 
    'Email', 
    'Số điện thoại', 
    'Nhóm quyền', 
    'Trạng thái', 
    'Đăng nhập gần nhất', 
    'Thao tác'
  ];

  return (
    <Table headers={headers}>
      {accounts.map((acc, index) => (
        <tr key={acc.id} className="hover:bg-blue-50/20 transition-all duration-200 group">
          {/* Cột STT */}
          <td className="p-4 text-gray-400 text-center font-medium">{index + 1}</td>
          
          {/* Cột Họ tên - Font đậm tạo điểm nhấn */}
          <td className="p-4 text-center font-semibold text-[#1e293b]">{acc.name}</td>
          
          {/* Các cột thông tin phụ - Sử dụng font text-gray-500/600 */}
          <td className="p-4 text-center text-[#64748b] font-mono text-[13px]">{acc.username}</td>
          <td className="p-4 text-center text-[#64748b] text-[13px]">{acc.email}</td>
          <td className="p-4 text-center text-[#64748b] text-[13px]">{acc.phone}</td>
          
          {/* Cột Nhóm quyền - Sử dụng Badge theo variant từ Constants */}
          <td className="p-4 text-center">
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${ACCOUNT_ROLES[acc.role]?.color}`}>
              {ACCOUNT_ROLES[acc.role]?.label}
            </span>
          </td>
          
          {/* Cột Trạng thái - Badge dạng Pill (viên thuốc) */}
          <td className="p-4 text-center">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${ACCOUNT_STATUS[acc.status]?.color}`}>
              {ACCOUNT_STATUS[acc.status]?.label}
            </span>
          </td>

          {/* Cột Đăng nhập gần nhất (Dữ liệu bổ sung theo Hình 3) */}
          <td className="p-4 text-center text-[#64748b] text-[12px]">
            {acc.lastLogin || 'Chưa có dữ liệu'}
          </td>
          
          {/* Cột Thao tác - Nơi chứa sự kiện onClick cho nút Sửa */}
          <td className="p-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <button 
                // Quan trọng: Gọi hàm callback onEdit và truyền object account hiện tại
                onClick={() => onEdit(acc)}
                className="text-blue-600 hover:text-blue-800 font-bold text-[13px] transition-colors"
              >
                Sửa
              </button>
              <button 
                onClick={() => onLock(acc)} // Gọi hàm onLock truyền từ Page
                className="text-gray-500 hover:text-red-500 font-bold text-[13px] transition-colors"
              >
                Khoá
              </button>
              <button className="text-gray-400 hover:text-gray-600 text-[10px] leading-tight font-medium border-l pl-3 border-gray-200">
                Reset <br/> MK
              </button>
            </div>
          </td>
        </tr>
      ))}
    </Table>
  );
};

export default AccountTable;