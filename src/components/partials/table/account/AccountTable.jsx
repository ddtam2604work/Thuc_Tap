import React from 'react'; 
import Table from '../../../skeleton/Table'; 
import Button from '../../../skeleton/Button'; 

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
        const isUserActive = String(acc.isactive) === "1" || acc.isactive === true;
        const targetId = acc.id || acc.user_id;
        const rowKey = targetId ? `row-${targetId}-${index}` : `fallback-${index}`;
        
        return (
          <tr key={rowKey} className="hover:bg-blue-50/20 transition-all duration-200 border-b border-gray-100 last:border-none">
            <td className="py-3 px-1.5 text-gray-400 text-center font-medium w-10">{index + 1}</td>
            <td className="py-3 px-2 text-center font-semibold text-[#1e293b] max-w-[120px] break-words">{acc.fullname || acc.username || '—'}</td>
            <td className="py-3 px-2 text-center text-[#64748b] font-mono text-[13px] max-w-[100px] break-all">{acc.username}</td>
            <td className="py-3 px-2 text-center text-[#64748b] text-[13px] max-w-[140px] break-all">{acc.email || '—'}</td>
            <td className="py-3 px-2 text-center text-[#64748b] text-[13px] whitespace-nowrap">{acc.phone || '—'}</td>
            
            <td className="py-3 px-2 text-center max-w-[120px]">
              <div className="flex flex-wrap justify-center gap-1">
                {getSafeRoles(acc).map((role, rIndex) => {
                  const safeId = role.id || role.code || role.roleCode || `r-${rIndex}`;
                  const safeName = role.name || role.roleName || String(role.code || '').toUpperCase();
                  
                  return (
                    <span 
                      key={`role-${safeId}-${rIndex}`} 
                      className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight rounded-md text-white shadow-sm" 
                      style={{ backgroundColor: role.color || '#64748b' }}
                    >
                      {safeName}
                    </span>
                  );
                })}
              </div>
            </td>
            
            <td className="py-3 px-2 text-center">
              <span className={`whitespace-nowrap px-2 py-0.5 rounded-full text-[11px] font-bold ${isUserActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isUserActive ? 'Hoạt động' : 'Đã khóa'}
              </span>
            </td>

            <td className="py-3 px-2 text-center text-[#64748b] text-[12px] max-w-[90px]">
              {formatLastLogin(acc.lastlogin)}
            </td>
            
            <td className="py-3 px-2 text-center w-[150px] max-w-[150px]">
              <div className="flex items-center justify-center gap-x-1 mx-auto">
                {/* 1. Nút Sửa */}
                <Button variant="text" className="text-blue-600 font-medium px-1 py-0.5 text-[13px] hover:bg-blue-50" onClick={() => onEdit(acc)}>Sửa</Button>
                
                {/* Thanh | thứ nhất */}
                <span className="text-gray-300 text-[12px] select-none">|</span>
                
                {/* 2. Nút Khóa / Mở Khóa */}
                <Button variant={isUserActive ? "text-danger" : "text"} className="font-medium px-1 py-0.5 text-[13px] hover:bg-gray-50" onClick={() => onLock(acc)}>
                  {isUserActive ? (
                    'Khoá'
                  ) : (
                    <span className="flex flex-col items-center justify-center leading-[14px]">
                      <span>Mở</span>
                      <span>Khóa</span>
                    </span>
                  )}
                </Button>
                
                {/* Thanh | thứ hai (Mới bổ sung đồng bộ) */}
                <span className="text-gray-300 text-[12px] select-none">|</span>
                                
                {/* 3. Nút Xóa (Đã loại bỏ border-l cũ) */}
                <Button variant="text-danger" className="font-medium px-1.5 py-0.5 text-[13px] hover:bg-red-50" onClick={() => onDelete(acc)}>
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