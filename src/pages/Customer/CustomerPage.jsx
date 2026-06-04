import { useState } from 'react';
import CustomerGroup from './CustomerGroup';
import CustomerList from './CustomerList';
import { CUSTOMER_TABS } from '../../constants/customer';
import clsx from 'clsx';

const CustomerPage = () => {
  const [activeTab, setActiveTab] = useState(CUSTOMER_TABS.GROUP);

  return (
    // Tinh chỉnh max-width và padding tổng thể để giao diện gọn gàng, vừa vặn tầm mắt
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-5 font-inter text-[#191C1D] p-4 sm:p-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#191C1D] sm:text-2xl">
          Quản lý Khách hàng
        </h1>
      </div>

      {/* Tối ưu khoảng cách thanh Tab điều hướng */}
      <div className="flex gap-6 border-b border-[#C4C5D7]">
        <button
          type="button"
          onClick={() => setActiveTab(CUSTOMER_TABS.GROUP)}
          className={clsx(
            "pb-2 text-sm font-semibold border-b-2 transition-all cursor-pointer relative top-[1px]",
            activeTab === CUSTOMER_TABS.GROUP
              ? "border-[#0037B0] text-[#0037B0]"
              : "border-transparent text-gray-500 hover:text-[#0037B0]"
          )}
        >
          Nhóm Khách hàng
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(CUSTOMER_TABS.CUSTOMER)}
          className={clsx(
            "pb-2 text-sm font-semibold border-b-2 transition-all cursor-pointer relative top-[1px]",
            activeTab === CUSTOMER_TABS.CUSTOMER
              ? "border-[#0037B0] text-[#0037B0]"
              : "border-transparent text-gray-500 hover:text-[#0037B0]"
          )}
        >
          Khách hàng
        </button>
      </div>

      {/* Render mô-đun biệt lập */}
      <div className="w-full transition-all">
        {activeTab === CUSTOMER_TABS.GROUP ? <CustomerGroup /> : <CustomerList />}
      </div>
    </div>
  );
};

export default CustomerPage;