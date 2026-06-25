// =========================================================================
// FILE: src/hooks/Dashboard/useDashboard.js
// =========================================================================
import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../../services/dashboardService'; // Điều chỉnh đường dẫn thực tế

export const useDashboard = () => {
  const [filters, setFilters] = useState({
    fromDate: '2026-04-04',
    toDate: '2026-05-04',
    topCustomerCount: 10,
    latestOrderCount: 10,
    revenueMonthCount: 6,
    logLimit: 10,
  });

  const [orderSummary, setOrderSummary] = useState(null);
  const [totalOrder, setTotalOrder] = useState(null);
  const [topCustomers, setTopCustomers] = useState([]);
  const [latestOrders, setLatestOrders] = useState([]);
  const [revenueMonthly, setRevenueMonthly] = useState([]);
  const [statusLogs, setStatusLogs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Vì apiBackend trả về thẳng response.data nên kết quả ở đây có cấu trúc: { errorCode, data, message }
      const results = await Promise.allSettled([
        dashboardService.getOrderSummary(filters.fromDate, filters.toDate),
        dashboardService.getTotalOrder(filters.fromDate, filters.toDate),
        dashboardService.getTopCustomers(filters.fromDate, filters.toDate, filters.topCustomerCount),
        dashboardService.getLatestOrders(filters.latestOrderCount),
        dashboardService.getRevenueMonthly(filters.revenueMonthCount),
        dashboardService.getOrderStatusLogs(filters.logLimit),
      ]);

      if (results[0].status === 'fulfilled') setOrderSummary(results[0].value?.data || null);
      if (results[1].status === 'fulfilled') setTotalOrder(results[1].value?.data || []);
      if (results[2].status === 'fulfilled') setTopCustomers(results[2].value?.data || []);
      if (results[3].status === 'fulfilled') setLatestOrders(results[3].value?.data || []);
      if (results[4].status === 'fulfilled') setRevenueMonthly(results[4].value?.data || []);
      if (results[5].status === 'fulfilled') setStatusLogs(results[5].value?.data || []);

    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi hệ thống khi đồng bộ hóa dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const updateDates = (fromDate, toDate) => {
    setFilters((prev) => ({ ...prev, fromDate, toDate }));
  };

  return {
    loading,
    error,
    filters,
    updateDates,
    refreshData: fetchDashboardData,
    data: {
      orderSummary,
      totalOrder,
      topCustomers,
      latestOrders,
      revenueMonthly,
      statusLogs,
    },
  };
};