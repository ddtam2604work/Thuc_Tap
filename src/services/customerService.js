//Nhóm KH & Khách hàng
import { apiBackend } from '../config/axiosClient';

export const customerService = {
  // Nhóm khách hàng (Customer Categories)
  getCategories: () => apiBackend.post('/customercategories/get-all'),
  addCategory: (data) => apiBackend.post('/customercategories/add', data),
  editCategory: (data) => apiBackend.post('/customercategories/edit', data),
  deleteCategory: (id) => apiBackend.post('/customercategories/delete', { id }),
  setCategoryActive: (id, isActive) => apiBackend.post('/customercategories/set-active', { id, isActive }),

  // Khách hàng
  getPaging: (payload) => apiBackend.post('/customer/get-paging', payload), // payload chứa page, limit, filter
  addCustomer: (data) => apiBackend.post('/customer/add', data), // Lưu ý: username = số điện thoại
  editCustomer: (data) => apiBackend.post('/customer/edit', data),
  deleteCustomer: (id) => apiBackend.post('/customer/delete', { id }),
  setActive: (id, isActive) => apiBackend.post('/customer/set-active', { id, isActive }),
  setPassword: (id, newPassword) => apiBackend.post('/customer/set-password', { id, newPassword }),
  // SỬA LỖI: API lấy chi tiết khách hàng phải là /customer/get-detail theo tài liệu.
  getDetail: (id) => apiBackend.post('/customer/get-detail', { id }),
};