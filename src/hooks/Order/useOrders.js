import { useState, useEffect, useCallback, useMemo } from 'react';
import { orderService } from '../../services/orderService';

// 🌟 HELPER 1: Bộ giải mã chuỗi linh hoạt (Xử lý an toàn chuỗi JSON array hoặc chuỗi ngăn cách dấu phẩy từ DB)
const safeParseAttachments = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        return [trimmed];
      }
    }
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

// 🌟 HELPER 2: Chuẩn hóa link Google Drive tuyệt đối bảo vệ an toàn định dạng URL
const formatAbsoluteDriveLink = (url) => {
  if (!url || url === 'linkgoogledrive' || url === 'null' || String(url).trim() === '') return '';
  const trimmed = String(url).trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export const useOrders = () => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchKey, setSearchKey] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('month');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20); 

  const [orders, setOrders] = useState([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState({});
  const [statusMapIds, setStatusMapIds] = useState({}); 
  const [isLoading, setIsLoading] = useState(false);

  // Khởi tạo bảng ánh xạ Master Data trạng thái từ Backend
  useEffect(() => {
    const fetchStatusMasterData = async () => {
      try {
        const responseStatus = await orderService.getAllStatuses();
        const { errorCode, data } = responseStatus || {};
        if (errorCode === 1 && Array.isArray(data)) {
          const mapping = {};
          data.forEach(({ code, id }) => {
            mapping[code.toUpperCase()] = id; 
          });
          setStatusMapIds(mapping);
        }
      } catch (err) {
        console.error('Không thể khởi tạo danh sách ID trạng thái', err);
      }
    };
    fetchStatusMasterData();
  }, []);

  // Tính toán bộ lọc thời gian tác nghiệp
  const calculateDateFilters = useCallback(() => {
    const now = new Date();
    const format = (d) => d.toISOString().split('T')[0];

    let fromDate = new Date();
    let toDate = new Date();

    if (dateFilter === 'today') {
      fromDate = now;
      toDate = now;
    } else if (dateFilter === 'month') {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (dateFilter === 'year') {
      fromDate = new Date(now.getFullYear(), 0, 1);
      toDate = new Date(now.getFullYear(), 12, 0);
    }

    return {
      from_createdate: format(fromDate),
      to_createdate: format(toDate)
    };
  }, [dateFilter]);

  // Hàm nạp dữ liệu chính phân trang đơn hàng
  const loadPagingOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const { from_createdate, to_createdate } = calculateDateFilters();
      
      let selectedId = "";
      if (activeTab !== 'ALL') {
        selectedId = statusMapIds[activeTab.toUpperCase()] || "";
      } else if (statusFilter !== 'all') {
        selectedId = statusMapIds[statusFilter.toUpperCase()] || "";
      }

      const apiPayload = {
        orderstatuses_id: selectedId || null,
        search: appliedSearch.trim() || null,
        from_createdate,
        to_createdate,
        page: currentPage,
        pagesize: pageSize
      };

      const apiResponse = await orderService.getPaging(apiPayload); 
      const { errorCode, data: innerData } = apiResponse || {};

      if (errorCode === 1 && innerData) {
        const { items, total, status_totals } = innerData;

        // 🌟 NÂNG CẤP CHUẨN SENIOR: Quét đồng bộ hóa đa kênh toàn bộ aliases trường dữ liệu từ Backend
        const normalizedOrders = (items || []).map((item) => {
          
          // 1. Quét tìm danh sách sản phẩm con thông qua mọi bí danh khả dĩ
          const childProducts = item.items || item.products || item.order_items || [];
          let childFilesCount = 0;
          let childDriveLink = '';

          if (Array.isArray(childProducts)) {
            childProducts.forEach(product => {
              // Đếm số lượng file ảnh từ sản phẩm con
              const attachments = safeParseAttachments(product.attachments || product.images || product.files);
              childFilesCount += attachments.length;

              // 🎙️ Dò tìm link Drive ẩn trong sản phẩm con qua mọi aliases cấu hình khả dĩ
              if (!childDriveLink) {
                const pLink = product.linkgoogledrive || product.drive_link || product.link_google_drive || product.googledrive_link;
                if (pLink && pLink !== 'linkgoogledrive' && pLink !== 'null' && String(pLink).trim() !== '') {
                  childDriveLink = String(pLink).trim();
                }
              }
            });
          }

          // Quyết định số lượng file hiển thị
          const rootFilesCount = Number(item.totalfile || item.total_file || 0);
          const displayTotalFiles = rootFilesCount > 0 ? rootFilesCount : childFilesCount;

          // 2. Dò tìm link Drive ở cấp độ tổng đơn thông qua mọi aliases hệ thống khả dĩ
          let parentDriveLink = '';
          const potentialParentLinks = [item.linkgoogledrive, item.drive_link, item.googledrive_link, item.link_google_drive];
          
          for (const link of potentialParentLinks) {
            if (link && link !== 'linkgoogledrive' && link !== 'null' && String(link).trim() !== '') {
              parentDriveLink = String(link).trim();
              break;
            }
          }

          // 🌟 QUYẾT ĐỊNH ĐƯỜNG LINK CUỐI CÙNG: Ưu tiên cấp cha, nếu trống tự động dùng link fallback từ con
          const rawDriveLink = parentDriveLink || childDriveLink;
          const finalDriveLink = formatAbsoluteDriveLink(rawDriveLink);

          return {
            ...item,
            totalfile: displayTotalFiles, 
            totalFiles: displayTotalFiles, 
            linkgoogledrive: finalDriveLink, // Ghi đè chính xác trường gốc phục vụ OrderTable hiển thị biểu tượng 📁
            cleanDriveLink: finalDriveLink, 
            totalAmountNumber: Number(item.totalamount || item.totalprice || 0)
          };
        });

        setOrders(normalizedOrders);
        setTotalOrdersCount(total || 0);

        if (Array.isArray(status_totals)) {
          const mappedCounts = {};
          let accumulatedAll = 0;
          
          status_totals.forEach(({ code, total_order }) => {
            const statusCode = code.toUpperCase();
            mappedCounts[statusCode] = total_order || 0;
            accumulatedAll += total_order || 0;
          });
          
          mappedCounts['ALL'] = accumulatedAll;
          setStatusCounts(mappedCounts);
        }
      } else {
        setOrders([]);
        setTotalOrdersCount(0);
      }
    } catch (error) {
      console.error('Lỗi nạp danh sách dữ liệu phân trang:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, appliedSearch, activeTab, statusFilter, statusMapIds, calculateDateFilters]);

  useEffect(() => {
    if (Object.keys(statusMapIds).length > 0) {
      loadPagingOrders();
    }
  }, [loadPagingOrders, statusMapIds]);

  return {
    activeTab,
    setActiveTab: (tabId) => { setActiveTab(tabId); setCurrentPage(1); },
    searchKey,
    setSearchKey,
    dateFilter,
    setDateFilter: (val) => { setDateFilter(val); setCurrentPage(1); },
    statusFilter,
    setStatusFilter: (val) => { setStatusFilter(val); setCurrentPage(1); },
    orders,
    totalOrdersCount,
    currentViewCount: orders.length,
    currentPage,
    setCurrentPage,
    totalPages: Math.ceil(totalOrdersCount / pageSize) || 1,
    isLoading,
    statusCounts,
    handleSearchSubmit: (e) => { if (e) e.preventDefault(); setAppliedSearch(searchKey); setCurrentPage(1); },
    handleExportPdf: async (orderId) => {
      try {
        const res = await orderService.exportFullPdf(orderId);
        window.open(URL.createObjectURL(new Blob([res.data || res], { type: 'application/pdf' })), '_blank');
      } catch (err) { alert('Lỗi xuất file PDF.'); }
    },
    handleDeleteOrder: async (id) => {
      if (!window.confirm('Xóa đơn hàng này?')) return;
      try {
        const res = await orderService.deleteOrder(id);
        if (res?.errorCode === 1 || res?.data?.errorCode === 1) loadPagingOrders();
      } catch (err) { alert('Lỗi xóa đơn.'); }
    },
    handleCancelOrder: async (id) => {
      if (!window.confirm('Hủy đơn hàng này?')) return;
      try {
        const res = await orderService.cancelOrder(id);
        if (res?.errorCode === 1 || res?.data?.errorCode === 1) loadPagingOrders();
      } catch (err) { alert('Lỗi hủy đơn.'); }
    }
  };
};