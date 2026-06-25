// =========================================================================
// FILE: src/pages/Dashboard/DashboardPage.jsx
// =========================================================================
import React from 'react';
import { useDashboard } from '../../hooks/Dashboard/useDashboard';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { loading, error, filters, updateDates, data, refreshData } = useDashboard();
  const navigate = useNavigate();

  // Nhận dữ liệu sạch đã bóc tách từ Hook (GIỮ NGUYÊN HOÀN TOÀN)
  const summary = data.orderSummary || {};
  const totalOrderList = data.totalOrder || [];
  const topCustomersList = data.topCustomers || [];
  const latestOrdersList = data.latestOrders || [];
  const revenueMonths = data.revenueMonthly || [];
  const activityLogs = data.statusLogs || [];

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '15px' }}>Đang đồng bộ dữ liệu thời gian thực...</div>;
  }

  if (error) {
    return <div style={{ padding: '24px', color: '#ef4444', textAlign: 'center' }}>Hệ thống gặp sự cố: {error}</div>;
  }

  // =========================================================================
  // LOGIC XỬ LÝ DỮ LIỆU THỰC TẾ CHO BIỂU ĐỒ 1 & 2 (DONUT CHART - GIỮ NGUYÊN)
  // =========================================================================
  const detailOrders = summary.detail_created_order || [];
  
  const groupUnproductiveCodes = ['DRAFT', 'NEW', 'AWAIT', 'REJECTED', 'CANCELED'];
  const groupProductiveCodes = ['CONFIRMED', 'IN_PROGRESS', 'SHIPPING', 'DONE'];

  const unprodOrders = detailOrders.filter(item => groupUnproductiveCodes.includes(item.orderstatus_code));
  const prodOrders = detailOrders.filter(item => groupProductiveCodes.includes(item.orderstatus_code));

  const totalUnprodCount = unprodOrders.reduce((sum, item) => sum + item.total_order, 0);
  const totalProdCount = prodOrders.reduce((sum, item) => sum + item.total_order, 0);

  const getPercentage = (partial, total) => {
    if (!total) return 0;
    return ((partial / total) * 100).toFixed(1);
  };

  // =========================================================================
  // LOGIC ĐIỀU CHỈNH ĐỘ CAO ĐỒ THỊ DOANH THU THỰC TẾ (BAR CHART - GIỮ NGUYÊN)
  // =========================================================================
  const maxRevenueInDataset = Math.max(...revenueMonths.map(m => Math.max(m.total_revenue, m.total_payment)), 1);

  const formatMonthLabel = (monthStr) => {
    if (!monthStr) return '';
    const parts = monthStr.split('-');
    return parts.length > 1 ? `T${parts[1]}` : monthStr;
  };

  const getLogIconAndColor = (actionType) => {
    switch (actionType) {
      case 'DELETE': return { icon: '🗑️', bg: '#fee2e2' };
      case 'CREATE': return { icon: '📋', bg: '#e0f2fe' };
      case 'STATUS_CHANGE': 
      case 'STATUS_CHANGE_CONFIRMED': return { icon: '🔄', bg: '#fef3c7' };
      default: return { icon: '📝', bg: '#e6f4ea' };
    }
  };

  const formatLogDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const hour = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${hour}:${min} ${day}-${month}`;
  };

  return (
    <div className="w-full min-h-screen bg-[#f3f4f6] p-3 sm:p-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* 1. TOP HEADER ACTION SUB-BAR (Hỗ trợ Wrap tự đổ dòng trên mobile) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3 sm:p-5 rounded-lg mb-4 gap-3 shadow-xs">
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          Tổng quan hệ thống 📊
        </h2>
        <div className="w-full sm:w-auto">
          <select 
            value={`${filters.fromDate}|${filters.toDate}`}
            className="w-full sm:w-auto outline-none"
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff', color: '#334155', cursor: 'pointer' }}
            onChange={(e) => {
              const [start, end] = e.target.value.split('|');
              updateDates(start, end);
            }}
          >
            <option value="2026-04-04|2026-05-04">Chu kỳ hiện tại (30 ngày)</option>
          </select>
        </div>
      </div>

      {/* 2. FOUR REAL COUNTER METRICS ROW (Responsive chuyển từ phẳng sang grid tầng dốc) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📄</div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{summary.total_created_order || 0}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Tổng đơn phát sinh</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>✅</div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{summary.done_revenue_order_count || 0}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Đơn hoàn thành</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🕒</div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{summary.in_progress_revenue_order_count || 0}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Đơn đang sản xuất</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>💰</div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>
              {Number(summary.total_revenue || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Doanh thu kỳ này (VND)</div>
          </div>
        </div>

      </div>

      {/* 3. MAIN WORKSPACE: Sử dụng grid responsive linh hoạt, tự động đưa sidebar xuống dưới trên tablet/mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">
        
        {/* ================= LEFT MAIN CONTAINER ================= */}
        <div className="flex flex-col gap-4 w-full min-w-0">
          
          {/* REAL DYNAMIC DONUT CHARTS PANEL (Tự động xếp dọc 1 cột trên mobile và ipad) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Chart Block 1: Chưa tạo doanh thu */}
            <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600', color: '#334155' }}>1. Đơn hàng chưa tạo doanh thu</h4>
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div style={{ position: 'relative', width: '120px', height: '120px' }} className="shrink-0">
                  <svg width="100%" height="100%" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e2e8f0" strokeWidth="4"></circle>
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f97316" strokeWidth="4" strokeDasharray="60 40" strokeDashoffset="25"></circle>
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>{totalUnprodCount}</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Đơn</div>
                  </div>
                </div>
                <div className="flex-1 w-full flex flex-col gap-1" style={{ fontSize: '11px', color: '#475569' }}>
                  {unprodOrders.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <i style={{ width: '8px', height: '8px', backgroundColor: item.orderstatus_color, display: 'inline-block', borderRadius: '50%' }}></i>
                        {item.orderstatus_name}
                      </span>
                      <strong>{item.total_order} ({getPercentage(item.total_order, totalUnprodCount)}%)</strong>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '4px', marginTop: '4px', textAlign: 'right', fontSize: '10px', color: '#94a3b8' }}>Tổng: {totalUnprodCount} đơn</div>
                </div>
              </div>
            </div>

            {/* Chart Block 2: Đã tạo doanh thu */}
            <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600', color: '#334155' }}>2. Đơn hàng tạo doanh thu</h4>
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div style={{ position: 'relative', width: '120px', height: '120px' }} className="shrink-0">
                  <svg width="100%" height="100%" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e2e8f0" strokeWidth="4"></circle>
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray="70 30" strokeDashoffset="25"></circle>
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>{totalProdCount}</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Đơn</div>
                  </div>
                </div>
                <div className="flex-1 w-full flex flex-col gap-1" style={{ fontSize: '11px', color: '#475569' }}>
                  {prodOrders.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <i style={{ width: '8px', height: '8px', backgroundColor: item.orderstatus_color, display: 'inline-block', borderRadius: '50%' }}></i>
                        {item.orderstatus_name}
                      </span>
                      <strong>{item.total_order} ({getPercentage(item.total_order, totalProdCount)}%)</strong>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '4px', marginTop: '4px', textAlign: 'right', fontSize: '10px', color: '#94a3b8' }}>Tổng: {totalProdCount} đơn</div>
                </div>
              </div>
            </div>

          </div>

          {/* DYNAMIC MONTHLY REVENUE BAR CHART (Bảo vệ chống tràn trục Ngang bằng overflow-x-auto) */}
          <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#334155' }}>📈 Doanh thu theo tháng và tổng thanh toán</h4>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><i style={{ width: '10px', height: '10px', backgroundColor: '#3b82f6', display: 'inline-block', borderRadius: '2px' }}></i> Doanh thu</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><i style={{ width: '10px', height: '10px', backgroundColor: '#10b981', display: 'inline-block', borderRadius: '2px' }}></i> Đã thu</span>
              </div>
            </div>
            
            <div className="w-full overflow-x-auto scrollbar-none">
              <div className="min-w-[480px] sm:min-w-0 position-relative h-[180px] flex justify-around items-flex-end padding-0-10" style={{ position: 'relative', height: '180px', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', padding: '0 10px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: '25%', borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }}></div>
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: '50%', borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }}></div>
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: '75%', borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }}></div>

                {revenueMonths.map((item, idx) => {
                  const revenueHeight = (item.total_revenue / maxRevenueInDataset) * 140;
                  const paymentHeight = (item.total_payment / maxRevenueInDataset) * 140;

                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '70px', zIndex: 2 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '140px' }}>
                        <div 
                          title={`Doanh thu: ${item.total_revenue.toLocaleString()}đ`}
                          style={{ width: '18px', backgroundColor: '#3b82f6', height: `${Math.max(revenueHeight, 2)}px`, borderRadius: '3px 3px 0 0', transition: 'all 0.3s', cursor: 'pointer' }}
                        ></div>
                        <div 
                          title={`Đã thu: ${item.total_payment.toLocaleString()}đ`}
                          style={{ width: '18px', backgroundColor: '#10b981', height: `${Math.max(paymentHeight, 2)}px`, borderRadius: '3px 3px 0 0', transition: 'all 0.3s', cursor: 'pointer' }}
                        ></div>
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>{formatMonthLabel(item.month)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* LATEST ORDERS DATATABLE */}
          <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#334155' }}>🕒 Đơn hàng gần nhất</h4>
              <button onClick={refreshData} style={{ background: 'none', border: 'none', color: '#1a73e8', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                Làm mới dữ liệu
              </button>
            </div>
            <div className="w-full overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '500px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '10px 8px' }}>MÃ ĐƠN</th>
                    <th style={{ padding: '10px 8px' }}>KHÁCH HÀNG</th>
                    <th style={{ padding: '10px 8px' }}>GIÁ TRỊ</th>
                    <th style={{ padding: '10px 8px' }}>TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody>
                  {latestOrdersList.map((order, i) => (
                    <tr key={order.id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', color: '#1a73e8', fontWeight: '500' }}>{order.code}</td>
                      <td style={{ padding: '10px 8px', color: '#334155', fontWeight: '500' }}>{order.customer_fullname || 'N/A'}</td>
                      <td style={{ padding: '10px 8px', fontWeight: '600', color: '#1a73e8' }}>
                        {Number(order.totalamount || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{ 
                          backgroundColor: `${order.orderstatus_color}15`, 
                          color: order.orderstatus_color, 
                          padding: '3px 8px', 
                          borderRadius: '4px', 
                          fontWeight: '600', 
                          fontSize: '11px' 
                        }}>
                          {order.orderstatus_name}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ================= RIGHT SIDEBAR CONTAINER ================= */}
        <div className="flex flex-col gap-4 w-full">
          
          {/* QUICK ACTIONS */}
          <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600', color: '#334155' }}>⚡ Thao tác nhanh</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button onClick={() => navigate('/orders/create')} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '12px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>🛒 Tạo đơn mới</button>
              <button onClick={() => navigate('/customers', { state: { openAddModal: true } })} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '12px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>👤 Thêm khách</button>
              
              <button style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '12px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>💵 Lập phiếu thu</button>
              <button style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '12px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>📊 Báo cáo</button>
            </div>
          </div>

          {/* TOP CUSTOMERS */}
          <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600', color: '#334155' }}>🏆 Top khách hàng chi tiêu</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topCustomersList.length > 0 ? (
                topCustomersList.map((cust, i) => {
                  const maxSpent = Math.max(...topCustomersList.map(c => c.total_spent || 1), 1);
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                      <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: i === 0 ? '#fef3c7' : '#f1f5f9', color: i === 0 ? '#d97706' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px' }}>
                        {i + 1}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <span style={{ fontWeight: '500', color: '#334155' }}>{cust.customer_name}</span>
                          <span style={{ color: '#2563eb', fontWeight: '600' }}>{Number(cust.total_spent || 0).toLocaleString()}đ</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${((cust.total_spent || 0) / maxSpent) * 100}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: '3px' }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textStyle: 'italic', fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>Không có dữ liệu mua hàng trong kỳ.</div>
              )}
            </div>
          </div>

          {/* RECENT STATUS LOGS TIMELINE */}
          <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600', color: '#334155' }}>🔔 Hoạt động gần đây</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
              {activityLogs.map((log, idx) => {
                const badge = getLogIconAndColor(log.action_type);
                return (
                  <div key={log.id || idx} style={{ display: 'flex', gap: '8px', fontSize: '11px', borderBottom: '1px dashed #f1f5f9', paddingBottom: '8px' }}>
                    <div style={{ minWidth: '20px', height: '20px', borderRadius: '4px', backgroundColor: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                      {badge.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#1e293b', fontWeight: '600' }}>{log.order_code}</div>
                      <div style={{ color: '#475569', fontSize: '11px', margin: '2px 0', lineHeight: '1.4' }}>{log.note}</div>
                      <div style={{ color: '#94a3b8', fontSize: '10px', textAlign: 'right' }}>{formatLogDate(log.logdate)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardPage;