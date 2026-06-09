import React from 'react';
// --- IMPORT HOOK CONFIRM DÙNG CHUNG ---
import { useConfirm } from '../../../../context/ConfirmContext';

const CustomerGroupTable = ({ groups = [], onEdit, onDelete }) => {
  // Sử dụng destructuring đúng cú pháp
  const { confirm } = useConfirm();

  // Hàm đánh chặn sự kiện xóa để yêu cầu xác nhận qua Promise Modal
  const handleDeleteClick = async (id) => {
    const isConfirmed = await confirm({
      title: 'Xác nhận xóa nhóm khách hàng',
      message: 'Bạn có chắc chắn muốn xóa nhóm khách hàng này không? Hành động này có thể ảnh hưởng đến bộ lọc dữ liệu liên quan.',
      confirmText: 'Đồng ý xóa',
      cancelText: 'Hủy bỏ',
      type: 'danger' // Chuyển nút bấm sang màu đỏ cảnh báo
    });

    // Nếu người dùng đồng ý mới kích hoạt hàm onDelete gốc từ component cha
    if (isConfirmed) {
      onDelete?.(id);
    }
  };

  return (
    <div className="w-full">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-600 font-semibold text-xs uppercase tracking-wider">
            <th className="py-3 px-4 text-center">STT</th>
            <th className="py-3 px-4">Tên nhóm</th>
            <th className="py-3 px-4">Ghi chú</th>
            <th className="py-3 px-4 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {groups.length > 0 ? (
            groups.map((group, index) => (
              <tr 
                key={group.id || `group-${index}`} 
                className="hover:bg-gray-50/40 transition-colors"
              >
                {/* STT */}
                <td className="py-3 px-4 text-center text-gray-600 font-medium">
                  {index + 1}
                </td>
                
                {/* Tên nhóm */}
                <td className="py-3 px-4">
                  <div className="font-semibold text-gray-900">{group.name}</div>
                </td>
                
                {/* Ghi chú */}
                <td className="py-3 px-4 text-gray-600">
                  <span title={group.description} className="truncate inline-block max-w-xs">
                    {group.description || <span className="text-gray-400">---</span>}
                  </span>
                </td>
                
                {/* Hành động */}
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => onEdit?.(group.id)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-1.5 py-1 rounded transition-all cursor-pointer"
                      title="Sửa"
                    >
                      Sửa
                    </button>
                    <span className="text-slate-200 select-none">|</span>
                    <button 
                      onClick={() => handleDeleteClick(group.id)} // Đổi từ onDelete sang handleDeleteClick
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 px-1.5 py-1 rounded transition-all cursor-pointer"
                      title="Xóa"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="py-10 text-center text-gray-400 text-xs">
                Không tìm thấy nhóm khách hàng nào khớp bộ lọc.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerGroupTable;