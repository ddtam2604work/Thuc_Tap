// =========================================================================
// FILE: src/pages/Customer/CustomerPage.jsx
// =========================================================================
import { useState, useEffect } from 'react'; // BỔ SUNG: useEffect
import { useLocation } from 'react-router-dom'; // BỔ SUNG: useLocation
import CustomerGroup from './CustomerGroup';
import CustomerList from './CustomerList';
import { CUSTOMER_TABS } from '../../constants/customer';
import clsx from 'clsx';

const CustomerPage = () => {
  const [activeTab, setActiveTab] = useState(CUSTOMER_TABS.GROUP);
  const location = useLocation(); // BỔ SUNG: Lấy thông tin trạng thái route chuyển tiếp

  // 🎯 BỔ SUNG: Tự động chuyển đổi tab sang "Khách hàng" nếu có yêu cầu mở modal từ Trang chủ
  useEffect(() => {
    if (location.state?.openAddModal) {
      setActiveTab(CUSTOMER_TABS.CUSTOMER);
    }
  }, [location.state]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Page Header Area */}
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold tracking-tight text-[#191C1D] sm:text-2xl">
          Quản lý Khách hàng
        </h1>

        {/* Tối ưu khoảng cách thanh Tab điều hướng */}
        <div className="flex w-full gap-6 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab(CUSTOMER_TABS.GROUP)}
            className={clsx(
              "flex items-center gap-2 pb-2 text-[14px] font-semibold border-b-2 transition-all cursor-pointer relative top-[1px]",
              activeTab === CUSTOMER_TABS.GROUP
                ? "border-[#007BFF] text-[#007BFF]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <span>👥</span> Nhóm Khách hàng
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(CUSTOMER_TABS.CUSTOMER)}
            className={clsx(
              "flex items-center gap-2 pb-2 text-[14px] font-semibold border-b-2 transition-all cursor-pointer relative top-[1px]",
              activeTab === CUSTOMER_TABS.CUSTOMER
                ? "border-[#007BFF] text-[#007BFF]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <span>👤</span> Khách hàng
          </button>
        </div>
      </div>

      {/* Render mô-đun biệt lập */}
      <div className="w-full transition-all duration-300">
        {activeTab === CUSTOMER_TABS.GROUP ? <CustomerGroup /> : <CustomerList />}
      </div>
    </div>
  );
};

export default CustomerPage;