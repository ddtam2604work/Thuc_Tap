import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService'; 
import { productService } from '../../services/productService';
import axios from 'axios';

import { useConfirm } from '../../context/ConfirmContext';
import { useNotification } from '../../context/NotificationContext';

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'https://113.161.204.185:4010';
 
export const useCreateOrder = (existingDraftId = null) => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState('');
  const [shippingUnit, setShippingUnit] = useState('');
  const [shippingCode, setShippingCode] = useState('');
  const [generalNote, setGeneralNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftId, setDraftId] = useState(existingDraftId);
  
  const [generalImages, setGeneralImages] = useState([]);
  const [recordedAudioFile, setRecordedAudioFile] = useState(null); // Chỉ giữ lại luồng ghi âm trực tiếp

  const [catalog, setCatalog] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [products, setProducts] = useState([
    { id: 1, productId: '', name: '', quantity: 1, basePrice: 0, appliedPrice: 0, note: '', images: [], driveLink: '' }
  ]);

  const { confirm } = useConfirm();
  const { showToast } = useNotification();

  useEffect(() => {
    const fetchCatalogData = async () => {
      setIsLoadingCatalog(true);
      try {
        const response = await productService.getPaging({ isactive: '1', page: 1, pagesize: 1000 });
        const beData = response?.errorCode !== undefined ? response : (response?.data || response);
        
        if (beData?.errorCode === 1 || beData?.statusCode === 200) {
          setCatalog((beData?.data?.items || []).map(item => ({ 
            ...item, 
            price: Number(item.price || 0)
          })));
        }
      } catch (error) { 
        console.error('❌ Lỗi tải danh mục sản phẩm hệ thống:', error); 
      } finally { 
        setIsLoadingCatalog(false); 
      }
    };
    fetchCatalogData();
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
            const currentQty = Number(updated.quantity || 1);

            updated.productId = catalogItem.id || catalogItem.product_id;
            updated.product_id = catalogItem.id || catalogItem.product_id;
            updated.name = finalName;
            updated.basePrice = finalPrice;
            updated.price = finalPrice;
            updated.appliedPrice = currentQty * finalPrice;
            updated.applied_price = currentQty * finalPrice;
          }
        }
        return updated;
      }
      return p;
    }));
  }, [catalog]);

  const handleAddProduct = useCallback(() => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    setProducts(prev => [...prev, { id: newId, productId: '', name: '', quantity: 1, basePrice: 0, appliedPrice: 0, note: '', images: [], driveLink: '' }]);
  }, [products]);

  const handleRemoveProduct = useCallback((id) => {
    setProducts(prev => {
      const target = prev.find(p => p.id === id);
      if (target?.images) target.images.forEach(img => URL.revokeObjectURL(img.previewUrl));
      return prev.filter(p => p.id !== id);
    });
  }, []);

  const subtotal = useMemo(() => products.reduce((acc, p) => acc + (Number(p.quantity || 0) * Number(p.appliedPrice || p.price || 0)), 0), [products]);
  const total = useMemo(() => subtotal, [subtotal]);

  const uploadDraftImages = useCallback(async (productImages) => {
    if (!productImages || productImages.length === 0) return null;
    const existingImageIds = productImages.filter(img => !img.file && img.id).map(img => img.id);
    const filesToUpload = productImages.filter(img => img.file).map(img => img.file);

    if (filesToUpload.length === 0) return existingImageIds.length > 0 ? existingImageIds : null;

    const formData = new FormData();
    filesToUpload.forEach(file => formData.append('files', file));
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
      return existingImageIds.length > 0 ? existingImageIds : null;
    }
  }, []);

  const uploadAudioNote = useCallback(async (file) => {
    if (!file) return null;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
    });
  }, []);

  // Xử lý đơn lẻ mã hóa file ghi âm sang Base64
  const processAudioNoteToBase64 = useCallback(async () => {
    if (!recordedAudioFile) return null;
    if (typeof recordedAudioFile === 'string') return recordedAudioFile;
    return await uploadAudioNote(recordedAudioFile);
  }, [recordedAudioFile, uploadAudioNote]);

  const buildFormDataPayload = useCallback((statusMode = 'NEW', audioNoteId = null) => {
    const formData = new FormData();
    formData.append('customer_id', customer);
    formData.append('shipping_unit', (shippingUnit || '').trim());
    formData.append('shipping_code', (shippingCode || '').trim());
    formData.append('general_note', (generalNote || '').trim());
    formData.append('subtotal', String(subtotal));
    formData.append('total', String(total));
    formData.append('status_mode', statusMode); 
    
    const firstValidDriveLink = products.find(p => p.driveLink && p.driveLink.trim() !== '')?.driveLink || null;
    if (firstValidDriveLink) formData.append('linkgoogledrive', firstValidDriveLink);

    if (recordedAudioFile && recordedAudioFile instanceof File) formData.append('recorded_audio', recordedAudioFile);
    if (audioNoteId) formData.append('audionote', audioNoteId);
    if (generalImages?.length > 0) generalImages.forEach(img => formData.append('general_attachments', img.file));

    const validProducts = products.filter(p => p.productId || p.product_id);
    const itemsJsonArray = validProducts.map(prod => ({
      product_id: prod.productId || prod.product_id,
      quantity: Number(prod.quantity || 1),
      unitprice: Number(prod.appliedPrice || prod.price || 0),
      discount: 0,
      note: prod.note ? String(prod.note).trim() : '' 
    }));
    
    formData.append('items', JSON.stringify(itemsJsonArray));
    formData.append('products', JSON.stringify(itemsJsonArray));

    validProducts.forEach((prod, index) => {
      const pId = prod.productId || prod.product_id;
      const aPrice = prod.appliedPrice || prod.price || 0;
      formData.append(`items[${index}][product_id]`, pId);
      formData.append(`items[${index}][quantity]`, String(prod.quantity));
      formData.append(`items[${index}][unitprice]`, String(aPrice));
      formData.append(`items[${index}][applied_price]`, String(aPrice));
      formData.append(`items[${index}][note]`, prod.note ? String(prod.note).trim() : '');
    });

    return formData;
  }, [customer, shippingUnit, shippingCode, generalNote, subtotal, total, products, recordedAudioFile, generalImages]);

  const handleCreateOrderSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!customer) return showToast('Vui lòng tìm kiếm và lựa chọn khách hàng!', 'warning');
    if (products.filter(p => p.productId || p.product_id).length === 0) return showToast('Danh sách sản phẩm không được để trống!', 'warning');

    setIsSubmitting(true);
    try {
      const audioNoteId = await processAudioNoteToBase64();
      const payload = buildFormDataPayload('NEW', audioNoteId);
      const res = await orderService.createNew(payload);
      const beData = res?.errorCode !== undefined ? res : (res?.data || res);

      if (beData?.errorCode === 1 || beData?.statusCode === 200) {
        showToast('Khởi tạo đơn hàng sản xuất thành công! 📦', 'success');
        setTimeout(() => navigate('/orders'), 50);
      } else { 
        showToast(beData?.message || 'Khởi tạo đơn thất bại.', 'error'); 
      }
    } catch (error) { 
      showToast('Lỗi kết nối máy chủ.', 'error'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleSaveDraft = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!customer) return showToast('Vui lòng chọn khách hàng trước khi lưu bản nháp!', 'warning');
    if (!products.some(p => p.productId || (p.images && p.images.length > 0) || p.driveLink)) {
        return showToast('Để lưu nháp, vui lòng chọn ít nhất một sản phẩm.', 'warning');
    }

    setIsSubmitting(true);
    try {
      const audioNoteId = await processAudioNoteToBase64();
      const productsToSave = products.filter(p => p.productId || (p.images && p.images.length > 0) || p.driveLink);

      const itemsPayload = await Promise.all(productsToSave.map(async (p) => {
          const fileIds = (p.images && p.images.length > 0) ? await uploadDraftImages(p.images) : null;
          return {
              product_id: p.productId || p.product_id || null,
              quantity: Number(p.quantity) || 1,
              unitprice: Number(p.appliedPrice) || Number(p.price) || 0,
              discount: 0,
              attachments: fileIds,
              linkgoogledrive: p.driveLink || null,
              note: p.note || null
          };
      }));

      const jsonPayload = {
          customer_id: customer || null,
          items: itemsPayload,
          note: generalNote || null,
          audionote: audioNoteId,
          noteshipping: shippingUnit || shippingCode ? `${shippingUnit} - ${shippingCode}`.trim() : null,
      };

      if (draftId) jsonPayload.id = draftId;
      const res = draftId ? await orderService.saveDraft(jsonPayload) : await orderService.createDraft(jsonPayload);
      const beData = res?.errorCode !== undefined ? res : (res?.data || res);

      if (beData?.errorCode === 1 || beData?.data?.errorCode === 1 || beData?.statusCode === 200) {
          showToast('Lưu bản nháp đơn hàng thành công!', 'success');
          setTimeout(() => navigate('/orders'), 50);
      } else { 
        showToast(beData?.message || 'Không thể lưu bản nháp.', 'error'); 
      }
    } catch (error) {
      showToast('Lỗi hệ thống khi lưu bản nháp', 'error'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleCreateAndAwait = async (e) => {
    if (e) e.preventDefault();
    if (!customer) return showToast('Vui lòng tìm kiếm và lựa chọn khách hàng!', 'warning');
    if (products.filter(p => p.productId || p.product_id).length === 0) return showToast('Danh sách sản phẩm không được để trống!', 'warning');

    setIsSubmitting(true);
    try {
      const audioNoteId = await processAudioNoteToBase64();
      const payload = buildFormDataPayload('AWAIT', audioNoteId);
      const res = await orderService.createAwait(payload);
      const beData = res?.errorCode !== undefined ? res : (res?.data || res);

      if (beData?.errorCode === 1 || beData?.statusCode === 200) {
        showToast('Khởi tạo đơn hàng chờ duyệt thành công! ⏳', 'success');
        setTimeout(() => navigate('/orders'), 50);
      } else {
        showToast(beData?.message || 'Khởi tạo đơn chờ duyệt thất bại.', 'error');
      }
    } catch (error) { 
      showToast('Lỗi kết nối hệ thống.', 'error'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return {
    customer, setCustomer, shippingUnit, setShippingUnit, shippingCode, setShippingCode, generalNote, setGeneralNote,
    products, catalog, isLoadingCatalog, generalImages, setGeneralImages, recordedAudioFile, setRecordedAudioFile,
    handleAddProduct, handleRemoveProduct, handleUpdateProduct, subtotal, total, handleCreateOrderSubmit, handleSaveDraft, handleCreateAndAwait, isSubmitting
  };
};