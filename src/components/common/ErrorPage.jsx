import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../components/skeleton/Button';
import { getUserRoleFromToken } from '../../utils/auth';

const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy thông điệp lỗi tùy biến nếu có từ state truyền sang
  const errorMessage = location.state?.message || "Trang bạn yêu cầu không tồn tại hoặc dữ liệu đã bị xóa.";

  // Hàm xử lý quay lại an toàn về trang chủ/Dashboard dựa trên Role nếu việc Back lại không khả thi
  const handleReturnSafe = () => {
    const role = getUserRoleFromToken();
    if (role === 'customer') {
      navigate('/products', { replace: true });
    } else {
      navigate('/home', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-inter">
      <div className="w-full max-w-md text-center flex flex-col items-center gap-6 bg-white p-10 rounded-[32px] border border-gray-100 shadow-xl animate-in fade-in zoom-in duration-300">
        
        {/* Biểu tượng lỗi thân thiện thay cho mã 404 khô khan */}
        <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center mb-2">
          <svg className="w-16 h-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-gray-800">
            Không tìm thấy dữ liệu!
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed px-4">
            {errorMessage}
          </p>
        </div>

        {/* Các lựa chọn điều hướng an toàn */}
        <div className="w-full pt-6 flex flex-col gap-3">       
          <Button 
            type="button"
            onClick={handleReturnSafe} // 🎯 Điều hướng về Dashboard/Parent an toàn
            className="w-full bg-[#0037B0] hover:bg-blue-700 text-white shadow-md font-semibold py-3 rounded-xl transition-all active:scale-95"
          >
            ← Về trang chính hệ thống
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;