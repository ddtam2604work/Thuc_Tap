import Button from '../../components/skeleton/Button';
import FormInput from '../../components/skeleton/FormInput'; // FormInput tái sử dụng từ AccountPage
import OrderTable from '../../components/partials/table/order/OrderTable';
import { useOrders } from '../../hooks/Order/useOrders';
import { ORDER_STATUS_TABS } from '../../constants/order';
import { useNavigate } from 'react-router-dom';

const OrderPage = () => {
  const navigate = useNavigate();
  
  const {
    activeTab,
    setActiveTab,
    searchKey,
    setSearchKey,
    dateFilter,
    setDateFilter,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
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

  // Logic UI hiển thị phân trang nhóm số chuẩn AccountPage
  const getPaginationGroup = () => {
    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + 4, totalPages);
    if (end - start < 4) {
      start = Math.max(end - 4, 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/30">
      <main className="p-6 flex-1">
        {/* Tiêu đề khối hành chính */}
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Quản lý Đơn hàng</h1>
        </div>

        {/* Danh sách Pills/Tabs động tối ưu cuộn ngang */}
        <div className="flex flex-nowrap gap-1.5 items-center bg-transparent overflow-x-auto pb-2 max-w-full scrollbar-none mb-4">
          {ORDER_STATUS_TABS.map(({ id, label }) => {
            const isActive = activeTab === id;
            const count = statusCounts[id] ?? 0;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`px-3.5 h-8.5 flex items-center justify-center gap-1.5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap shrink-0 border cursor-pointer
                  ${isActive 
                    ? 'bg-[#0052FF] text-white border-transparent shadow-sm font-semibold' 
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

        {/* Banner cảnh báo thời hạn - Định dạng dải màu đồng bộ hệ thống */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 flex items-start gap-3 rounded-r-lg shadow-2xs">
          <span className="text-amber-500 mt-0.5">⚠️</span>
          <p className="text-[13px] text-amber-800 leading-relaxed">
            <strong className="font-semibold">Cảnh báo hệ thống:</strong> Các đơn hàng ở trạng thái đơn nháp chỉ được lưu giữ ổn định trong vòng 14 ngày kể từ ngày khởi tạo.
          </p>
        </div>

        {/* Toolbar điều kiện lọc & Tìm kiếm tức thời */}
        <form onSubmit={handleSearchSubmit} className="flex flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex-wrap lg:flex-nowrap">
          
          {/* FormInput Tìm kiếm tức thời */}
          <div className="flex-1 min-w-[280px] max-w-md relative">
            <FormInput 
              value={searchKey}
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng,..." 
              onChange={(e) => setSearchKey(e.target.value)}
              className="bg-gray-50/50 border-gray-200 h-10 pr-10 focus:bg-white transition-all w-full text-[13px]"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Cụm bộ lọc nâng cao chỉnh chu theo Hình 2 */}
          <div className="flex items-end gap-3 ml-auto flex-wrap sm:flex-nowrap justify-end w-full lg:w-auto">
            <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap w-full sm:w-auto">
              
              {/* Ô nhập Từ Ngày kèm thuộc tính giới hạn max an toàn nghiệp vụ */}
              <div className="flex flex-col gap-1.5 flex-1 sm:flex-none">
                <label className="text-[12px] font-semibold text-gray-600 px-0.5">Từ Ngày</label>
                <input
                  type="date"
                  max={toDate}
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-white outline-none focus:ring-2 focus:ring-blue-500/20 h-10 w-full sm:w-[160px] cursor-pointer text-gray-600 font-medium transition-colors hover:border-gray-300"
                />
              </div>

              {/* Ô nhập Đến Ngày kèm thuộc tính giới hạn min an toàn nghiệp vụ */}
              <div className="flex flex-col gap-1.5 flex-1 sm:flex-none">
                <label className="text-[12px] font-semibold text-gray-600 px-0.5">Đến Ngày</label>
                <input
                  type="date"
                  min={fromDate}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-white outline-none focus:ring-2 focus:ring-blue-500/20 h-10 w-full sm:w-[160px] cursor-pointer text-gray-600 font-medium transition-colors hover:border-gray-300"
                />
              </div>

              {/* Dropdown Trạng thái */}
              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <span className="text-[12px] opacity-0 pointer-events-none select-none hidden sm:inline-block">Trạng thái</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-white outline-none focus:ring-2 focus:ring-blue-500/20 h-10 w-full sm:min-w-[150px] font-medium text-gray-600 cursor-pointer transition-colors hover:border-gray-300"
                >
                  <option value="all">Tất cả trạng thái</option>
                  {ORDER_STATUS_TABS.filter(t => t.id !== 'ALL').map(({ id, label }) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nút Tạo đơn hàng */}
            <div className="flex flex-col gap-1.5 w-full sm:w-auto">
              <span className="text-[12px] opacity-0 pointer-events-none select-none hidden sm:inline-block">Thao tác</span>
              <Button 
                type="button"
                onClick={() => navigate('/orders/create')} 
                className="w-full sm:w-fit px-6 h-10 shadow-xs shrink-0 whitespace-nowrap !bg-[#0052FF] hover:!bg-blue-700 font-semibold text-[13px]"
              >
                <span className="text-lg font-light mr-1.5">+</span> Tạo đơn hàng
              </Button>
            </div>
          </div>
        </form>

        {/* Khối chứa bảng trắng bo góc tinh tế */}
        <div className="w-full min-h-[200px] flex flex-col justify-center">
          {isLoading ? (
            <div className="text-center py-12 flex flex-col items-center justify-center gap-3 text-gray-400 text-[13px] font-medium animate-pulse">
              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Đang tải dữ liệu đơn hàng...</span>
            </div>
          ) : (
            <OrderTable 
              orders={orders} 
              handleDeleteOrder={handleDeleteOrder} 
            />
          )}
        </div>
        
        {/* Khối phân trang số trực quan */}
        {!isLoading && totalPages > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 px-2 gap-4">
            {/* Thống kê đếm số bản ghi hiển thị */}
            <div className="text-sm text-gray-500">
              Hiển thị <span className="font-semibold text-gray-900">{currentViewCount}</span> trong tổng số <span className="font-semibold text-gray-900">{totalOrdersCount}</span> đơn hàng
            </div>

            {/* Cụm nút bấm số trang */}
            <div className="flex gap-1.5">
              <Button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`w-9 h-9 rounded-md border text-sm font-medium transition-all p-0 flex items-center justify-center ${
                  currentPage === 1 
                  ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100 cursor-pointer'
                }`}
              >
                &lt;
              </Button>

              {getPaginationGroup().map(page => (
                <Button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-md border text-sm font-medium transition-all p-0 cursor-pointer ${
                    page === currentPage 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-semibold' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </Button>
              ))}

              <Button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`w-9 h-9 rounded-md border text-sm font-medium transition-all p-0 flex items-center justify-center ${
                  currentPage === totalPages 
                  ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100 cursor-pointer'
                }`}
              >
                &gt;
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderPage;