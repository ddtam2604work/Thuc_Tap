import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import axios from 'axios';

// --- IMPORT CÁC HOOK ĐIỀU KHIỂN DÙNG CHUNG CHUẨN XÁC ---
import { useConfirm } from '../../context/ConfirmContext';
import { useNotification } from '../../context/NotificationContext';

const MEDIA_URL = 'https://113.161.204.185:4010'; 

export const useOrderSummaryCard = ({ 
  customer, 
  products, 
  shippingUnit, 
  shippingCode, 
  generalNote,
  audioFile
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kích hoạt các dịch vụ thông báo và hộp thoại xác nhận toàn cục
  const { confirm } = useConfirm();
  const { showToast } = useNotification();

  // Hàm xử lý upload tệp vật lý sang Media Server (Giữ nguyên)
  const uploadDraftImages = useCallback(async (productImages) => {
    if (!productImages || productImages.length === 0) return null;

    const filesToUpload = productImages.filter(img => img.file).map(img => img.file);
    
    if (filesToUpload.length === 0) {
      return productImages.map(img => img.id || img.uid).filter(Boolean);
    }

    const formData = new FormData();
    filesToUpload.forEach(file => {
      formData.append('files', file);
    });
    formData.append('ispublic', '1');

    try {
      const response = await axios.post(`${MEDIA_URL}/api/upload/image/multi-draft`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}` 
        }
      });

      if (response?.data?.errorCode === 1 && response?.data?.data?.success) {
        return response.data.data.success.map(item => item.id);
      }
      return null;
    } catch (error) {
      console.error('❌ Lỗi tiến trình tải ảnh thiết kế lên Media Server:', error);
      return null;
    }
  }, []);

  // Hàm xử lý upload file ghi âm (Giữ nguyên)
  const uploadAudioNote = useCallback(async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('files', file);
    formData.append('ispublic', '1');

    try {
      const response = await axios.post(`${MEDIA_URL}/api/upload/image/multi-draft`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}` 
        }
      });

      if (response?.data?.errorCode === 1 && response?.data?.data?.success?.[0]?.id) {
        return response.data.data.success[0].id;
      }
      return null;
    } catch (error) {
      console.error('❌ Lỗi tiến trình tải file ghi âm lên Media Server:', error);
      return null;
    }
  }, []);

  // 1. LUỒNG XỬ LÝ KHỞI TẠO ĐƠN HÀNG CHÍNH THỨC
  const handleCreateOrderSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    // 🛠️ ĐIỀU CHỈNH: Đổi alert thành Toast Warning
    if (!customer) return showToast('Vui lòng chọn đối tác khách hàng trước khi khởi tạo!', 'warning');

    const validProducts = (products || []).filter(p => {
      const pId = p.productId || p.product_id;
      return pId && String(pId).trim() !== '';
    });

    // 🛠️ ĐIỀU CHỈNH: Đổi alert thành Toast Warning
    if (validProducts.length === 0) return showToast('Danh sách sản phẩm không được để trống!', 'warning');

    setIsSubmitting(true);
    try {
      const audioNoteId = await uploadAudioNote(audioFile);

      const itemsPayload = await Promise.all(validProducts.map(async (p) => {
        let fileIds = null;
        if (p.images && p.images.length > 0) {
          fileIds = await uploadDraftImages(p.images);
        }
        return {
          product_id: p.productId || p.product_id,
          quantity: Number(p.quantity) || 1,
          unitprice: Number(p.appliedPrice) || Number(p.applied_price) || 0,
          discount: 0,
          attachments: fileIds,
          linkgoogledrive: p.driveLink || null,
          metadata: {},
          note: p.note || null
        };
      }));

      const firstValidDriveLink = validProducts.find(p => p.driveLink && p.driveLink.trim() !== '')?.driveLink || null;

      const jsonPayload = {
        customer_id: customer || null, 
        items: itemsPayload, 
        note: generalNote || null,
        audionote: audioNoteId,
        noteshipping: shippingUnit || shippingCode ? `${shippingUnit} - ${shippingCode}`.trim() : null,
        linkgoogledrive: firstValidDriveLink, 
      };

      const res = await orderService.createNew(jsonPayload);
      
      // 🛠️ ĐIỀU CHỈNH: Áp dụng cơ chế ép gói Unwrap response an toàn
      const beData = res?.errorCode !== undefined ? res : (res?.data || res);

      if (beData?.errorCode === 1 || beData?.data?.errorCode === 1 || beData?.statusCode === 200) {
        // 🛠️ ĐIỀU CHỈNH: Thay đổi sang Toast Success kèm khoảng trễ điều hướng
        showToast('Khởi tạo đơn hàng sản xuất thành công!', 'success');
        setTimeout(() => navigate('/orders'), 50);
      } else {
        showToast(beData?.message || 'Khởi tạo đơn hàng thất bại.', 'error');
      }
    } catch (error) {
      console.error('[API/createNew] Thất bại:', error);
      showToast('Lỗi kết nối máy chủ, không thể khởi tạo đơn hàng.', 'error');
    } refinement: {
      setIsSubmitting(false);
    }
  }, [customer, products, generalNote, shippingUnit, shippingCode, audioFile, uploadDraftImages, uploadAudioNote, navigate, showToast]);

  // 2. LUỒNG XỬ LÝ LƯU BẢN NHÁP
  const handleSaveDraftSubmit = useCallback(async (e) => {
    if (e && e.preventDefault) e.preventDefault(); 
    // 🛠️ ĐIỀU CHỈNH: Đổi alert thành Toast Warning
    if (!customer) return showToast('Vui lòng chọn khách hàng trước khi lưu bản nháp!', 'warning');
    
    const validProducts = (products || []).filter(p => {
      const pId = p.productId || p.product_id;
      return pId && String(pId).trim() !== '';
    });

    // 🛠️ ĐIỀU CHỈNH: Đổi alert thành Toast Warning
    if (validProducts.length === 0) {
      return showToast('Để lưu nháp, vui lòng chọn ít nhất một sản phẩm từ danh mục hệ thống.', 'warning');
    }

    setIsSubmitting(true);
    try {
      const audioNoteId = await uploadAudioNote(audioFile);

      const itemsPayload = await Promise.all(validProducts.map(async (p) => {
        let fileIds = null;
        if (p.images && p.images.length > 0) {
          fileIds = await uploadDraftImages(p.images);
        }
        return {
          product_id: p.productId || p.product_id,
          quantity: Number(p.quantity) || 1,
          unitprice: Number(p.appliedPrice) || Number(p.applied_price) || 0,
          discount: 0,
          attachments: fileIds,
          linkgoogledrive: p.driveLink || null,
          metadata: {},
          note: p.note || null
        };
      }));

      const firstValidDriveLink = validProducts.find(p => p.driveLink && p.driveLink.trim() !== '')?.driveLink || null;

      const jsonPayload = {
        customer_id: customer || null, 
        items: itemsPayload,
        note: generalNote || null,
        audionote: audioNoteId,
        noteshipping: shippingUnit || shippingCode ? `${shippingUnit} - ${shippingCode}`.trim() : null,
        linkgoogledrive: firstValidDriveLink, 
      };

      const res = await orderService.createDraft(jsonPayload);
      
      // 🛠️ ĐIỀU CHỈNH: Áp dụng cơ chế ép gói Unwrap response an toàn
      const beData = res?.errorCode !== undefined ? res : (res?.data || res);

      if (beData?.errorCode === 1 || beData?.data?.errorCode === 1 || beData?.statusCode === 200) {
        // 🛠️ ĐIỀU CHỈNH: Thay đổi sang Toast Success kèm khoảng trễ điều hướng theo yêu cầu
        showToast('Đã lưu thông tin vào danh sách Đơn nháp thành công! 📝', 'success');
        setTimeout(() => navigate('/orders'), 50);
      } else {
        showToast(beData?.message || 'Không thể lưu bản nháp.', 'error');
      }
    } catch (error) {
      console.error('[API/createDraft] Thất bại:', error);
      showToast('Lỗi kết nối máy chủ, không thể lưu bản nháp.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [customer, products, generalNote, shippingUnit, shippingCode, audioFile, uploadDraftImages, uploadAudioNote, navigate, showToast]);

  return {
    isSubmitting,
    handleCreateOrderSubmit,
    handleSaveDraftSubmit
  };
};