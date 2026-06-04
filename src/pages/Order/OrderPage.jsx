import Button from '../../components/skeleton/Button';
import OrderTable from '../../components/partials/table/order/OrderTable';
import { useOrders } from '../../hooks/Order/useOrders';
import { ORDER_STATUS_TABS } from '../../constants/order';
import { useNavigate } from 'react-router-dom';

const OrderPage = () => {
  const navigate = useNavigate();
  
  // Giải cấu trúc toàn bộ các trạng thái và hành động tương tác từ hook useOrders
  const {
    activeTab,
    setActiveTab,
    searchKey,
    setSearchKey,
    dateFilter,
    setDateFilter,
    statusFilter,
    setStatusFilter,
    orders,
    totalOrdersCount,
    currentViewCount,
    currentPage,
    setCurrentPage,
    totalPages,
    isLoading,
    statusCounts,
    handleSearchSubmit,
    handleExportPdf,
    handleDeleteOrder,
    handleCancelOrder,
  } = useOrders();

  return (
    <div className="p-4 bg-[#F8FAFC] min-h-screen">
      {/* 1. Tiêu đề khối */}
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Quản lý Đơn hàng</h1>
      </div>

      {/* 2. Danh sách Pills/Tabs động */}
      <div className="flex flex-nowrap gap-1.5 items-center bg-transparent overflow-x-auto pb-2 max-w-full scrollbar-none mb-3">
        {ORDER_STATUS_TABS.map(({ id, label }) => {
          const isActive = activeTab === id;
          const count = statusCounts[id] ?? 0; // Đếm số lượng thực tế bóc tách từ trường status_totals

          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-3.5 h-8.5 flex items-center justify-center gap-1.5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap shrink-0 border
                ${isActive 
                  ? 'bg-[#0052FF] text-white border-transparent shadow-xs font-semibold' 
                  : 'bg-white text-[#4F5E71] border-gray-200 hover:bg-gray-50'}`}
            >
              <span>{label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#64748B]'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Khối cảnh báo thời gian hạn định */}
      <div className="bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] px-3 py-2 rounded-lg flex items-center gap-2 text-[12px] font-medium shadow-2xs mb-3 whitespace-nowrap overflow-x-auto">
        <span className="text-xs">⚠️</span>
        <p className="whitespace-nowrap">
          <strong className="font-semibold">Cảnh báo:</strong> Các đơn nháp chỉ được lưu trong 14 ngày kể từ ngày khởi tạo.
        </p>
      </div>

      {/* 4. Khối điều kiện lọc nâng cao */}
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-3 rounded-xl border border-gray-100 shadow-2xs mb-3">
        <div className="flex flex-1 items-center gap-2 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            <input
              type="text"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng,..."
              className="w-full pl-8 pr-3 h-8.5 border border-gray-200 rounded-lg text-[12px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-[#FCFCFC] whitespace-nowrap"
            />
          </div>
          <Button type="submit" variant="primary" className="bg-[#0037B0] h-8.5 px-4 rounded-lg text-[12px] font-medium text-white">
            Tìm kiếm
          </Button>
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-8.5 px-2.5 border border-gray-200 rounded-lg text-[12px] bg-white font-medium text-gray-600 focus:outline-none cursor-pointer hover:bg-gray-50"
          >
            <option value="month">Tháng này</option>
            <option value="today">Hôm nay</option>
            <option value="year">Năm nay</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8.5 px-2.5 border border-gray-200 rounded-lg text-[12px] bg-white font-medium text-gray-600 focus:outline-none cursor-pointer hover:bg-gray-50"
          >
            <option value="all">Tất cả trạng thái</option>
            {ORDER_STATUS_TABS.filter(t => t.id !== 'ALL').map(({ id, label }) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>

          <Button variant="primary" 
            onClick={() => navigate('/orders/create')}
            className="bg-[#0052FF] hover:bg-blue-700 h-8.5 px-4 rounded-lg text-[12px] font-semibold text-white flex items-center gap-1 shadow-2xs">
            <span className="text-sm font-bold">+</span> Tạo đơn hàng
          </Button>
        </div>
      </form>

      {/* 5. Khối Bảng hiển thị kết quả chính */}
      <div className="shadow-xs rounded-xl border border-gray-100 bg-white overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-gray-500 font-medium">
            🔄 Đang tải dữ liệu đơn hàng...
          </div>
        ) : (
          <OrderTable 
            orders={orders} 
            handleDeleteOrder={handleDeleteOrder} 
          />
        )}
        
        {/* Thanh Phân Trang */}
        <div className="p-3 flex items-center justify-between border-t border-gray-100 text-[12px] font-medium text-gray-500 bg-white whitespace-nowrap">
          <div>
            Hiển thị <span className="text-[#1E293B] font-semibold">{currentViewCount}/{totalOrdersCount}</span> đơn hàng
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="pagination" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className={`border border-gray-200 w-7 h-7 rounded-md flex items-center justify-center text-[11px] ${currentPage === 1 ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 text-[#1E293B]'}`}
            >
              &lt;
            </Button>

            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
              const isCurrent = currentPage === pageNum;
              return (
                <button 
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-md text-[11px] font-semibold border flex items-center justify-center transition-all ${
                    isCurrent 
                      ? 'bg-[#0037B0] text-white border-transparent shadow-xs' 
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-[#1E293B]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <Button 
              variant="pagination"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className={`border border-gray-200 w-7 h-7 rounded-md flex items-center justify-center text-[11px] ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 text-[#1E293B]'}`}
            >
              &gt;
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;