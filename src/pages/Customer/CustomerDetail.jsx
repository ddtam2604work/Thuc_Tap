import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import CustomerDetailTable from '../../components/partials/table/customer/CustomerDetailTable';
import clsx from 'clsx';

const SUB_TABS = {
  INFO: 'INFO',
  HISTORY: 'HISTORY',
  DEBT: 'DEBT'
};

const CustomerDetail = ({ isOpen, customer, onClose }) => {
  const [activeSubTab, setActiveSubTab] = useState(SUB_TABS.INFO);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !customer) return null;

  // Lấy ký tự đầu cho Avatar
  const getInitials = (name) => {
    if (!name) return 'KH';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Mock dữ liệu chi tiết đơn hàng phục vụ kết xuất CustomerDetailTable
  const mockOrderHistory = [
    { id: 1, orderId: 'DH-2026-001', date: '12/03/2026', amount: '15.500.000đ' },
    { id: 2, orderId: 'DH-2026-042', date: '05/04/2026', amount: '30.000.000đ' },
  ];

  const mockDebtHistory = [
    { id: 1, period: 'Kỳ tháng 03/2026', incurred: '+15.500.000đ', balance: '0đ' },
    { id: 2, period: 'Kỳ tháng 04/2026', incurred: '+30.000.000đ', balance: '5.800.000đ' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-inter">
      {/* Backdrop mờ nền sau */}
      <div 
        className="absolute inset-0 bg-black/15 backdrop-blur-[1px] transition-opacity animate-fade-in cursor-pointer"
        onClick={onClose}
      />

      {/* Khung Drawer trượt từ phải sang (Chiều rộng compact 420px đúng tỉ lệ UX) */}
      <div className="relative w-full max-w-[420px] h-full bg-white shadow-2xl flex flex-col border-l border-gray-100 z-10 animate-slide-in-right">
        
        {/* Header Drawer */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <h3 className="text-sm font-bold text-gray-800">Chi tiết khách hàng</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        {/* Cấu trúc Menu Tab phụ */}
        <div className="flex px-4 bg-white border-b border-gray-100 text-xs font-semibold">
          {Object.entries({
            [SUB_TABS.INFO]: 'Thông tin',
            [SUB_TABS.HISTORY]: 'Lịch sử đơn',
            [SUB_TABS.DEBT]: 'Công nợ'
          }).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveSubTab(key)}
              className={clsx(
                "flex-1 text-center py-2.5 border-b-2 transition-all cursor-pointer relative top-[1px]",
                activeSubTab === key ? "border-[#0037B0] text-[#0037B0]" : "border-transparent text-gray-400 hover:text-gray-600"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Nội dung chi tiết cuộn độc lập */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 bg-gray-50/30">
          
          {/* TAB 1: THÔNG TIN CƠ BẢN */}
          {activeSubTab === SUB_TABS.INFO && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center justify-center gap-1.5 py-5 bg-white border border-gray-100 rounded-lg shadow-2xs relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0037B0] to-[#0052FF] rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md select-none border-2 border-white ring-2 ring-gray-50">
                  {getInitials(customer.name)}
                </div>
                <div className="mt-1 flex flex-col items-center">
                  <h4 className="text-base font-bold text-[#191C1D] tracking-tight">{customer.name}</h4>
                  {customer.studioname && (
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                      🏠 {customer.studioname}
                    </span>
                  )}
                </div>
                <span className={clsx(
                  "mt-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border",
                  customer.status === 'ACTIVE' 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                    : "bg-rose-50 text-rose-700 border-rose-200"
                )}>
                  {customer.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động'}
                </span>
              </div>

              <div className="bg-white border border-gray-100 rounded-lg p-3 flex flex-col divide-y divide-gray-50 text-xs shadow-2xs">
                <div className="py-2.5 flex justify-between gap-4"><span className="text-gray-400">Tên khách hàng</span><span className="font-semibold text-gray-800 text-right">{customer.name}</span></div>
                <div className="py-2.5 flex justify-between gap-4"><span className="text-gray-400">Số điện thoại</span><span className="font-medium text-gray-700 text-right">{customer.phone}</span></div>
                <div className="py-2.5 flex justify-between gap-4"><span className="text-gray-400">Email</span><span className="text-gray-600 text-right break-all max-w-[200px]">{customer.email}</span></div>
                <div className="py-2.5 flex justify-between gap-4"><span className="text-gray-400">Địa chỉ</span><span className="text-gray-600 text-right">{customer.address}</span></div>
                <div className="py-2.5 flex justify-between gap-4"><span className="text-gray-400">Tổng tiền đơn</span><span className="text-[#0037B0] font-bold text-right">45.500.000đ</span></div>
                <div className="py-2.5 flex justify-between gap-4"><span className="text-gray-400">Công nợ hiện tại</span><span className="text-red-600 font-bold text-right">5.800.000đ</span></div>
                <div className="py-2.5 flex justify-between gap-4"><span className="text-gray-400">Ngày đăng ký</span><span className="text-gray-600 text-right">15/3/2026</span></div>
              </div>
            </div>
          )}

          {/* TAB 2: LỊCH SỬ ĐƠN HÀNG (Nhúng CustomerDetailTable) */}
          {activeSubTab === SUB_TABS.HISTORY && (
            <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-2xs">
              <CustomerDetailTable 
                headers={['STT', 'Mã đơn hàng', 'Ngày đặt', 'Giá trị']} 
                data={mockOrderHistory}
                type="history"
              />
            </div>
          )}

          {/* TAB 3: ĐỐI SOÁT CÔNG NỢ (Nhúng CustomerDetailTable) */}
          {activeSubTab === SUB_TABS.DEBT && (
            <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-2xs">
              <CustomerDetailTable 
                headers={['STT', 'Giai đoạn', 'Phát sinh', 'Dư nợ']} 
                data={mockDebtHistory}
                type="debt"
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

CustomerDetail.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  customer: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    address: PropTypes.string,
    status: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

export default CustomerDetail;