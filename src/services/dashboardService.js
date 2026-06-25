/**
 * Dashboard Service
 * @description Đảm nhận toàn bộ luồng giao tiếp API phần Dashboard bằng việc sử dụng apiBackend từ axiosClient.
 * @author Senior Fullstack Developer
 */

import { apiBackend } from '../config/axiosClient'; // Thay đổi đường dẫn thực tế đến file axiosClient của bạn

export const dashboardService = {
  /**
   * 1. Lấy thông tin tóm tắt đơn hàng (Doanh thu, số lượng đơn thành công...)
   * @param {string} fromDate - Định dạng YYYY-MM-DD
   * @param {string} toDate - Định dạng YYYY-MM-DD
   */
  getOrderSummary: async (fromDate, toDate) => {
    return await apiBackend.post('/dashboard/get-order-summary', {
      from_date: fromDate,
      to_date: toDate,
    });
  },

  /**
   * 2. Lấy tổng số lượng đơn hàng phát sinh trong khoảng thời gian
   * @param {string} fromDate - Định dạng YYYY-MM-DD
   * @param {string} toDate - Định dạng YYYY-MM-DD
   */
  getTotalOrder: async (fromDate, toDate) => {
    return await apiBackend.post('/dashboard/get-total-order', {
      from_date: fromDate,
      to_date: toDate,
    });
  },

  /**
   * 3. Lấy danh sách những khách hàng có chi tiêu hoặc lượt mua cao nhất
   * @param {string} fromDate - Định dạng YYYY-MM-DD
   * @param {string} toDate - Định dạng YYYY-MM-DD
   * @param {number} count - Số lượng bản ghi muốn lấy (Mặc định: 10)
   */
  getTopCustomers: async (fromDate, toDate, count = 10) => {
    return await apiBackend.post('/dashboard/get-top-customers', {
      from_date: fromDate,
      to_date: toDate,
      count,
    });
  },

  /**
   * 4. Lấy danh sách các đơn hàng mới cập nhật gần đây trên hệ thống
   * @param {number} count - Số lượng đơn hàng cần lấy (Mặc định: 10)
   */
  getLatestOrders: async (count = 10) => {
    return await apiBackend.post('/dashboard/get-latest-orders', {
      count,
    });
  },

  /**
   * 5. Lấy dữ liệu biểu đồ doanh thu theo các tháng gần nhất
   * @param {number} revenueMonthCount - Số lượng tháng cần quay ngược về trước (Mặc định: 6)
   */
  getRevenueMonthly: async (revenueMonthCount = 6) => {
    return await apiBackend.post('/dashboard/get-revenue-monthly', {
      revenue_month_count: revenueMonthCount,
    });
  },

  /**
   * 6. Lấy danh sách nhật ký thay đổi trạng thái của các đơn hàng (Logs)
   * @param {number} limit - Số lượng dòng log tối đa (Mặc định: 10)
   */
  getOrderStatusLogs: async (limit = 10) => {
    return await apiBackend.post('/dashboard/get-order-status-logs', {
      limit,
    });
  },
};