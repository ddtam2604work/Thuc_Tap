import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/skeleton/Button';

const HomePage = () => {
  const navigate = useNavigate();

  // Logic bảo vệ trang: Nếu chưa đăng nhập thì đẩy về Login
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate('/login');
  };

  return (
    <>
      {/* 1. Tiêu đề Trang & Khối hành động */}
      <div className="flex justify-between items-center mt-1">
        <h1 className="text-xl font-bold text-[#1E293B] tracking-tight whitespace-nowrap">Dashboard</h1>
      </div>

      {/* 2. Thanh thông báo chào mừng (Style tương tự thanh cảnh báo OrderPage) */}
      <div className="bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] px-3 py-2 rounded-lg flex items-center gap-2 text-[12px] font-medium shadow-xs mt-3 whitespace-nowrap overflow-x-auto">
        <span className="text-xs">👋</span>
        <p className="whitespace-nowrap">
          Chào mừng bạn quay trở lại với <strong className="font-semibold">Labs Flow</strong>. Hệ thống đang hoạt động ổn định!
        </p>
      </div>

      {/* 3. Bộ lọc chung & Nút tải lại (Style form của OrderPage) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-3 rounded-xl border border-gray-100 shadow-xs mt-4">
        <div className="flex items-center gap-2">
           <h2 className="text-[14px] font-bold text-[#1E293B]">Tổng quan hoạt động</h2>
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap">
          <select
            className="h-8.5 px-2.5 border border-gray-200 rounded-lg text-[12px] bg-white font-medium text-gray-600 focus:outline-none cursor-pointer hover:bg-gray-50"
          >
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
          </select>

          <Button variant="primary" className="bg-[#0052FF] hover:bg-blue-700 h-8.5 px-4 rounded-lg text-[12px] font-semibold flex items-center gap-1 shadow-xs">
            <span className="text-sm font-bold">↻</span> Cập nhật
          </Button>
        </div>
      </div>

      {/* 4. Khối Card Thống kê (Grid Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {/* Card 1: Tổng đơn hàng */}
        <div className="shadow-xs rounded-xl border border-gray-100 bg-white p-4 flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-gray-500">Tổng đơn hàng</span>
          <span className="text-2xl font-bold text-[#1E293B]">1,284</span>
          <div className="text-[11px] font-medium text-green-600 flex items-center gap-1 mt-1">
            <span>↑ 12%</span>
            <span className="text-gray-400 font-normal">so với tháng trước</span>
          </div>
        </div>

        {/* Card 2: Đơn đang sản xuất */}
        <div className="shadow-xs rounded-xl border border-gray-100 bg-white p-4 flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-gray-500">Đang sản xuất</span>
          <span className="text-2xl font-bold text-[#0052FF]">42</span>
          <div className="text-[11px] font-medium text-[#0052FF] flex items-center gap-1 mt-1">
            <span>Cần theo dõi tiến độ</span>
          </div>
        </div>

        {/* Card 3: Khách hàng mới */}
        <div className="shadow-xs rounded-xl border border-gray-100 bg-white p-4 flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-gray-500">Khách hàng mới</span>
          <span className="text-2xl font-bold text-[#1E293B]">84</span>
          <div className="text-[11px] font-medium text-green-600 flex items-center gap-1 mt-1">
            <span>↑ 5%</span>
            <span className="text-gray-400 font-normal">so với tháng trước</span>
          </div>
        </div>

        {/* Card 4: Đơn nháp */}
        <div className="shadow-xs rounded-xl border border-gray-100 bg-white p-4 flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-gray-500">Đơn hàng nháp</span>
          <span className="text-2xl font-bold text-[#B45309]">12</span>
          <div className="text-[11px] font-medium text-[#B45309] flex items-center gap-1 mt-1">
            <span>Cần xử lý trong 14 ngày</span>
          </div>
        </div>
      </div>

      {/* 5. Khu vực mở rộng (Biểu đồ / Danh sách nhanh) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Box lớn: Dành cho Biểu đồ thống kê */}
        <div className="col-span-2 shadow-xs rounded-xl border border-gray-100 bg-white p-4 min-h-[300px] flex flex-col">
          <h3 className="text-[14px] font-bold text-[#1E293B] mb-3">Thống kê doanh số</h3>
          <div className="flex-1 rounded-lg border border-dashed border-gray-200 bg-[#FCFCFC] flex items-center justify-center text-[12px] text-gray-400">
            [Khu vực tích hợp Biểu đồ (Recharts/Chart.js)]
          </div>
        </div>

        {/* Box nhỏ: Đơn hàng mới nhất */}
        <div className="col-span-1 shadow-xs rounded-xl border border-gray-100 bg-white p-4 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[14px] font-bold text-[#1E293B]">Đơn hàng mới</h3>
            <button 
              onClick={() => navigate('/orders')} 
              className="text-[11px] font-medium text-[#0052FF] hover:underline"
            >
              Xem tất cả
            </button>
          </div>
          
          <div className="flex flex-col gap-2">
            {/* Mock Data List */}
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex justify-between items-center p-2.5 rounded-lg border border-transparent hover:border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                <div>
                  <p className="text-[12px] font-semibold text-[#1E293B]">Đơn #DH-{1000 + item}</p>
                  <p className="text-[11px] text-gray-500">Nguyễn Văn A</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFEFEF] text-[#4F5E71] font-medium">
                  Vừa xong
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;