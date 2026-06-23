import Table from '../../../skeleton/Table';
import Button from '../../../skeleton/Button';
import { useNavigate } from 'react-router-dom';
import { ORDER_TABLE_HEADERS } from '../../../../constants/order';

const Tooltip = ({ content, children, className = "" }) => {
  if (!content || content === '---' || content === '-' || content === 'linkgoogledrive') {
    return <div className={`truncate w-full block ${className}`}>{children}</div>;
  }
  
  return (
    <div className={`group/tt relative w-full flex flex-col justify-center ${className}`}>
      <div className="truncate w-full block cursor-pointer">
        {children}
      </div>
      <div className="absolute z-[999] invisible opacity-0 group-hover/tt:visible group-hover/tt:opacity-100 transition-all duration-300 bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[280px] p-3 bg-[#191C1D] text-white text-xs font-normal rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] pointer-events-none whitespace-normal break-words leading-relaxed text-center">
        {content}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#191C1D] rotate-45 rounded-sm"></div>
      </div>
    </div>
  );
};

const OrderTable = ({ orders }) => {
  const navigate = useNavigate();
  
  const formatCurrency = (value) => {
    if (!value) return '0 đ';
    const amount = Math.floor(Number(value));
    return amount.toLocaleString('en-US') + ' đ';
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusBadgeClass = (statusName) => {
    const name = String(statusName || '').toUpperCase();
    if (name.includes('NHÁP')) return 'bg-gray-100 text-gray-600 border-gray-200';
    if (name.includes('XÁC NHẬN') || name.includes('MỚI')) return 'bg-amber-50 text-amber-600 border-amber-200';
    if (name.includes('CHỜ DUYỆT')) return 'bg-purple-50 text-purple-600 border-purple-200';
    if (name.includes('ĐÃ DUYỆT')) return 'bg-blue-50 text-blue-600 border-blue-200';
    if (name.includes('SẢN XUẤT')) return 'bg-indigo-50 text-indigo-600 border-indigo-200';
    if (name.includes('GIAO')) return 'bg-orange-50 text-orange-600 border-orange-200';
    if (name.includes('HOÀN THÀNH')) return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    if (name.includes('TỪ CHỐI') || name.includes('HUỶ')) return 'bg-rose-50 text-rose-600 border-rose-200';
    return 'bg-blue-50 text-blue-600 border-blue-100';
  };

  const getValidDriveLink = (url) => {
    if (!url || url === 'linkgoogledrive' || url === 'null') return '';
    const trimmed = String(url).trim();
    return (trimmed.startsWith('http://') || trimmed.startsWith('https://')) ? trimmed : `https://${trimmed}`;
  };

  return (
    <Table headers={ORDER_TABLE_HEADERS}>
      {orders.length === 0 ? (
        <tr>
          <td colSpan={ORDER_TABLE_HEADERS.length} className="py-6 text-center text-xs text-gray-400 whitespace-nowrap">
            Không tìm thấy dữ liệu đơn hàng phù hợp
          </td>
        </tr>
      ) : (
        orders.map((order) => {
          const {
            id, code, customer_fullname, totalitem, totalfile, totalprice,
            orderstatus_name, orderdate, createuser_fullname, linkgoogledrive
          } = order;
          const driveUrl = getValidDriveLink(linkgoogledrive);

          return (
            <tr key={id} className="hover:bg-gray-50/80 transition-colors text-center text-[#1E293B] border-b border-gray-100 whitespace-nowrap text-xs">
              
              {/* 🎯 Bóp chặt Mã đơn, ép căn giữa */}
              <td className="py-2.5 px-3 text-center min-w-[120px] max-w-[150px] relative">
                <Tooltip content={code}>
                  <span className="font-semibold text-blue-600 tracking-tight hover:text-[#0037B0] transition-colors">
                    {code || '-'}
                  </span>
                </Tooltip>
              </td>
              
              {/* 🎯 Căn giữa khách hàng */}
              <td className="py-2.5 px-3 text-center min-w-[140px] max-w-[180px] relative">
                <Tooltip content={customer_fullname}>
                  <span className="font-semibold text-blue-600 tracking-tight hover:text-[#0037B0] transition-colors">
                    {customer_fullname || '-'}
                  </span>
                </Tooltip>
              </td>
              
              <td className="py-2.5 px-3 text-gray-600 text-center min-w-[90px]">
                {totalitem ?? 0}
              </td>
              
              <td className="py-2.5 px-3 text-gray-600 text-center min-w-[90px]">
                {totalfile > 0 ? (
                  <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[10px]">
                    {totalfile} tệp
                  </span>
                ) : (
                  <span className="text-gray-300">-</span>
                )}
              </td>
              
              <td className="py-2.5 px-3 text-center min-w-[90px]">
                {driveUrl ? (
                  <a href={driveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1 text-blue-600 hover:underline">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                    <span className="font-medium">Mở</span>
                  </a>
                ) : <span className="text-gray-300">-</span>}
              </td>
              
              {/* Căn phải cho Giá */}
              <td className="py-2.5 px-3 font-bold text-[#1E293B] text-right min-w-[110px]">
                {formatCurrency(totalprice)}
              </td>
              
              <td className="py-2.5 px-3 min-w-[110px] text-center">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide border ${getStatusBadgeClass(orderstatus_name)}`}>
                  {orderstatus_name || '-'}
                </span>
              </td>
              
              <td className="py-2.5 px-3 text-gray-500 text-center min-w-[100px]">
                {formatDateDisplay(orderdate)}
              </td>
              
              <td className="py-2.5 px-3 text-gray-600 text-center min-w-[120px] max-w-[160px]">
                <Tooltip content={createuser_fullname}>
                  <span className="block truncate">{createuser_fullname || '-'}</span>
                </Tooltip>
              </td>
              
              <td className="py-2.5 px-3 min-w-[90px] text-center">
                <Button variant="text" onClick={() => navigate(`/orders/${id}`)} className="p-0 h-auto font-bold text-blue-600 hover:underline text-[12px]">
                  Chi tiết
                </Button>
              </td>
            </tr>
          );
        })
      )}
    </Table>
  );
};

export default OrderTable;