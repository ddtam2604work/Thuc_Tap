import axios from 'axios';
import { store } from '../redux/store'; // Import Redux store
import { logout as logoutAction } from '../redux/slices/authSlice'; // Import logout action

const API_URL = import.meta.env.VITE_BE_URL;

// 1. Tạo instance cho Backend API
export const apiBackend = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- CẤU TRÚC PHÒNG THỦ VÀ GÓI ĐẦU ĐỐI VỚI REFRESH TOKEN ---
let isRefreshing = false; // Biến cờ kiểm soát: Chỉ cho phép duy nhất 1 request đi đổi token tại 1 thời điểm
let failedQueue = [];     // Danh sách các request bị giữ chân chờ đổi token xong

// Hàm quản lý hàng đợi: Thêm các request bị lỗi 401 vào danh sách chờ
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 2. Interceptor đầu vào (Request): Tự động đính kèm accessToken mới nhất vào mỗi lượt gọi
apiBackend.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Interceptor đầu ra (Response): Nơi thực hiện kỹ thuật "Gói đầu" thần tốc
apiBackend.interceptors.response.use(
  (response) => {
    // Nếu API thành công, trả thẳng dữ liệu về cho useAccounts / UI nhận
    return response.data; 
  },
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra nếu lỗi 401 (Hết hạn token) và request này chưa từng được retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Nếu đã có một request khác đang đi đổi token rồi -> Bắt request này xếp hàng đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return apiBackend(originalRequest); // Chạy lại request cũ với token mới (Gói đầu)
          })
          .catch((err) => Promise.reject(err));
      }

      // Nếu chưa có ai đi đổi token -> Đánh dấu mình là người đi đầu tiên
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      // BẢO VỆ: Nếu không có cả refreshToken thì bắt buộc phải Logout ngay
      if (!refreshToken) {
        handleLogoutSystem();
        return Promise.reject(error);
      }

      try {
        console.log('🔄 Đang âm thầm đổi accessToken mới (Silent Refresh)...');
        
        // Gọi API làm mới token (Đường dẫn dựa theo tài liệu /auth hoặc /refresh-token của bạn)
        // Lưu ý: Gọi bằng instance axios gốc để tránh bị dính lặp interceptor
        const res = await axios.post(`${API_URL}/api/v1/auth/refresh-token`, {
          refreshToken: refreshToken
        });

        // Backend trả về cặp token mới (Lưu ý bóc tách đúng errorCode hệ thống của bạn)
        if (res.data?.errorCode === 1 || res.data?.statusCode === "200" || res.data?.statusCode === 200) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data.data;

          // Cập nhật lại kho lưu trữ cục bộ
          localStorage.setItem('accessToken', newAccessToken);
          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

          // Giải phóng hàng đợi: Phát token mới cho tất cả các anh em đang xếp hàng
          processQueue(null, newAccessToken);

          // Nạp token mới vào chính request hiện tại và chạy luôn
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return apiBackend(originalRequest);
        } else {
          throw new Error('Refresh token không hợp lệ');
        }
      } catch (refreshError) {
        // Nếu đổi token thất bại (Ví dụ: refreshToken cũng hết hạn nốt sau 7 ngày) -> Xóa sạch và kick ra Login
        processQueue(refreshError, null);
        handleLogoutSystem();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 🎯 ĐIỂM TINH CHỈNH HOÀN THIỆN (ERROR NORMALIZATION)
    // Nếu lỗi không phải 401, hoặc là lỗi 400/500 có chứa dữ liệu từ Backend
    // Trả thẳng khối JSON (error.response.data) ra ngoài để hàm handleBusinessError hứng được
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }

    // Nếu rớt mạng hoặc Backend sập (không có response)
    return Promise.reject(error);
  }
);

// Hàm điều hướng đẩy người dùng ra trang login khi token chết hẳn
const handleLogoutSystem = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo'); // Xóa thông tin người dùng khỏi localStorage
  store.dispatch(logoutAction()); // Dispatch Redux logout action
  console.error('🔴 Phiên đăng nhập hết hạn hoàn toàn. Mời đăng nhập lại.');
  // Điều hướng sẽ được xử lý bởi React Router khi trạng thái Redux thay đổi
  // Không sử dụng window.location.href trực tiếp để tránh hủy các request đang chờ
};