import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderService } from '../../services/orderService';
// 🎯 IMPORT THÊM apiBackend ĐỂ ĐIỀU KHIỂN TRỰC TIẾP API IN HÓA ĐƠN
import { apiBackend } from '../../config/axiosClient';

// --- IMPORT CÁC HOOK ĐIỀU KHIỂN DÙNG CHUNG CHUẨN XÁC ---
import { useConfirm } from '../../context/ConfirmContext';
import { useNotification } from '../../context/NotificationContext';

const MEDIA_URL = 'https://113.161.204.185:4010';

const formatAbsoluteDriveLink = (url) => {
  if (!url || url === 'linkgoogledrive') return '';
  const trimmed = String(url).trim();
  return (trimmed.startsWith('http://') || trimmed.startsWith('https://')) ? trimmed : `https://${trimmed}`;
};

const resolveAbsoluteUrl = (fileId) => {
  if (!fileId) return '';
  const idStr = String(fileId).trim();
  if (idStr.startsWith('http://') || idStr.startsWith('https://') || idStr.startsWith('blob:') || idStr.startsWith('data:')) return idStr;
  if (!idStr.includes('/') && !idStr.includes('.')) return `${MEDIA_URL}/api/get/public/${idStr}`;
  return `${MEDIA_URL}${idStr.startsWith('/') ? idStr : `/${idStr}`}`;
};

const safeParseAttachments = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try { return JSON.parse(trimmed); } catch (e) { return [trimmed]; }
    }
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

// 🎯 HÀM GIẢI MÃ PDF ĐÃ ĐƯỢC NÂNG CẤP CHỐNG LỖI CORRUPT FILE (We can't open this file)
const processSmartPdfBlob = async (response) => {
  let resData = response?.data !== undefined ? response.data : response;

  if (resData instanceof Blob) {
    // Rà soát xem Backend có trả về báo lỗi JSON ẩn dưới lốt Blob hay không
    if (resData.type && (resData.type.includes('json') || resData.type.includes('text'))) {
      const text = await resData.text();
      try {
        const json = JSON.parse(text);
        
        // 🚨 Nếu là JSON lỗi, lập tức ném lỗi ra ngoài để ngừng mở PDF Viewer
        if (json.errorCode === 0 || json.statusCode === 400 || json.statusCode === 500) {
          throw new Error(json.message || "Lỗi dữ liệu từ hệ thống, không thể tạo PDF");
        }

        if (json.data && typeof json.data === 'string') {
          const cleanBase64 = json.data.replace(/^data:(.*);base64,/, "");
          const byteCharacters = atob(cleanBase64);
          const byteNumbers = new Uint8Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          return new Blob([byteNumbers], { type: 'application/pdf' });
        }
      } catch (e) {
        // Nếu parse JSON lỗi (SyntaxError) thì chứng tỏ đây là file PDF nhị phân xịn, được phép đi tiếp
        if (!(e instanceof SyntaxError)) {
          throw e;
        }
      }
    }
    // Trả về file nhị phân nguyên bản
    return new Blob([resData], { type: 'application/pdf' });
  } 
  
  if (typeof resData === 'string' || (resData?.data && typeof resData.data === 'string')) {
    const base64String = typeof resData === 'string' ? resData : resData.data;
    const cleanBase64 = base64String.replace(/^data:(.*);base64,/, "");
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([byteNumbers], { type: 'application/pdf' });
  }

  return new Blob([resData], { type: 'application/pdf' });
};

