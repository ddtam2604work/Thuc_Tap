import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import axios from 'axios';

// --- IMPORT CÁC HOOK ĐIỀU KHIỂN DÙNG CHUNG ---
import { useConfirm } from '../../context/ConfirmContext';
import { useNotification } from '../../context/NotificationContext';

const MEDIA_URL = 'https://113.161.204.185:4010';

// HELPER 1: Phân giải UUID thành đường dẫn URL tuyệt đối (Giữ nguyên)
const resolveAbsoluteUrl = (fileId) => {
  if (!fileId) return '';
  const idStr = String(fileId).trim();
  
  if (idStr.startsWith('http://') || idStr.startsWith('https://') || idStr.startsWith('blob:')) {
    return idStr;
  }
  if (!idStr.includes('/') && !idStr.includes('.')) {
    return `${MEDIA_URL}/api/get/public/${idStr}`;
  }
  
  const cleanPath = idStr.startsWith('/') ? idStr : `/${idStr}`;
  return `${MEDIA_URL}${cleanPath}`;
};

// HELPER 2: Bộ giải mã chuỗi danh sách ảnh đính kèm từ DB (Giữ nguyên)
const safeParseAttachments = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try { return JSON.parse(trimmed); } catch (e) { /* fallback */ }
    }
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

export const useEditOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [customer, setCustomer] = useState('');
  const [shippingUnit, setShippingUnit] = useState('');
  const [shippingCode, setShippingCode] = useState('');
  const [generalNote, setGeneralNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Quản lý file ghi âm đính kèm 
  const [recordedAudioFile, setRecordedAudioFile] = useState(null);
  const [uploadedAudioFile, setUploadedAudioFile] = useState(null);
  const [existingAudioNoteId, setExistingAudioNoteId] = useState(null);

  const [generalImages, setGeneralImages] = useState([]); // Quản lý ảnh đính kèm chung tổng đơn
  const [catalog, setCatalog] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [products, setProducts] = useState([]);

  // Kích hoạt các công cụ điều khiển thông báo và xác nhận từ Context toàn cục
  const { confirm } = useConfirm();
  const { showToast } = useNotification();

  // Tải chi tiết đơn hàng cũ và map lên Form chỉnh sửa (Giữ nguyên logic unwrap, đổi alert sang showToast)
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setIsLoading(true);
        const res = await orderService.getDetail(id);
        
        // Unwrap Response phòng thủ đồng bộ hệ thống
        const beData = res?.errorCode !== undefined ? res : (res?.data || res);

        if (beData?.errorCode === 1 && beData?.data) {
          const raw = beData.data;
          
          setCustomer(raw.customer_id || ''); 
          setGeneralNote(raw.note || '');
          setOrderStatus(raw.orderstatus_code || 'NEW'); 

          // XỬ LÝ ĐỒNG BỘ FILE GHI ÂM CŨ
          if (raw.audionote && raw.audionote !== 'null') {
            const absoluteAudioUrl = resolveAbsoluteUrl(raw.audionote);
            setExistingAudioNoteId(raw.audionote);
            setUploadedAudioFile({
              id: raw.audionote,
              name: `Ghi_Am_Hien_Tai_${String(raw.audionote).substring(0, 6)}.mp3`,
              url: absoluteAudioUrl,
              previewUrl: absoluteAudioUrl
            });
          }

          // XỬ LÝ ĐỒNG BỘ BỘ ẢNH CHUNG TỔNG ĐƠN
          const orderAttachments = safeParseAttachments(raw.attachments || raw.files || raw.general_attachments || raw.images);
          setGeneralImages(orderAttachments.map((img, i) => {
            const fId = typeof img === 'string' ? img : (img.id || img.fileId || '');
            const absolutePath = resolveAbsoluteUrl(fId);
            return {
              id: fId,
              name: typeof img === 'object' ? (img.filename || img.name) : `Anh_Chung_${i + 1}`,
              previewUrl: absolutePath,
              file: null 
            };
          }));

          // Giải mã thông tin đơn vị giao hàng và mã vận đơn
          if (raw.noteshipping) {
            const parts = raw.noteshipping.split(' - ');
            if (parts.length >= 2) {
              setShippingUnit(parts[0]);
              setShippingCode(parts.slice(1).join(' - '));
            } else {
              setShippingUnit(raw.noteshipping);
              setShippingCode('');
            }
          }

          // Đổ danh sách sản phẩm in ấn hiện tại
          if (raw.items && raw.items.length > 0) {
            setProducts(
              raw.items.map((item, idx) => {
                const itemImages = safeParseAttachments(item.attachments || item.images).map((img, i) => {
                  const fId = typeof img === 'string' ? img : (img.id || img.fileId || img.path || img.url || '');
                  const absolutePath = resolveAbsoluteUrl(fId);
                  return {
                    id: fId, 
                    name: (typeof img === 'object' ? (img.filename || img.name) : `Thiet_Ke_${i + 1}`),
                    previewUrl: absolutePath,
                    file: null 
                  };
                });

                return {
                  id: idx + 1,
                  productId: item.product_id || item.id || '',
                  name: item.product_name || 'Sản phẩm in ấn',
                  quantity: Number(item.quantity || 1),
                  basePrice: Number(item.unitprice || 0),
                  appliedPrice: Number(item.unitprice || 0),
                  note: item.note || '',
                  images: itemImages, 
                  driveLink: (item.linkgoogledrive && item.linkgoogledrive !== 'linkgoogledrive') ? item.linkgoogledrive : ''
                };
              })
            );
          }
        } else {
          showToast(beData?.message || 'Không thể tải dữ liệu đơn hàng.', 'error');
          navigate('/orders');
        }
      } catch (error) {
        console.error('❌ Lỗi tải chi tiết đơn hàng lên form sửa:', error);
      } fileSystem: {
        setIsLoading(false);
      }
    };

    if (id) fetchOrderData();
  }, [id, navigate, showToast]);

  // Tải danh mục sản phẩm hệ thống phục vụ tra cứu nhanh trên dòng (Giữ nguyên)
  useEffect(() => {
    const fetchCatalogData = async () => {
      setIsLoadingCatalog(true);
      try {
        const response = await productService.getPaging({ isactive: '1', page: 1, pagesize: 1000 });
        const beData = response?.errorCode !== undefined ? response : (response?.data || response);
        if (beData?.errorCode === 1 || beData?.statusCode === 200) {
          setCatalog((beData?.data?.items || []).map(item => ({ ...item, price: Number(item.price || 0) })));
        }
      } catch (error) {
        console.error('Lỗi tải danh mục hệ thống:', error);
      } finally {
        setIsLoadingCatalog(false);
      }
    };
    fetchCatalogData();
  }, []);

  const handleAddProduct = useCallback(() => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    setProducts(prev => [...prev, { id: newId, productId: '', name: '', quantity: 1, basePrice: 0, appliedPrice: 0, note: '', images: [], driveLink: '' }]);
  }, [products]);

  const handleRemoveProduct = useCallback((id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleUpdateProduct = useCallback((id, fields) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const incomingProductId = fields.productId || fields.product_id;
        const updated = { ...p, ...fields };

        if (incomingProductId) {
          const catalogItem = catalog.find(
            item => String(item.id || item.product_id) === String(incomingProductId)
          );

          if (catalogItem) {
            const finalName = catalogItem.name || 'Sản phẩm cấu hình';
            const finalPrice = Number(catalogItem.price || 0);

            updated.productId = catalogItem.id || catalogItem.product_id;
            updated.name = finalName;
            updated.basePrice = finalPrice;
            updated.appliedPrice = finalPrice; 
          }
        }
        return updated;
      }
      return p;
    }));
  }, [catalog]);

  const subtotal = useMemo(() => products.reduce((acc, p) => acc + (Number(p.quantity || 0) * Number(p.appliedPrice || 0)), 0), [products]);
  const vat = useMemo(() => 0, []); 
  const total = useMemo(() => subtotal, [subtotal]);

  // Luồng upload ảnh thiết kế đa tệp sang Media Server (Giữ nguyên)
  const uploadDraftImages = useCallback(async (productImages) => {
    if (!productImages || productImages.length === 0) return null;

    const existingImageIds = productImages
      .filter(img => !img.file && img.id)
      .map(img => img.id);

    const filesToUpload = productImages.filter(img => img.file).map(img => img.file);

    if (filesToUpload.length === 0) {
      return existingImageIds.length > 0 ? existingImageIds : null;
    }

    const formData = new FormData();
    filesToUpload.forEach(file => {
      formData.append('files', file);
    });
    formData.append('ispublic', '1');

    try {
      const response = await axios.post(`${MEDIA_URL}/api/upload/image/multi-draft`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (response?.data?.errorCode === 1 && response?.data?.data?.success) {
        const newImageIds = response.data.data.success.map(item => item.id);
        return [...existingImageIds, ...newImageIds];
      }
      return existingImageIds.length > 0 ? existingImageIds : null;
    } catch (error) {
      console.error('❌ Lỗi tiến trình tải ảnh thiết kế lên Media Server:', error);
      return existingImageIds.length > 0 ? existingImageIds : null;
    }
  }, []);

  const uploadAudioNote = useCallback(async (file) => {
    if (!file) return null;
    if (!(file instanceof File) && file.id) return file.id;

    const formData = new FormData();
    formData.append('files', file);
    formData.append('ispublic', '1');
    try {
      const response = await axios.post(`${MEDIA_URL}/api/upload/image/multi-draft`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (response?.data?.errorCode === 1 && response?.data?.data?.success?.[0]?.id) {
        return response.data.data.success[0].id;
      }
      return null;
    } catch (error) {
      console.error('❌ Lỗi tải file ghi âm lên Media Server:', error);
      return null;
    }
  }, []);

  // Xây dựng JSON payload gửi lên Backend chỉnh sửa (Giữ nguyên)
  const buildJsonPayload = useCallback(async (audioId) => {
    const validProducts = products.filter(p => {
      const pId = p.productId || p.product_id;
      return pId && String(pId).trim() !== '';
    });

    const itemsPayload = await Promise.all(validProducts.map(async p => {
      let fileIds = null;
      if (p.images && p.images.length > 0) {
        fileIds = await uploadDraftImages(p.images);
      }

      return {
        product_id: p.productId,
        quantity: Number(p.quantity) || 1,
        unitprice: Number(p.appliedPrice) || 0,
        discount: 0,
        attachments: fileIds, 
        linkgoogledrive: p.driveLink || null,
        metadata: {},
        note: p.note || null
      };
    }));

    let finalGeneralAttachments = null;
    if (generalImages && generalImages.length > 0) {
      finalGeneralAttachments = await uploadDraftImages(generalImages);
    }

    const firstValidDriveLink = products.find(p => p.driveLink && p.driveLink.trim() !== '')?.driveLink || null;

    return {
      id: id, 
      items: itemsPayload,
      attachments: finalGeneralAttachments, 
      note: generalNote || null,
      audionote: audioId,
      noteshipping: shippingUnit || shippingCode ? `${shippingUnit} - ${shippingCode}`.trim() : null,
      linkgoogledrive: firstValidDriveLink, 
    };
  }, [id, products, generalImages, generalNote, shippingUnit, shippingCode, uploadDraftImages]);

  // =================================================================
  // LUỒNG XỬ LÝ LƯU CẬP NHẬT THÔNG TIN ĐƠN HÀNG TỔNG QUÁT
  // =================================================================
  const handleUpdateOrderSubmit = async (e) => {
    if (e) e.preventDefault();
    
    const hasValidProduct = products.some(p => p.productId && String(p.productId).trim() !== '');
    // 🛠️ ĐIỀU CHỈNH: Đổi alert thành Toast Warning
    if (!hasValidProduct) return showToast('Danh sách sản phẩm không được để trống!', 'warning');

    setIsSubmitting(true);
    try {
      const currentAudioFile = recordedAudioFile || uploadedAudioFile;
      let finalAudioId = null;

      if (currentAudioFile) {
        if (currentAudioFile instanceof File || currentAudioFile.file) {
          finalAudioId = await uploadAudioNote(currentAudioFile instanceof File ? currentAudioFile : currentAudioFile.file);
        } else {
          finalAudioId = currentAudioFile.id || existingAudioNoteId;
        }
      }

      const jsonPayload = await buildJsonPayload(finalAudioId);
      let res;
      const isDraft = orderStatus?.toUpperCase() === 'DRAFT';
      
      if (isDraft) {
        res = await orderService.saveDraft(jsonPayload);
      } else {
        res = await orderService.updateOrder(jsonPayload);
        if ((res?.errorCode === 1 || res?.data?.errorCode === 1) && orderStatus) {
          await orderService.changeStatus(id, orderStatus);
        }
      }

      // Unwrap Response đồng bộ hệ thống chống lỗi lệch key
      const beData = res?.errorCode !== undefined ? res : (res?.data || res);

      if (beData?.errorCode === 1 || beData?.statusCode === 200) {
        // 🛠️ ĐIỀU CHỈNH: Áp dụng showToast dạng success thay thế alert()
        showToast('Đã cập nhật thông tin đơn hàng thành công!', 'success');
        
        // 🛠️ GIẢI QUYẾT RACE CONDITION: Tạo khoảng trễ nhỏ (50ms) cho State kịp hiển thị Toast trước khi Unmount điều hướng
        if (isDraft) setTimeout(() => navigate('/orders'), 50);
        else setTimeout(() => navigate(`/orders/${id}`), 50);
      } else {
        showToast(beData?.message || 'Cập nhật thất bại từ hệ thống.', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Lỗi kết nối máy chủ chỉnh sửa.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =================================================================
  // LUỒNG XỬ LÝ CẬP NHẬT DỮ LIỆU BẢN NHÁP
  // =================================================================
  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      const currentAudioFile = recordedAudioFile || uploadedAudioFile;
      let finalAudioId = null;

      if (currentAudioFile) {
        if (currentAudioFile instanceof File || currentAudioFile.file) {
          finalAudioId = await uploadAudioNote(currentAudioFile instanceof File ? currentAudioFile : currentAudioFile.file);
        } else {
          finalAudioId = currentAudioFile.id || existingAudioNoteId;
        }
      }

      const jsonPayload = await buildJsonPayload(finalAudioId);
      const res = await orderService.saveDraft(jsonPayload);
      
      const beData = res?.errorCode !== undefined ? res : (res?.data || res);

      if (beData?.errorCode === 1 || beData?.statusCode === 200) {
        // 🛠️ ĐIỀU CHỈNH: Áp dụng showToast dạng success thay thế alert() theo yêu cầu đặc tả đơn hàng mẫu
        showToast('Đã cập nhật dữ liệu vào bản nháp thành công! 📝', 'success');
        setTimeout(() => navigate('/orders'), 50);
      } else {
        showToast(beData?.message || 'Không thể lưu bản nháp.', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Lỗi kết nối máy chủ khi lưu bản nháp.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    customer, setCustomer, shippingUnit, setShippingUnit, shippingCode, setShippingCode, generalNote, setGeneralNote,
    products, catalog, isLoadingCatalog, generalImages, setGeneralImages, recordedAudioFile, setRecordedAudioFile, uploadedAudioFile, setUploadedAudioFile,
    handleAddProduct, handleRemoveProduct, handleUpdateProduct, subtotal, vat, total, handleUpdateOrderSubmit, handleSaveDraft, isSubmitting, isLoading, orderStatus
  };
};