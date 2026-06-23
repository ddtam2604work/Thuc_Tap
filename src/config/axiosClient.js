import axios from 'axios';
import { store } from '../redux/store'; 
import { logout as logoutAction } from '../redux/slices/authSlice'; 

const API_URL = import.meta.env.VITE_BE_URL;
// BỔ SUNG: Biến URL môi trường dành riêng cho cụm Media Server
const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'https://113.161.204.185:4010';

export const apiBackend = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// BỔ SUNG & EXPORT: Khởi tạo apiMedia để sửa triệt để lỗi Uncaught SyntaxError
export const apiMedia = axios.create({
  baseURL: `${MEDIA_URL}/api`,
  timeout: 15000, // Tăng timeout một chút hỗ trợ truyền tải file dung lượng lớn
});

let isRefreshing = false; 
let failedQueue = [];     

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

// ==========================================
// 1. CẤU HÌNH INTERCEPTORS CHO API BACKEND
// ==========================================

// 1.1 Interceptor đính kèm Access Token vào mọi request gửi đi
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

// 1.2 Interceptor đầu ra xử lý Silent Refresh lỗi 401 tự động
apiBackend.interceptors.response.use(
  (response) => {
    return response.data; 
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return apiBackend(originalRequest); 
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        handleLogoutSystem();
        return Promise.reject(error);
      }

      try {
        console.log('🔄 Đang âm thầm đổi accessToken mới (Silent Refresh)...');
        
        // Gọi thẳng qua instance axios gốc để tránh lặp vô hạn interceptor
        const res = await axios.post(`${API_URL}/api/v1/auth/refresh-token`, {
          refreshToken: refreshToken
        });

        if (res.data?.errorCode === 1 || res.data?.statusCode === 200 || res.data?.statusCode === "200") {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data.data;

          localStorage.setItem('accessToken', newAccessToken);
          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

          processQueue(null, newAccessToken);

          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return apiBackend(originalRequest);
        } else {
          throw new Error('Refresh token không hợp lệ');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleLogoutSystem();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 🎯 CHUẨN HÓA KHỐI DỮ LIỆU LỖI TRẢ VỀ TỪ BACKEND ĐỂ UI LAYER HỨNG ĐƯỢC
    if (error.response && error.response.data) {
      
      // 🌟 ĐIỀU CHỈNH 1: Chống nuốt lỗi khi tải file PDF/Image (Giải mã Blob thành JSON)
      if (error.response.data instanceof Blob && error.response.data.type.includes('application/json')) {
        try {
          const textData = await error.response.data.text();
          const jsonData = JSON.parse(textData);
          return Promise.reject(jsonData);
        } catch (e) {
          return Promise.reject(error.response.data);
        }
      }

      return Promise.reject(error.response.data);
    }

    return Promise.reject(error);
  }
);


// ==========================================
// 2. CẤU HÌNH INTERCEPTORS CHO API MEDIA 
// ==========================================

apiMedia.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiMedia.interceptors.response.use(
  (response) => {
    return response.data; 
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return apiMedia(originalRequest); 
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        handleLogoutSystem();
        return Promise.reject(error);
      }

      try {
        console.log('🔄 Đang âm thầm đổi accessToken mới từ luồng Media...');
        
        const res = await axios.post(`${API_URL}/api/v1/auth/refresh-token`, {
          refreshToken: refreshToken
        });

        if (res.data?.errorCode === 1 || res.data?.statusCode === 200 || res.data?.statusCode === "200") {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data.data;

          localStorage.setItem('accessToken', newAccessToken);
          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

          processQueue(null, newAccessToken);

          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return apiMedia(originalRequest);
        } else {
          throw new Error('Refresh token không hợp lệ');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleLogoutSystem();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response && error.response.data) {
      // 🌟 ĐIỀU CHỈNH 1: Chống nuốt lỗi khi tải file Media
      if (error.response.data instanceof Blob && error.response.data.type.includes('application/json')) {
        try {
          const textData = await error.response.data.text();
          const jsonData = JSON.parse(textData);
          return Promise.reject(jsonData);
        } catch (e) {
          return Promise.reject(error.response.data);
        }
      }

      return Promise.reject(error.response.data);
    }

    return Promise.reject(error);
  }
);


// ==========================================
// 3. LOGIC HỆ THỐNG CHUNG 
// ==========================================
const handleLogoutSystem = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo'); 
  
  // 🌟 ĐIỀU CHỈNH 2: Bọc an toàn store để chống lỗi Circular Dependency (Rất hay gặp khi code lớn dần)
  if (store && typeof store.dispatch === 'function') {
    store.dispatch(logoutAction()); 
  }
  
  console.error('🔴 Phiên đăng nhập hết hạn hoàn toàn. Mời đăng nhập lại.');
  // Tùy chọn: window.location.href = '/login'; (Nếu Redux authSlice chưa kịp bắt sự thay đổi)
};