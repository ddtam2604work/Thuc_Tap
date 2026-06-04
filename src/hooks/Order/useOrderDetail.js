import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderService } from '../../services/orderService';

const MEDIA_URL = 'https://113.161.204.185:4010';

const formatAbsoluteDriveLink = (url) => {
  if (!url || url === 'linkgoogledrive') return '';
  const trimmed = String(url).trim();
  return (trimmed.startsWith('http://') || trimmed.startsWith('https://')) ? trimmed : `https://${trimmed}`;
};

const resolveAbsoluteUrl = (fileId) => {
  if (!fileId) return '';
  const idStr = String(fileId).trim();
  if (idStr.startsWith('http://') || idStr.startsWith('https://') || idStr.startsWith('blob:')) return idStr;
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
      if (res?.errorCode === 1 && res?.data) {
        const raw = res.data;
        
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

        // 🌟 KỸ THUẬT: Trích xuất tệp đính kèm cấp ĐƠN HÀNG (để xử lý lỗi 0 folders)
        const orderAttachments = safeParseAttachments(raw.attachments || raw.files || raw.general_attachments || raw.images);

        // ✅ CẬP NHẬT BỘ ĐẾM FILE: Tính tổng cả tệp chung và tệp riêng từng sản phẩm
        let totalFiles = orderAttachments.length;
        (raw.items || []).forEach((item) => {
          const itemAtts = safeParseAttachments(item.attachments || item.images);
          totalFiles += itemAtts.length;
        });

        setOrderData({
          customer: {
            name: raw.customer_fullname || 'Khách hàng lẻ',
            phone: raw.customer_phone || '---',
            createdAt: formattedDate,
            employee: raw.createuser_fullname || 'Hệ thống',
            address: raw.customer_address || raw.noteshipping || 'Nhận tại cửa hàng'
          },
          // 🌟 ÁNH XẠ ATTACHMENTS TỔNG ĐƠN (Sửa lỗi khuyết key truyền sang component con)
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
          // MAPPING SẢN PHẨM IN ẤN
          products: (raw.items || []).map(item => {
            const itemDriveLink = formatAbsoluteDriveLink(item.linkgoogledrive);

            // 🌟 FALLBACK: Nếu sản phẩm không có file riêng, nhưng đơn hàng chỉ có 1 sản phẩm,
            // tự động lấy ảnh tổng đơn đưa vào sản phẩm để hiển thị đẹp mắt trên dòng table.
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
        alert(res?.message || 'Không thể tải dữ liệu đơn hàng.');
        navigate('/orders');
      }
    } catch (error) {
      console.error('❌ Lỗi tiến trình xử lý chi tiết đơn hàng:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [id, navigate]);

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
      if (res?.errorCode === 1 || res?.data?.errorCode === 1) {
        setStatus(targetStatus);
        setRefreshKey(prev => prev + 1);
        if (successMsg) alert(successMsg);
      } else { alert(res?.message || 'Thao tác cập nhật trạng thái thất bại.'); }
    } catch (err) { alert('Lỗi kết nối máy chủ hệ thống.'); } finally { setIsLoading(false); }
  };

  return {
    isLoading, status, orderStatus: status, order: orderData || {}, timeline, refreshKey, audioNoteUrl,
    logs, history, logsLoading, historyLoading, fetchLogs, fetchHistory,
    handleConfirmOrder: () => executeStatusChange(status === 'DRAFT' ? 'NEW' : 'AWAIT', 'Đã chuyển trạng thái đơn hàng!'), 
    handleApproveAndDebit: () => executeStatusChange('CONFIRMED', 'Đã phê duyệt công nợ đơn hàng.'), 
    handleCompleteStage: () => executeStatusChange('REJECTED', 'Đã chuyển đơn hàng vào danh sách từ chối duyệt.'), 
    handleStartProduction: () => executeStatusChange('IN_PROGRESS', 'Đã lệnh xuống xưởng tiến hành sản xuất.'), 
    handleHandoverShipping: () => executeStatusChange('SHIPPING', 'Đã bàn giao đơn sang bộ phận Logistics vận chuyển.'), 
    handleCompleteOrder: async () => {
      setIsLoading(true);
      try {
        const res = await orderService.doneOrder(id);
        if (res?.errorCode === 1 || res?.data?.errorCode === 1) {
          setStatus('DONE');
          setRefreshKey(prev => prev + 1);
          alert('🎉 Đơn hàng đã được quyết toán hoàn thành xuất sắc!');
        }
      } catch (err) { alert('Lỗi hoàn thành đơn.'); } finally { setIsLoading(false); }
    }, 
    handleCancelInvoice: async () => {
      if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
      setIsLoading(true);
      try {
        const res = await orderService.cancelOrder(id);
        if (res?.errorCode === 1 || res?.data?.errorCode === 1) { setStatus('CANCELED'); setRefreshKey(prev => prev + 1); }
      } catch (err) { alert('Lỗi khi gửi yêu cầu hủy đơn.'); } finally { setIsLoading(false); }
    }, 
    handleRejectOrder: async () => {
      const confirmText = status === 'DRAFT' ? 'Xóa vĩnh viễn bản nháp này?' : 'Xác nhận xóa hoàn toàn đơn hàng khỏi hệ thống?';
      if (!window.confirm(confirmText)) return;
      setIsLoading(true);
      try {
        const res = status === 'DRAFT' ? await orderService.deleteDraft(id) : await orderService.deleteOrder(id);
        if (res?.errorCode === 1 || res?.data?.errorCode === 1) { alert('Đã xóa dữ liệu đơn hàng thành công.'); navigate('/orders'); }
      } catch (err) { alert('Lỗi hệ thống khi xóa đơn.'); } finally { setIsLoading(false); }
    }, 
    handleEditOrder: () => navigate(`/orders/edit/${id}`), 
    handlePrintInvoice: async () => {
      try {
        const res = await orderService.exportFullPdf(id);
        window.open(URL.createObjectURL(new Blob([res.data || res], { type: 'application/pdf' })), '_blank');
      } catch (err) { alert('Lỗi kết nối máy ins hóa đơn.'); }
    }, 
    handlePrintJobTicket: async () => {
      try {
        const res = await orderService.exportLimitPdf(id);
        window.open(URL.createObjectURL(new Blob([res.data || res], { type: 'application/pdf' })), '_blank');
      } catch (err) { alert('Lỗi kết nối máy in xưởng sản xuất.'); }
    }, 
    handleBack: () => navigate('/orders')
  };
};