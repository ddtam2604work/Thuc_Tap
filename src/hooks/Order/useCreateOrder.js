import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService'; 
import { productService } from '../../services/productService';
import axios from 'axios';

// --- IMPORT CÁC HOOK ĐIỀU KHIỂN DÙNG CHUNG ---
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
  const [recordedAudioFile, setRecordedAudioFile] = useState(null); 
  const [uploadedAudioFile, setUploadedAudioFile] = useState(null);   

  const [catalog, setCatalog] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [products, setProducts] = useState([
    { id: 1, productId: '', name: '', quantity: 1, basePrice: 0, appliedPrice: 0, note: '', images: [], driveLink: '' }
  ]);

  // Kích hoạt các công cụ điều khiển thông báo và xác nhận từ Context toàn cục
  const { confirm } = useConfirm();
  const { showToast } = useNotification();

  // Đồng bộ hóa cơ chế unwrap response khớp hệ thống (Giữ nguyên)
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

  // Cập nhật thông tin chi tiết sản phẩm khi chọn từ Catalog (Giữ nguyên)
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

  // =================================================================
  // CÁC HÀM UPLOAD FILE (Giữ nguyên)
  // =================================================================
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

  // Xây dựng cấu trúc FormData Payload gửi lên Backend (Giữ nguyên)
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
    if (firstValidDriveLink) {
      formData.append('linkgoogledrive', firstValidDriveLink);
    }

    if (recordedAudioFile) formData.append('recorded_audio', recordedAudioFile);
    if (uploadedAudioFile) formData.append('uploaded_audio', uploadedAudioFile);
    if (audioNoteId) formData.append('audionote', audioNoteId);
    if (generalImages?.length > 0) generalImages.forEach(img => formData.append('general_attachments', img.file));

    const validProducts = products.filter(p => {
      const pId = p.productId || p.product_id;
      return pId && String(pId).trim() !== '';
    });

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
      const pNote = prod.note ? String(prod.note).trim() : '';
      const pDrive = prod.driveLink ? String(prod.driveLink).trim() : '';

      formData.append(`items[${index}][product_id]`, pId);
      formData.append(`items[${index}][quantity]`, String(prod.quantity));
      formData.append(`items[${index}][unitprice]`, String(aPrice));
      formData.append(`items[${index}][applied_price]`, String(aPrice));
      formData.append(`items[${index}][note]`, pNote);
      if (pDrive) {
        formData.append(`items[${index}][linkgoogledrive]`, pDrive);
        formData.append(`items[${index}][drive_link]`, pDrive);
      }

      formData.append(`products[${index}][product_id]`, pId);
      formData.append(`products[${index}][quantity]`, String(prod.quantity));
      formData.append(`products[${index}][applied_price]`, String(aPrice));
      formData.append(`products[${index}][unitprice]`, String(aPrice));
      formData.append(`products[${index}][note]`, pNote);
      if (pDrive) formData.append(`products[${index}][drive_link]`, pDrive);
    });

    return formData;
  }, [customer, shippingUnit, shippingCode, generalNote, subtotal, total, products, recordedAudioFile, uploadedAudioFile, generalImages]);

  // =================================================================
  // LUỒNG XỬ LÝ KHỞI TẠO ĐƠN HÀNG MỚI
  // =================================================================
  const handleCreateOrderSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!customer) return showToast('Vui lòng tìm kiếm và lựa chọn khách hàng!', 'warning');
    
    const validProducts = products.filter(p => p.productId || p.product_id);
    if (validProducts.length === 0) return showToast('Danh sách sản phẩm không được để trống!', 'warning');

    setIsSubmitting(true);
    try {
      const audioFile = recordedAudioFile || uploadedAudioFile;
      const audioNoteId = await uploadAudioNote(audioFile);

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

  // =================================================================
  // LUỒNG XỬ LÝ LƯU BẢN NHÁP ĐƠN HÀNG
  // =================================================================
  const handleSaveDraft = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!customer) return showToast('Vui lòng chọn khách hàng trước khi lưu bản nháp!', 'warning');

    const hasMeaningfulProduct = products.some(p =>
        (p.productId && String(p.productId).trim() !== '') ||
        (p.images && p.images.length > 0) ||
        (p.driveLink && p.driveLink.trim() !== '')
    );

    if (!hasMeaningfulProduct) {
        return showToast('Để lưu nháp, vui lòng chọn ít nhất một sản phẩm, hoặc đính kèm ảnh/link Google Drive vào sản phẩm.', 'warning');
    }

    setIsSubmitting(true);
    try {
      const audioFile = recordedAudioFile || uploadedAudioFile;
      const audioNoteId = await uploadAudioNote(audioFile);

      const productsToSave = products.filter(p =>
          (p.productId && String(p.productId).trim() !== '') ||
          (p.images && p.images.length > 0) ||
          (p.driveLink && p.driveLink.trim() !== '')
      );

      const itemsPayload = await Promise.all(productsToSave.map(async (p) => {
          const fileIds = (p.images && p.images.length > 0) ? await uploadDraftImages(p.images) : null;
          
          return {
              product_id: p.productId || p.product_id || null,
              quantity: Number(p.quantity) || 1,
              unitprice: Number(p.appliedPrice) || Number(p.price) || 0,
              discount: 0,
              attachments: fileIds,
              linkgoogledrive: p.driveLink || null,
              metadata: {},
              note: p.note || null
          };
      }));

      const firstValidDriveLinkInDraft = productsToSave.find(p => p.driveLink && p.driveLink.trim() !== '')?.driveLink || null;

      const jsonPayload = {
          customer_id: customer || null,
          items: itemsPayload,
          note: generalNote || null,
          audionote: audioNoteId,
          noteshipping: shippingUnit || shippingCode ? `${shippingUnit} - ${shippingCode}`.trim() : null,
          linkgoogledrive: firstValidDriveLinkInDraft, 
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
      console.error('❌ Lỗi hệ thống khi lưu bản nháp:', error);
      showToast('Lỗi hệ thống khi lưu bản nháp', 'error'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const validateDuplicates = async (productsToCheck) => {
    const allFileIds = productsToCheck.flatMap(p => p.images.map(img => img.id || img.name)).filter(Boolean);
    if (allFileIds.length === 0) return false;
    try {
      const res = await orderService.checkDuplicates(allFileIds);
      return res?.data?.hasDuplicates === true || res?.data?.length > 0;
    } catch (error) { return false; }
  };

  // =================================================================
  // LUỒNG XỬ LÝ KHỞI TẠO ĐƠN CHỜ DUYỆT (AWAIT)
  // =================================================================
  const handleCreateAndAwait = async (e) => {
    if (e) e.preventDefault();
    if (!customer) return showToast('Vui lòng tìm kiếm và lựa chọn khách hàng!', 'warning');
    
    const validProducts = products.filter(p => p.productId || p.product_id);
    if (validProducts.length === 0) return showToast('Danh sách sản phẩm không được để trống!', 'warning');

    setIsSubmitting(true);
    try {
      if (await validateDuplicates(products)) {
        const isConfirmed = await confirm({
          title: 'Phát hiện file trùng lặp',
          message: 'Hệ thống phát hiện có file đính kèm trùng lặp. Bạn có chắc chắn vẫn muốn tiếp tục tiến trình không?',
          confirmText: 'Vẫn tiếp tục',
          cancelText: 'Hủy bỏ',
          type: 'danger'
        });
        
        if (!isConfirmed) return;
      }

      const audioFile = recordedAudioFile || uploadedAudioFile;
      const audioNoteId = await uploadAudioNote(audioFile);

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
    products, catalog, isLoadingCatalog, generalImages, setGeneralImages, audioFile: recordedAudioFile, setAudioFile: setRecordedAudioFile,
    handleAddProduct, handleRemoveProduct, handleUpdateProduct, subtotal, total, handleCreateOrderSubmit, handleSaveDraft, handleCreateAndAwait, isSubmitting
  };
};