//Quản lý Đơn hàng phức tạp
import { apiBackend } from '../config/axiosClient';

export const orderService = {
  getAllStatuses: () => apiBackend.post('/order/order-status/get-all'),
  getPaging: (payload) => apiBackend.post('/order/get-paging', payload),
  getDetail: (id) => apiBackend.post('/order/get-by-id', { id }),
  
  // Xử lý các luồng trạng thái Đơn Hàng (State Machine)
  createDraft: (data) => apiBackend.post('/order/create-draft', data),
  saveDraft: (data) => apiBackend.post('/order/save-draft', data),
  deleteDraft: (id) => apiBackend.post('/order/delete-draft', { id }),
  
  createNew: (data) => apiBackend.post('/order/create-new', data), // Chờ xác nhận
  createAwait: (data) => apiBackend.post('/order/create-await', data), // Chờ duyệt
  
  updateOrder: (data) => apiBackend.post('/order/update-order', data), // Khóa đối với DRAFT, SHIPPING, DONE, CANCELED
  deleteOrder: (id) => apiBackend.post('/order/delete-order', { id }), // Chưa confirm mới xóa được
  changeStatus: (id, status) => apiBackend.post('/order/change-status-order', { id, status_code: status }),
  
  doneOrder: (id) => apiBackend.post('/order/done-order', { id }),
  cancelOrder: (id) => apiBackend.post('/order/cancel-order', { id }),
  checkDuplicates: (fileIds) => apiBackend.post('/order/check-duplicates', { fileIds }),
  
  // Logs & Lịch sử tác động
  getLogs: (payload) => apiBackend.post('/order/get-logs-paging', payload),
  // SỬA LỖI: API lấy lịch sử đơn hàng phải có tiền tố /order/
  getHistoryUpdate: (orderId) => apiBackend.post('/order/get-history-update-order', { orderId }),
  
  // Xuất file PDF hoá đơn
  exportFullPdf: (orderId) => apiBackend.post('/order/export-pdf', { orderId }, { responseType: 'blob' }),//in thường
  exportLimitPdf: (orderId) => apiBackend.post('/order/export-pdf-small', { orderId }, { responseType: 'blob' }),//mail
};