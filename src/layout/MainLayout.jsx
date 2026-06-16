import TopNavBar from '../components/skeleton/TopNavBar';

const MainLayout = ({ children, noCard = false }) => {
  return (
    // 1. h-[100dvh]: Vừa khít 100% chiều cao màn hình (dvh xử lý triệt để lỗi thanh địa chỉ trên mobile)
    // 2. overflow-hidden: Khóa chặt không cho cuộn toàn trang, chống xô lệch layout
    <div className="relative h-[100dvh] w-full bg-[#F8F9FA] flex flex-col font-sans text-gray-800 overflow-hidden">
      
      {/* Header: Ép chiều cao cố định, không bao giờ bị co giãn (flex-none) */}
      <div className="flex-none w-full bg-white shadow-sm z-50">
        <TopNavBar /> 
      </div>
      
      {/* Vùng chứa trung tâm: Chiếm không gian còn lại (flex-1) và tự xuất hiện thanh cuộn nếu nội dung dài (overflow-y-auto) */}
      {/* Padding thu phóng tự động: Mobile (p-3) -> Tablet (p-6) -> PC (p-8) */}
      <main className="flex-1 w-full mx-auto max-w-[1440px] p-3 sm:p-6 lg:p-8 overflow-y-auto">
        
        {noCard ? (
          // min-h-full đảm bảo thẻ luôn kéo dài tối đa khung hình ngay cả khi nội dung ngắn
          <div className="min-h-full">
            {children}
          </div>
        ) : (
          // Khung trắng (Card): Bo góc nhẹ hơn trên mobile (rounded-xl) và to hơn trên PC (rounded-2xl)
          <div className="min-h-full bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8">
            {children}
          </div>
        )}

      </main>
    </div>
  );
};

export default MainLayout;