import axios from 'axios';
import { store } from '../redux/store'; 
import { logout as logoutAction } from '../redux/slices/authSlice'; 

const API_URL = import.meta.env.VITE_BE_URL;

export const apiBackend = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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

// 1. Interceptor đính kèm Access Token vào mọi request gửi đi
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

// 2. Interceptor đầu ra xử lý Silent Refresh lỗi 401 tự động
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
      return Promise.reject(error.response.data);
    }

    return Promise.reject(error);
  }
);

const handleLogoutSystem = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo'); 
  store.dispatch(logoutAction()); 
  console.error('🔴 Phiên đăng nhập hết hạn hoàn toàn. Mời đăng nhập lại.');
};