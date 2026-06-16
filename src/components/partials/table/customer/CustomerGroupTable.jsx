import React from 'react';
import { useConfirm } from '../../../../context/ConfirmContext';
import Table from '../../../skeleton/Table';
import { CUSTOMER_GROUP_TABLE_HEADERS } from '../../../../constants/customer';

// 🎯 COMPONENT NÂNG CẤP: Bóng nổi (Tooltip) hiện đại, sang trọng
const Tooltip = ({ content, children, className = "" }) => {
  if (!content || content === '---' || content === '-') {
    return <div className={`truncate w-full block ${className}`}>{children}</div>;
  }
  
  return (
    <div className={`group/tt relative w-full flex flex-col justify-center ${className}`}>
      <div className="truncate w-full block cursor-pointer">
        {children}
      </div>
      
      <div className="absolute z-[999] invisible opacity-0 group-hover/tt:visible group-hover/tt:opacity-100 transition-all duration-300 bottom-full left-0 mb-2 w-max max-w-[280px] p-3 bg-[#191C1D] text-white text-xs font-normal rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] pointer-events-none whitespace-normal break-words leading-relaxed">
        {content}
        <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-[#191C1D] rotate-45 rounded-sm"></div>
      </div>
    </div>
  );
};

const CustomerGroupTable = ({ groups = [], isLoading = false, onEdit, onDelete }) => {
  const { confirm } = useConfirm();

  const handleDeleteClick = async (id) => {
    const isConfirmed = await confirm({
      title: 'Xác nhận xóa nhóm khách hàng',
      message: 'Bạn có chắc chắn muốn xóa nhóm khách hàng này không? Hành động này có thể ảnh hưởng đến bộ lọc dữ liệu liên quan.',
      confirmText: 'Đồng ý xóa',
      cancelText: 'Hủy bỏ',
      type: 'danger'
    });

    if (isConfirmed) {
      onDelete?.(id);
    }
  };

  return (
    <div className="w-full">
      <Table headers={CUSTOMER_GROUP_TABLE_HEADERS}>
        {isLoading ? (
          <tr>
            <td colSpan={CUSTOMER_GROUP_TABLE_HEADERS.length} className="py-10 text-center text-slate-400 font-medium">
              <span className="inline-block animate-pulse">⏳ Đang tải dữ liệu từ hệ thống...</span>
            </td>
          </tr>
        ) : groups.length === 0 ? (
          <tr>
            <td colSpan={CUSTOMER_GROUP_TABLE_HEADERS.length} className="py-16 text-center text-slate-400">
              <div className="text-4xl mb-2">📂</div>
              <p className="italic text-sm">Không tìm thấy nhóm khách hàng nào khớp bộ lọc.</p>
            </td>
          </tr>
        ) : (
          groups.map((group, index) => (
            <tr 
              key={group.id || `group-${index}`} 
              className="hover:bg-blue-50/40 transition-all duration-200 h-14 border-b border-slate-100/80 last:border-0 group"
            >
              <td className="px-2 py-3 text-center text-slate-400 text-sm max-w-0 relative">
                {index + 1}
              </td>
              
              <td className="px-2 py-3 text-left font-medium text-slate-800 text-sm max-w-0 relative">
                <Tooltip content={group.name}>
                  {group.name}
                </Tooltip>
              </td>
              
              <td className="px-2 py-3 text-left text-slate-500 text-sm italic max-w-0 relative">
                <Tooltip content={group.description}>
                  {group.description || <span className="text-gray-400">---</span>}
                </Tooltip>
              </td>
              
              <td className="px-2 py-3 text-center max-w-0 relative">
                <div className="flex items-center justify-center gap-3 text-[13px] font-semibold opacity-80 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEdit?.(group.id)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-1.5 py-1 rounded transition-all cursor-pointer"
                    title="Sửa"
                  >
                    Sửa
                  </button>
                  <span className="text-slate-200 select-none">|</span>
                  <button 
                    onClick={() => handleDeleteClick(group.id)}
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-1.5 py-1 rounded transition-all cursor-pointer"
                    title="Xóa"
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </Table>
    </div>
  );
};

export default CustomerGroupTable;