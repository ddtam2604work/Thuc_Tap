import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import axios from 'axios';

import { useConfirm } from '../../context/ConfirmContext';
import { useNotification } from '../../context/NotificationContext';

const MEDIA_URL = 'https://113.161.204.185:4010'; 

export const useOrderSummaryCard = ({ 
  customer, products, shippingUnit, shippingCode, generalNote,
  recordedAudioFile
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { confirm } = useConfirm();
  const { showToast } = useNotification();

  const uploadDraftImages = useCallback(async (productImages) => {
    if (!productImages || productImages.length === 0) return null;
    const filesToUpload = productImages.filter(img => img.file).map(img => img.file);
    if (filesToUpload.length === 0) return productImages.map(img => img.id || img.uid).filter(Boolean);

    const formData = new FormData();
    filesToUpload.forEach(file => formData.append('files', file));
    formData.append('ispublic', '1');

    try {
      const response = await axios.post(`${MEDIA_URL}/api/upload/image/multi-draft`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (response?.data?.errorCode === 1 && response?.data?.data?.success) {
        return response.data.data.success.map(item => item.id);
      }
      return null;
    } catch (error) {
      return null;
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

  const handleCreateOrderSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!customer) return showToast('Vui lòng chọn đối tác khách hàng trước khi khởi tạo!', 'warning');
    const validProducts = (products || []).filter(p => p.productId || p.product_id);
    if (validProducts.length === 0) return showToast('Danh sách sản phẩm không được để trống!', 'warning');

    setIsSubmitting(true);
    try {
      const audioNoteId = recordedAudioFile ? (typeof recordedAudioFile === 'string' ? recordedAudioFile : await uploadAudioNote(recordedAudioFile)) : null;

      const itemsPayload = await Promise.all(validProducts.map(async (p) => {
        let fileIds = null;
        if (p.images && p.images.length > 0) fileIds = await uploadDraftImages(p.images);
        return {
          product_id: p.productId || p.product_id,
          quantity: Number(p.quantity) || 1,
          unitprice: Number(p.appliedPrice) || Number(p.applied_price) || 0,
          discount: 0,
          attachments: fileIds,
          linkgoogledrive: p.driveLink || "linkgoogledrive", // 🎯 ĐIỀU CHỈNH: Gửi placeholder string theo mẫu Postman nếu rỗng
          note: p.note || null
        };
      }));

      // 🎯 ĐIỀU CHỈNH: Trích xuất link Google Drive đầu tiên của danh sách sản phẩm để đưa lên Root Payload
      const firstValidDriveLink = validProducts.find(p => p.driveLink && p.driveLink.trim() !== '')?.driveLink || null;

      const jsonPayload = {
        customer_id: customer || null, 
        items: itemsPayload, 
        note: generalNote || null,
        audionote: audioNoteId,
        noteshipping: shippingUnit || shippingCode ? `${shippingUnit} - ${shippingCode}`.trim() : null,
        linkgoogledrive: firstValidDriveLink // 🎯 ĐIỀU CHỈNH: Thêm trường linkgoogledrive cấp root như đặc tả mẫu Postman
      };

      const res = await orderService.createNew(jsonPayload);
      const beData = res?.errorCode !== undefined ? res : (res?.data || res);

      if (beData?.errorCode === 1 || beData?.data?.errorCode === 1 || beData?.statusCode === 200) {
        showToast('Khởi tạo đơn hàng sản xuất thành công!', 'success');
        setTimeout(() => navigate('/orders'), 50);
      } else {
        showToast(beData?.message || 'Khởi tạo đơn hàng thất bại.', 'error');
      }
    } catch (error) {
      showToast('Lỗi kết nối máy chủ, không thể khởi tạo đơn hàng.', 'error');
    } finally { 
      setIsSubmitting(false);
    }
  }, [customer, products, generalNote, shippingUnit, shippingCode, recordedAudioFile, uploadDraftImages, navigate, showToast]);

  const handleSaveDraftSubmit = useCallback(async (e) => {
    if (e && e.preventDefault) e.preventDefault(); 
    if (!customer) return showToast('Vui lòng chọn khách hàng trước khi lưu bản nháp!', 'warning');
    const validProducts = (products || []).filter(p => p.productId || p.product_id);
    if (validProducts.length === 0) return showToast('Để lưu nháp, vui lòng chọn ít nhất một sản phẩm.', 'warning');

    setIsSubmitting(true);
    try {
      const audioNoteId = recordedAudioFile ? (typeof recordedAudioFile === 'string' ? recordedAudioFile : await uploadAudioNote(recordedAudioFile)) : null;

      const itemsPayload = await Promise.all(validProducts.map(async (p) => {
        let fileIds = null;
        if (p.images && p.images.length > 0) fileIds = await uploadDraftImages(p.images);
        return {
          product_id: p.productId || p.product_id,
          quantity: Number(p.quantity) || 1,
          unitprice: Number(p.appliedPrice) || Number(p.applied_price) || 0,
          attachments: fileIds,
          linkgoogledrive: p.driveLink || "linkgoogledrive", // 🎯 ĐIỀU CHỈNH: Đồng bộ hóa item-level link drive
          note: p.note || null
        };
      }));

      // 🎯 ĐIỀU CHỈNH: Trích xuất link Google Drive đầu tiên cấp root cho Đơn nháp
      const firstValidDriveLink = validProducts.find(p => p.driveLink && p.driveLink.trim() !== '')?.driveLink || null;

      const jsonPayload = {
        customer_id: customer || null, 
        items: itemsPayload,
        note: generalNote || null,
        audionote: audioNoteId,
        noteshipping: shippingUnit || shippingCode ? `${shippingUnit} - ${shippingCode}`.trim() : null,
        linkgoogledrive: firstValidDriveLink // 🎯 ĐIỀU CHỈNH: Bổ sung trường linkgoogledrive cấp root
      };

      const res = await orderService.createDraft(jsonPayload);
      const beData = res?.errorCode !== undefined ? res : (res?.data || res);

      if (beData?.errorCode === 1 || beData?.data?.errorCode === 1 || beData?.statusCode === 200) {
        showToast('Đã lưu thông tin vào danh sách Đơn nháp thành công! 📝', 'success');
        setTimeout(() => navigate('/orders'), 50);
      } else {
        showToast(beData?.message || 'Không thể lưu bản nháp.', 'error');
      }
    } catch (error) {
      showToast('Lỗi kết nối máy chủ, không thể lưu bản nháp.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [customer, products, generalNote, shippingUnit, shippingCode, recordedAudioFile, uploadDraftImages, navigate, showToast]);

  return { isSubmitting, handleCreateOrderSubmit, handleSaveDraftSubmit };
};