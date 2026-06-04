//Quản lý Nhân viên & Quyền
import { apiBackend } from '../config/axiosClient';

export const userService = {
  getRoles: () => apiBackend.post('/roles/getall'),
  getUsers: (payload) => apiBackend.post('/user/get-all', payload),
  addUser: (data) => apiBackend.post('/user/add', data),
  editUser: (data) => apiBackend.post('/user/edit', data),
  deleteUser: (id) => apiBackend.post('/user/delete', { id }),
  setActive: (id, isactive) => apiBackend.post('/user/set-active', { id, isactive }),
  setPassword: (id, newPassword) => apiBackend.post('/user/set-password', { id, newPassword }),
  getDetail: (id) => apiBackend.post('/user/get-detail', { id }),
};