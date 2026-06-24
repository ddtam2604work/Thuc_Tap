import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { apiMedia } from '../../config/axiosClient';

import { useNotification } from '../../context/NotificationContext';

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

  const [catalog, setCatalog] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [products, setProducts] = useState([
    { id: 1, productId: '', name: '', quantity: 1, basePrice: 0, appliedPrice: 0, note: '', images: [], driveLink: '' }
  ]);

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
      if (target?.images) {
        target.images.forEach(img => {
          if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
        });
      }
      return prev.filter(p => p.id !== id);
    });
  }, []);

  const subtotal = useMemo(() => products.reduce((acc, p) => acc + (Number(p.quantity || 0) * Number(p.appliedPrice || p.price || 0)), 0), [products]);
  const total = useMemo(() => subtotal, [subtotal]);

  const uploadAudioNote = useCallback(async (file) => {
    if (!file) return null;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
    });
  }, []);

  const processAudioNoteToBase64 = useCallback(async () => {
    if (!recordedAudioFile) return null;
    if (typeof recordedAudioFile === 'string') return recordedAudioFile;
    return await uploadAudioNote(recordedAudioFile);
  }, [recordedAudioFile, uploadAudioNote]);

  // 🎯 ĐIỀU CHỈNH CHÍNH: Đóng gói chuẩn xác cấu trúc và đưa linkgoogledrive vào đúng vị trí để gọi thành công API Backend
  const buildJsonPayload = useCallback((audioNoteId = null) => {
    const firstValidDriveLink = products.find(p => p.driveLink && p.driveLink.trim() !== '')?.driveLink?.trim() || null;
    
    const itemsPayload = products
      .filter(p => p.productId || p.product_id)
      .map(prod => ({
        product_id: prod.productId || prod.product_id,
        quantity: Number(prod.quantity || 1),
        unitprice: Number(prod.appliedPrice || prod.price || 0),
        discount: 0,
        attachments: prod.images?.map(img => img.id).filter(Boolean) || [], 
        attachmentsinfo: null, 
        zip_fileid: null,      
        zip_fileinfo: null,    
        metadata: {},          
        linkgoogledrive: prod.driveLink || "linkgoogledrive", // 🎯 ĐIỀU CHỈNH: Gửi placeholder string thay vì trống theo như Postman mẫu yêu cầu
        note: prod.note ? String(prod.note).trim() : "" 
      }));

    return {
      audionote: audioNoteId || null,
      customer_id: customer || null,
      discount: 0,            
      items: itemsPayload,
      linkgoogledrive: firstValidDriveLink, // 🎯 ĐIỀU CHỈNH: Đẩy link drive tổng đơn lên root payload
      note: generalNote ? String(generalNote).trim() : null,
      noteshipping: shippingUnit || shippingCode ? `${shippingUnit} - ${shippingCode}`.trim() : null,
      zip_fileid: null,       
      zip_fileinfo: null      
    };
  }, [customer, shippingUnit, shippingCode, generalNote, products]);

  const handleCreateOrderSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!customer) return showToast('Vui lòng tìm kiếm và lựa chọn khách hàng!', 'warning');
    if (products.filter(p => p.productId || p.product_id).length === 0) return showToast('Danh sách sản phẩm không được để trống!', 'warning');

    setIsSubmitting(true);
    try {
      const audioNoteId = await processAudioNoteToBase64();
      const jsonPayload = buildJsonPayload(audioNoteId);
      
      const res = await orderService.createNew(jsonPayload);
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

      const itemsPayload = productsToSave.map(p => {
          const fileIds = p.images?.map(img => img.id).filter(Boolean) || null;
          return {
              product_id: p.productId || p.product_id || null,
              quantity: Number(p.quantity) || 1,
              unitprice: Number(p.appliedPrice) || Number(p.price) || 0,
              discount: 0,
              attachments: fileIds,
              linkgoogledrive: p.driveLink || "linkgoogledrive", // 🎯 ĐIỀU CHỈNH: Gửi giá trị mặc định cho bản nháp
              drive_link: p.driveLink || null,
              link_google_drive: p.driveLink || null,
              note: p.note || null
          };
      });

      const firstValidDriveLink = productsToSave.find(p => p.driveLink && p.driveLink.trim() !== '')?.driveLink || null;

      const jsonPayload = {
          customer_id: customer || null,
          items: itemsPayload,
          note: generalNote || null,
          audionote: audioNoteId,
          noteshipping: shippingUnit || shippingCode ? `${shippingUnit} - ${shippingCode}`.trim() : null,
          linkgoogledrive: firstValidDriveLink,
          drive_link: firstValidDriveLink,
          link_google_drive: firstValidDriveLink,
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
      const jsonPayload = buildJsonPayload(audioNoteId);
      
      const res = await orderService.createAwait(jsonPayload);
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
  
  // API UPLOAD ẢNH VỚI HÀNG ĐỢI TUẦN TỰ CHỐNG LỖI 429
  const uploadGeneralImages = useCallback(async (files) => {
    const maxFileSize = 50 * 1024 * 1024;
    const oversizedFiles = files.filter(f => f.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      alert(`⚠️ Các tệp sau vượt quá 50MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    const newFiles = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('files', file);
        formData.append('ispublic', '1');

        const response = await apiMedia.post(`/upload/image/multi-draft`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const resData = response?.data || response;
        if (resData?.errorCode === 1 && resData?.success) {
          resData.success.forEach(item => {
            const isImage = file.type.startsWith('image/');
            newFiles.push({
              id: item.id,
              name: file.name,
              previewUrl: isImage ? URL.createObjectURL(file) : null,
              isImage: isImage,
              size: file.size
            });
          });
        }
      }
      setGeneralImages(prev => [...prev, ...newFiles]);
    } catch (error) {
      console.error('Lỗi khi tải tệp lên:', error);
      alert('Đã xảy ra lỗi trong quá trình tải tệp lên.');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // API UPLOAD ẢNH CHI TIẾT SẢN PHẨM VỚI HÀNG ĐỢI TUẦN TỰ CHỐNG LỖI 429
  const uploadProductImages = useCallback(async (productStateId, files) => {
    const maxFileSize = 50 * 1024 * 1024;
    const oversizedFiles = files.filter(f => f.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      alert(`⚠️ Các tệp vượt quá 50MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    const newUploadedFiles = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('files', file);
        formData.append('ispublic', '1');

        const response = await apiMedia.post(`/upload/image/multi-draft`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const resData = response?.data || response;
        if (resData?.errorCode === 1 && resData?.success) {
          resData.success.forEach(item => {
            const isImage = file.type.startsWith('image/');
            newUploadedFiles.push({
              id: item.id,
              name: file.name,
              previewUrl: isImage ? URL.createObjectURL(file) : null,
              isImage: isImage,
              size: file.size
            });
          });
        }
      }

      setProducts(prev => prev.map(p => {
        if (p.id === productStateId) {
          return {
            ...p,
            images: [...(p.images || []), ...newUploadedFiles]
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Lỗi khi tải ảnh chi tiết sản phẩm:', error);
    }
  }, []);

  return {
    customer, setCustomer, shippingUnit, setShippingUnit, shippingCode, setShippingCode, generalNote, setGeneralNote,
    products, catalog, isLoadingCatalog, generalImages, setGeneralImages, recordedAudioFile, setRecordedAudioFile,
    handleAddProduct, handleRemoveProduct, handleUpdateProduct, subtotal, total, handleCreateOrderSubmit, handleSaveDraft, handleCreateAndAwait, isSubmitting, 
    uploadGeneralImages, uploadProductImages
  };
};