// src/redux/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Khôi phục dữ liệu từ LocalStorage an toàn
const savedUser = localStorage.getItem('userInfo');
let initialUser = null;
try {
  initialUser = savedUser ? JSON.parse(savedUser) : null;
} catch (error) {
  console.error("Lỗi parse userInfo:", error);
}

const initialState = {
  token: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  user: initialUser, // Chứa toàn bộ thông tin fullname, email, roles...
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userInfo'); // Nhớ dọn dẹp userInfo
    },
    setUserInfo: (state, action) => {
      state.user = action.payload;
      // Cập nhật lại LocalStorage nếu có thay đổi profile
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    }
  },
});

export const { loginSuccess, logout, setUserInfo } = authSlice.actions;
export default authSlice.reducer;