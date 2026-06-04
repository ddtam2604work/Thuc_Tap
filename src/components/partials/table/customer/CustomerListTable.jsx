import Table from '../../../skeleton/Table';
import { CUSTOMER_TABLE_HEADERS } from '../../../../constants/customer';

// 🎯 COMPONENT NÂNG CẤP: Bóng nổi (Tooltip) hiện đại, sang trọng
const Tooltip = ({ content, children, className = "" }) => {
  // Nếu không có dữ liệu, chỉ render nội dung thường bị cắt (truncate)
  if (!content || content === '---' || content === '-') {
    return <div className={`truncate w-full block ${className}`}>{children}</div>;
  }
  
  return (
    <div className={`group/tt relative w-full flex flex-col justify-center ${className}`}>
      {/* Vùng hiển thị chữ mặc định (bị cắt ...) */}
      <div className="truncate w-full block cursor-pointer">
        {children}
      </div>
      
      {/* 🌟 Vùng Tooltip nổi lên khi Hover */}
      <div className="absolute z-[999] invisible opacity-0 group-hover/tt:visible group-hover/tt:opacity-100 transition-all duration-300 bottom-full left-0 mb-2 w-max max-w-[280px] p-3 bg-[#191C1D] text-white text-xs font-normal rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] pointer-events-none whitespace-normal break-words leading-relaxed">
        {content}
        {/* Mũi tên chỉ xuống */}
        <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-[#191C1D] rotate-45 rounded-sm"></div>
      </div>
    </div>
  );
};

const CustomerListTable = ({ customers = [], isLoading = false, onViewDetail, onEdit, onDelete }) => {
  
  const getStatusBadge = (isactive) => {
    if (Number(isactive) === 1 || isactive === true) {
      return { class: 'bg-emerald-50 text-emerald-600 border-emerald-200', text: 'Hoạt động' };
    }
    return { class: 'bg-rose-50 text-rose-600 border-rose-200', text: 'Ngừng hoạt động' };
  };

  const getPortalBadge = (isportal) => {
    if (Number(isportal) === 1 || isportal === true) {
      return { class: 'bg-indigo-50 text-indigo-600 border-indigo-200', text: 'Có' };
    }
    return { class: 'bg-slate-50 text-slate-500 border-slate-200', text: 'Không' };
  };

  return (
    <div className="w-full">
      <Table headers={CUSTOMER_TABLE_HEADERS}>
        {isLoading ? (
          <tr>
            <td colSpan={CUSTOMER_TABLE_HEADERS.length} className="py-10 text-center text-slate-400 font-medium">
              <span className="inline-block animate-pulse">⏳ Đang tải dữ liệu từ hệ thống...</span>
            </td>
          </tr>
        ) : customers.length === 0 ? (
          <tr>
            <td colSpan={CUSTOMER_TABLE_HEADERS.length} className="py-16 text-center text-slate-400">
              <div className="text-4xl mb-2">📂</div>
              <p className="italic text-sm">Không tìm thấy dữ liệu khách hàng phù hợp.</p>
            </td>
          </tr>
        ) : (
          customers.map((row, index) => {
            const statusBadge = getStatusBadge(row.isactive);
            const portalBadge = getPortalBadge(row.isportal);

            return (
              <tr 
                key={row.id || `cust-${index}`} 
                className="hover:bg-blue-50/40 transition-all duration-200 h-14 border-b border-slate-100/80 last:border-0 group"
              >
                <td className="px-2 py-3 text-center text-slate-400 text-sm max-w-0 relative">{index + 1}</td>
                
                {/* 1. TÊN & STUDIO */}
                <td className="px-2 py-3 text-left font-medium text-slate-800 text-sm max-w-0 relative">
                  <Tooltip content={row.fullname || row.name}>
                    <span 
                      className="hover:text-[#0037B0] hover:underline transition-colors font-bold cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (typeof onViewDetail === 'function') onViewDetail(row);
                      }}
                    >
                      {row.fullname || row.name}
                    </span>
                  </Tooltip>
                  {row.studioname && (
                    <Tooltip content={`Tên Studio: ${row.studioname}`} className="mt-0.5">
                      <span className="text-[11px] font-normal text-slate-400">🏠 {row.studioname}</span>
                    </Tooltip>
                  )}
                </td>
                
                <td className="px-2 py-3 text-center text-slate-600 text-sm font-mono max-w-0 relative">
                  <div className="truncate w-full block">{row.phone}</div>
                </td>
                
                {/* 2. EMAIL */}
                <td className="px-2 py-3 text-left text-slate-500 text-sm max-w-0 relative">
                  <Tooltip content={row.email}>
                    {row.email}
                  </Tooltip>
                </td>
                
                {/* 3. ĐỊA CHỈ */}
                <td className="px-2 py-3 text-left text-slate-500 text-sm max-w-0 relative">
                  <Tooltip content={row.address}>
                    {row.address || '---'}
                  </Tooltip>
                </td>
                
                {/* 4. NHÓM */}
                <td className="px-2 py-3 text-center max-w-0 relative">
                  <Tooltip content={row.category_name}>
                    <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-[#0037B0]/5 text-[#0037B0] border border-[#0037B0]/10">
                      {row.category_name || 'Khách lẻ'}
                    </span>
                  </Tooltip>
                </td>
                
                {/* 5. GHI CHÚ */}
                <td className="px-2 py-3 text-left text-slate-400 text-sm italic max-w-0 relative">
                  <Tooltip content={row.description}>
                    {row.description || '-'}
                  </Tooltip>
                </td>
                
                <td className="px-2 py-3 text-center max-w-0 relative">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${portalBadge.class}`}>
                    {portalBadge.text}
                  </span>
                </td>
                
                <td className="px-2 py-3 text-center max-w-0 relative">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge.class}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${Number(row.isactive) === 1 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    {statusBadge.text}
                  </span>
                </td>
                
                {/* 🎯 Đã sửa lại comment chuẩn của JSX và truyền trọn vẹn đối tượng row */}
                <td className="px-2 py-3 text-center max-w-0 relative">
                  <div className="flex items-center justify-center gap-3 text-[13px] font-semibold opacity-80 group-hover:opacity-100 transition-opacity">
                    <button 
                      type="button"
                      onClick={() => onEdit?.(row)} 
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-1.5 py-1 rounded transition-all cursor-pointer"
                    >
                      Sửa
                    </button>
                    <span className="text-slate-200 select-none">|</span>
                    <button 
                      type="button"
                      onClick={() => onDelete?.(row.id, row.fullname || row.name)} 
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-1.5 py-1 rounded transition-all cursor-pointer"
                    >
                      Xoá
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </Table>
    </div>
  );
};

export default CustomerListTable;