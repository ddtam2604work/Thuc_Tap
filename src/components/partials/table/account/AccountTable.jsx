import React from 'react'; // Bổ sung import React để đảm bảo tính tương thích
import Table from '../../../skeleton/Table'; // SỬA LỖI ĐƯỜNG DẪN: Lùi 2 cấp để vào đúng thư mục skeleton
import Button from '../../../skeleton/Button'; // SỬA LỖI ĐƯỜNG DẪN

// SỬA LỖI CHÍ MẠNG: Gán giá trị mặc định accounts = [] để tránh crash ứng dụng khi API chưa tải xong
const AccountTable = ({ accounts = [], onEdit, onLock, onDelete }) => {
  const headers = ['STT', 'Họ tên', 'Username', 'Email', 'Số điện thoại', 'Nhóm quyền', 'Trạng thái', 'Đăng nhập gần nhất', 'Thao tác'];

  const formatLastLogin = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch (e) {
      return '—';
    }
  };

  // Hàm chuẩn hóa dữ liệu Role "bất tử" - Giữ nguyên logic bọc lót của bạn
  const getSafeRoles = (acc) => {
    if (Array.isArray(acc.roles) && acc.roles.length > 0) {
      return acc.roles.map(r => typeof r === 'string' ? { name: r, code: r } : r);
    }
    if (acc.role && typeof acc.role === 'string') {
      return [{ name: acc.role, code: acc.role }];
    }
    if (acc.role && typeof acc.role === 'object') {
      return [acc.role];
    }
    return [];
  };

  return (
    <Table headers={headers}>
      {accounts.map((acc, index) => {
        // Logic kiểm tra trạng thái hoạt động
        const isUserActive = String(acc.isactive) === "1" || acc.isactive === true;
        
        // BỌC LÓT KEY: Đã giữ nguyên cơ chế chống sập khi Backend trả về 2 user trùng ID
        const targetId = acc.id || acc.user_id;
        const rowKey = targetId ? `row-${targetId}-${index}` : `fallback-${index}`;
        
        return (
          <tr key={rowKey} className="hover:bg-blue-50/20 transition-all duration-200 border-b border-gray-100 last:border-none">
            <td className="p-4 text-gray-400 text-center font-medium">{index + 1}</td>
            <td className="p-4 text-center font-semibold text-[#1e293b]">{acc.fullname || acc.username || '—'}</td>
            <td className="p-4 text-center text-[#64748b] font-mono text-[13px]">{acc.username}</td>
            <td className="p-4 text-center text-[#64748b] text-[13px]">{acc.email || '—'}</td>
            <td className="p-4 text-center text-[#64748b] text-[13px]">{acc.phone || '—'}</td>
            
            <td className="p-4 text-center">
              <div className="flex flex-wrap justify-center gap-1">
                {getSafeRoles(acc).map((role, rIndex) => {
                  const safeId = role.id || role.code || role.roleCode || `r-${rIndex}`;
                  const safeName = role.name || role.roleName || String(role.code || '').toUpperCase();
                  
                  return (
                    <span 
                      key={`role-${safeId}-${rIndex}`} 
                      className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight rounded-md text-white shadow-sm" 
                      style={{ backgroundColor: role.color || '#64748b' }}
                    >
                      {safeName}
                    </span>
                  );
                })}
              </div>
            </td>
            
            <td className="p-4 text-center">
              <span className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-bold ${isUserActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isUserActive ? 'Hoạt động' : 'Đã khóa'}
              </span>
            </td>

            <td className="p-4 text-center text-[#64748b] text-[12px] whitespace-nowrap">
              {formatLastLogin(acc.lastlogin)}
            </td>
            
            <td className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Button variant="text" className="text-blue-600 font-medium px-2 hover:bg-blue-50" onClick={() => onEdit(acc)}>Sửa</Button>
                
                <Button variant={isUserActive ? "text-danger" : "text"} className="font-medium px-2 hover:bg-gray-50" onClick={() => onLock(acc)}>
                  {isUserActive ? 'Khoá' : 'Mở Khoá'}
                </Button>
                                
                <Button variant="text-danger" className="font-medium px-2 hover:bg-red-50 border-l border-gray-200" onClick={() => onDelete(acc)}>
                  Xóa
                </Button>
              </div>
            </td>
          </tr>
        );
      })}
    </Table>
  );
};

export default AccountTable;