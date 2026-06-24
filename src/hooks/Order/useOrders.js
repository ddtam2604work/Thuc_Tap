import { useState, useEffect, useCallback, useMemo } from 'react';
import { orderService } from '../../services/orderService';

// 🌟 HELPER 1: Bộ giải mã chuỗi linh hoạt
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
  if (!url) return '';
  const trimmedStr = String(url).trim();
  const lowerUrl = trimmedStr.toLowerCase();
  
  // Tránh hiển thị các chuỗi text rác mặc định của DB
  // 🎯 ĐIỀU CHỈNH: Thêm bộ lọc chuỗi mặc định 'linkgoogledrive' để loại trừ hiển thị text placeholder ra UI danh sách
  if (lowerUrl === 'null' || lowerUrl === 'undefined' || lowerUrl === '---' || lowerUrl === '-' || lowerUrl === 'linkgoogledrive') {
    return '';
  }
  
  if (trimmedStr.startsWith('http://') || trimmedStr.startsWith('https://')) {
    return trimmedStr;
  }
  return `https://${trimmedStr}`;
};

export const useOrders = () => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchKey, setSearchKey] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('month');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20); 

  // 🌟 KHỞI TẠO 2 TRƯỜNG TỪ NGÀY - ĐẾN NGÀY (Mặc định giữ giá trị của tháng hiện tại)
  const [fromDate, setFromDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  });

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

    let fDate = new Date();
    let tDate = new Date();

    if (dateFilter === 'today') {
      fDate = now;
      tDate = now;
    } else if (dateFilter === 'month') {
      return {
        from_createdate: fromDate,
        to_createdate: toDate
      };
    } else if (dateFilter === 'year') {
      fDate = new Date(now.getFullYear(), 0, 1);
      tDate = new Date(now.getFullYear(), 12, 0);
    }

    return {
      from_createdate: format(fDate),
      to_createdate: format(tDate)
    };
  }, [dateFilter, fromDate, toDate]);

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

        const normalizedOrders = (items || []).map((item) => {
          const childProducts = item.items || item.products || item.order_items || [];
          let childFilesCount = 0;
          let childDriveLink = '';

          if (Array.isArray(childProducts)) {
            childProducts.forEach(product => {
              const attachments = safeParseAttachments(product.attachments || product.images || product.files);
              childFilesCount += attachments.length;

              if (!childDriveLink) {
                const pLink = product.linkgoogledrive || product.drive_link || product.link_google_drive || product.googledrive_link;
                if (pLink && pLink !== 'null' && String(pLink).trim() !== '') {
                  childDriveLink = String(pLink).trim();
                }
              }
            });
          }

          const rootFilesCount = Number(item.totalfile || item.total_file || 0);
          const displayTotalFiles = rootFilesCount > 0 ? rootFilesCount : childFilesCount;

          let parentDriveLink = '';
          const potentialParentLinks = [item.linkgoogledrive, item.drive_link, item.googledrive_link, item.link_google_drive];
          
          for (const link of potentialParentLinks) {
            if (link && link !== 'null' && String(link).trim() !== '') {
              parentDriveLink = String(link).trim();
              break;
            }
          }

          const rawDriveLink = parentDriveLink || childDriveLink;
          const finalDriveLink = formatAbsoluteDriveLink(rawDriveLink);

          return {
            ...item,
            totalfile: displayTotalFiles, 
            totalFiles: displayTotalFiles, 
            linkgoogledrive: finalDriveLink, 
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

  // Logic instant search
  useEffect(() => {
    setAppliedSearch(searchKey);
    setCurrentPage(1);
  }, [searchKey]);

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
    fromDate,
    setFromDate: (val) => { setFromDate(val); setCurrentPage(1); },
    toDate,
    setToDate: (val) => { setToDate(val); setCurrentPage(1); },
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
    handleCancelOrder: async (id) => {
      if (!window.confirm('Hủy đơn hàng này?')) return;
      try {
        const res = await orderService.cancelOrder(id);
        if (res?.errorCode === 1 || res?.data?.errorCode === 1) loadPagingOrders();
      } catch (err) { alert('Lỗi hủy đơn.'); }
    }
  };
};