export const useOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [audioNoteUrl, setAudioNoteUrl] = useState('');
  const [logs, setLogs] = useState([]);
  const [history, setHistory] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [pdfViewer, setPdfViewer] = useState({
    isOpen: false,
    pdfUrl: null,
    fileName: '',
    title: ''
  });

  const { confirm } = useConfirm();
  const { showToast } = useNotification();

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await orderService.getLogs({ order_id: id, page: 1, pagesize: 100 });
      if (res?.errorCode === 1) setLogs(res?.data?.rows || []);
    } catch (err) { console.error(err); } finally { setLogsLoading(false); }
  }, [id]);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await orderService.getHistoryUpdate(id);
      if (res?.errorCode === 1) setHistory(res?.data || []);
    } catch (err) { console.error(err); } finally { setHistoryLoading(false); }
  }, [id]);

  const fetchOrderDetail = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await orderService.getDetail(id);
      
      const beData = res?.errorCode !== undefined ? res : (res?.data || res);

      if (beData?.errorCode === 1 && beData?.data) {
        const raw = beData.data;
        
        let formattedDate = '---';
        if (raw.orderdate) {
          const d = new Date(raw.orderdate);
          formattedDate = isNaN(d.getTime()) ? '---' : d.toLocaleDateString('vi-VN');
        }

        if (raw.audionote && raw.audionote !== 'null') {
          setAudioNoteUrl(resolveAbsoluteUrl(raw.audionote));
        } else {
          setAudioNoteUrl('');
        }

        const orderAttachments = safeParseAttachments(raw.attachments || raw.files || raw.general_attachments || raw.images);

        let totalFiles = orderAttachments.length;
        (raw.items || []).forEach((item) => {
          const itemAtts = safeParseAttachments(item.attachments || item.images);
          totalFiles += itemAtts.length;
        });

        let finalCustomerAddress = raw.customer_address;
        if (raw.customer_id) {
          try {
            const { customerService } = await import('../../services/customerService');
            const custRes = await customerService.getDetail(raw.customer_id);
            const custData = custRes?.data?.data || custRes?.data;
            if (custData && custData.address) {
              finalCustomerAddress = custData.address;
            }
          } catch (e) {
            console.error('Không thể lấy địa chỉ khách hàng:', e);
          }
        }

        setOrderData({
          customer: {
            name: raw.customer_fullname || 'Khách hàng lẻ',
            phone: raw.customer_phone || '---',
            createdAt: formattedDate,
            employee: raw.createuser_fullname || 'Hệ thống',
            address: finalCustomerAddress || 'Nhận tại cửa hàng'
          },
          attachments: orderAttachments.map((img, i) => {
            const fId = typeof img === 'string' ? img : (img.id || img.fileId || '');
            const absolutePath = resolveAbsoluteUrl(fId);
            return {
              id: fId,
              name: typeof img === 'object' ? (img.filename || img.name) : `File_Tong_Don_${i + 1}`,
              url: absolutePath,
              previewUrl: absolutePath,
            };
          }),
          products: (raw.items || []).map(item => {
            const itemDriveLink = formatAbsoluteDriveLink(item.linkgoogledrive);

            let rawItemImages = safeParseAttachments(item.attachments || item.images);
            if (rawItemImages.length === 0 && (raw.items || []).length === 1) {
              rawItemImages = orderAttachments;
            }

            return {
              product_id: item.product_id || item.id,
              name: item.product_name || 'Sản phẩm in ấn',
              quantity: Number(item.quantity || 0),
              price: Number(item.unitprice || 0),
              total: Number(item.totalprice || (item.quantity * item.unitprice)),
              note: item.note || '',
              driveLink: itemDriveLink,
              images: (() => {
                const uniqueImageIds = new Set();
                const uniqueImages = [];

                rawItemImages.forEach((img, i) => {
                  const fId = typeof img === 'string' ? img : (img.id || img.fileId || img.path || img.url || '');
                  if (fId && !uniqueImageIds.has(fId)) {
                    uniqueImageIds.add(fId);
                    const absolutePath = resolveAbsoluteUrl(fId);
                    uniqueImages.push({
                      id: fId,
                      name: (typeof img === 'object' ? (img.filename || img.name) : `Thiet_Ke_${i + 1}`),
                      url: absolutePath,
                      previewUrl: absolutePath,
                    });
                  }
                });
                return uniqueImages;
              })(),
            };
          }),
          generalNote: raw.note || 'Không có ghi chú chung.',
          summary: {
            totalFolders: totalFiles || raw.totalfile || 0,
            items: (raw.items || []).map(item => ({ name: item.product_name, qty: item.quantity, price: item.unitprice })),
            totalAmount: Number(raw.totalprice || 0)
          },
          liability: {
            outstanding: Number(raw.customer_outstanding || 0),
            currentOrder: Number(raw.totalprice || 0),
            postOrderTotal: Number(raw.customer_outstanding || 0) + Number(raw.totalprice || 0)
          }
        });
        setStatus(raw.orderstatus_code || 'NEW'); 
      } else {
        showToast(beData?.message || 'Không thể tải dữ liệu đơn hàng.', 'error');
        navigate('/error', { state: { status: 404, message: beData?.message || 'Không tìm thấy dữ liệu đơn hàng hoặc bạn không có quyền truy cập.' } });
      }
    } catch (error) {
      console.error('❌ Lỗi tiến trình xử lý chi tiết đơn hàng:', error);
      const errMsg = error?.response?.data?.message || error?.message || 'Không tìm thấy dữ liệu đơn hàng hoặc bạn không có quyền truy cập.';
      const statusCode = error?.response?.status || error?.statusCode || 404;
      navigate('/error', { state: { status: statusCode, message: errMsg } });
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [id, navigate, showToast]);

  useEffect(() => {
    if (id) fetchOrderDetail();
  }, [id, fetchOrderDetail, refreshKey]);

  const timeline = useMemo(() => {
    const workflow = [
      { id: 'DRAFT', label: 'Lưu nháp', codes: ['DRAFT'] },
      { id: 'NEW', label: 'Chờ xác nhận', codes: ['NEW'] },
      { id: 'AWAIT', label: 'Chờ duyệt', codes: ['AWAIT'] },
      { id: 'DECISION', label: status === 'REJECTED' ? 'Từ chối' : 'Đã duyệt', codes: ['CONFIRMED', 'REJECTED'] },
      { id: 'IN_PROGRESS', label: 'Đang sản xuất', codes: ['IN_PROGRESS'] },
      { id: 'SHIPPING', label: 'Đang giao', codes: ['SHIPPING'] },
      { id: 'FINAL', label: status === 'CANCELED' ? 'Hủy đơn' : 'Hoàn thành', codes: ['DONE', 'CANCELED'] }
    ];
    const currentIndex = workflow.findIndex(w => w.codes.includes(status));
    return workflow.map((step, idx) => {
      const isCurrent = step.codes.includes(status);
      return {
        id: step.id,
        label: isCurrent ? `${step.label} (Hiện tại)` : step.label,
        isCurrent,
        isDone: idx < currentIndex || status === 'DONE'
      };
    });
  }, [status]);

  const executeStatusChange = async (targetStatus, successMsg) => {
    setIsLoading(true);
    try {
        const res = await orderService.changeStatus(id, targetStatus);
        const beData = res?.errorCode !== undefined ? res : (res?.data || res);

        if (beData?.errorCode === 1 || beData?.errorCode === "1" || beData?.statusCode === 200) {
            setStatus(targetStatus); 
            setRefreshKey(prev => prev + 1);
            if (successMsg) showToast(successMsg, 'success');
            await fetchOrderDetail(true); 
        } else { 
            showToast(beData?.message || 'Thao tác cập nhật trạng thái thất bại.', 'error'); 
        }
    } catch (err) { 
        console.error("Execute status change error:", err);
        showToast('Lỗi kết nối máy chủ hệ thống.', 'error'); 
    } finally { 
        setIsLoading(false); 
    }
  };

  return {
    isLoading, status, orderStatus: status, order: orderData || {}, timeline, refreshKey, audioNoteUrl,
    logs, history, logsLoading, historyLoading, fetchLogs, fetchHistory, pdfViewer,
    handleConfirmOrder: () => executeStatusChange(status === 'DRAFT' ? 'NEW' : 'AWAIT', 'Đã chuyển trạng thái đơn hàng!'), 
    handleApproveAndDebit: () => executeStatusChange('CONFIRMED', 'Đã phê duyệt công nợ đơn hàng.'), 
    handleCompleteStage: () => executeStatusChange('REJECTED', 'Đã chuyển đơn hàng vào danh sách từ chối duyệt.'), 
    handleStartProduction: () => executeStatusChange('IN_PROGRESS', 'Đã lệnh xuống xưởng tiến hành sản xuất.'), 
    handleHandoverShipping: () => executeStatusChange('SHIPPING', 'Đã bàn giao đơn sang bộ phận Logistics vận chuyển.'), 
    handleCompleteOrder: async () => {
      setIsLoading(true);
      try {
        const res = await orderService.doneOrder(id);
        const beData = res?.errorCode !== undefined ? res : (res?.data || res);

        if (beData?.errorCode === 1 || beData?.statusCode === 200) {
          setStatus('DONE');
          setRefreshKey(prev => prev + 1);
          showToast('🎉 Đơn hàng đã được quyết toán hoàn thành xuất sắc!', 'success');
        } else {
          showToast(beData?.message || 'Không thể hoàn thành đơn hàng.', 'error');
        }
      } catch (err) { 
        showToast('Lỗi hoàn thành đơn.', 'error'); 
      } finally { 
        setIsLoading(false); 
      }
    }, 
    handleCancelInvoice: async () => {
      setIsLoading(true);
      try {
        const res = await orderService.cancelOrder(id);
        const beData = res?.errorCode !== undefined ? res : (res?.data || res);

        if (beData?.errorCode === 1 || beData?.statusCode === 200) { 
          setStatus('CANCELED'); 
          setRefreshKey(prev => prev + 1); 
          showToast('Đã thực hiện hủy đơn hàng thành công!', 'success');
        } else {
          showToast(beData?.message || 'Yêu cầu hủy đơn thất bại từ hệ thống.', 'error');
        }
      } catch (err) { 
        showToast('Lỗi khi gửi yêu cầu hủy đơn.', 'error'); 
      } finally { 
        setIsLoading(false); 
      }
    }, 
    handleRejectOrder: async () => {
      setIsLoading(true);
      try {
        const res = status === 'DRAFT' ? await orderService.deleteDraft(id) : await orderService.deleteOrder(id);
        const beData = res?.errorCode !== undefined ? res : (res?.data || res);

        if (beData?.errorCode === 1 || beData?.statusCode === 200) { 
          setTimeout(() => navigate('/orders'), 50);
        } else {
          showToast(beData?.message || 'Hệ thống từ chối xóa đơn hàng này.', 'error');
        }
      } catch (err) { 
        showToast('Lỗi hệ thống khi xóa đơn.', 'error'); 
      } finally { 
        setIsLoading(false); 
      }
    }, 
    handleEditOrder: () => navigate(`/orders/edit/${id}`), 
    closePdfViewer: () => {
      if (pdfViewer.pdfUrl) {
        URL.revokeObjectURL(pdfViewer.pdfUrl);
      }
      setPdfViewer({ isOpen: false, pdfUrl: null, fileName: '', title: '' });
    },
    
    // 🎯 FIX: Gọi thẳng apiBackend và gán tham số là { id } thay vì qua orderService
    handlePrintInvoice: async () => {
      if (!id) {
        showToast('Không tìm thấy ID đơn hàng!', 'error');
        return;
      }
      try {
        showToast('Đang trích xuất hóa đơn khách hàng, vui lòng đợi...', 'info');
        
        // Cú pháp chuẩn ép buộc payload là "id" để Backend không báo lỗi
        const response = await apiBackend.post('/order/export-pdf', { id }, { responseType: 'blob' });
        
        const blobData = await processSmartPdfBlob(response);
        const fileURL = URL.createObjectURL(blobData);

        setPdfViewer({
          isOpen: true,
          pdfUrl: fileURL,
          fileName: `Hoa_don_khach_hang_${id}.pdf`,
          title: `Hóa đơn khách hàng - #${id}`
        });
      } catch (error) {
        console.error('Lỗi khi xuất hóa đơn khách hàng!', error);
        showToast(error.message || 'Lỗi dữ liệu trả về từ máy chủ!', 'error');
      }
    }, 
    
    // 🎯 FIX: Tương tự, ép tham số payload là { id }
    handlePrintJobTicket: async () => {
      if (!id) {
        showToast('Không tìm thấy ID đơn hàng!', 'error');
        return;
      }
      try {
        showToast('Đang trích xuất lệnh sản xuất, vui lòng đợi...', 'info');
        
        const response = await apiBackend.post('/order/export-pdf-small', { id }, { responseType: 'blob' });
        
        const blobData = await processSmartPdfBlob(response);
        const fileURL = URL.createObjectURL(blobData);

        setPdfViewer({
          isOpen: true,
          pdfUrl: fileURL,
          fileName: `Lenh_san_xuat_${id}.pdf`,
          title: `Lệnh sản xuất - #${id}`
        });
      } catch (error) {
        console.error('Lỗi khi xuất lệnh sản xuất!', error);
        showToast(error.message || 'Lỗi dữ liệu trả về từ máy chủ!', 'error');
      }
    }, 
    handleBack: () => navigate('/orders')
  };
};