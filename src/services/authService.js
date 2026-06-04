// src/services/authService.js (Cập nhật thêm hàm Change Password)
import { apiBackend } from '../config/axiosClient';

export const authService = {
  login: (data) => apiBackend.post('/auth/login', data),
  logout: () => apiBackend.post('/logout'),
  // BỔ SUNG: API làm mới token để nhất quán với logic trong axiosClient
  refreshToken: (refreshToken) => apiBackend.post('/auth/refresh-token', { refreshToken }),

  updateProfile: (data) => apiBackend.post('/profile/update', data),
  
  // API đổi mật khẩu - sử dụng endpoint /auth/change-password
  // SỬA LỖI: API đổi mật khẩu đúng là /profile/change-password theo tài liệu
  changePassword: (data) => apiBackend.post('/profile/change-password', data),
};