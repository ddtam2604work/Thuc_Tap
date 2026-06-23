import { useCallback, useState } from 'react';
import { apiMedia } from '../../config/axiosClient';

export const useProductItemRow = ({ product, catalog, onUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);

  // Định dạng tiền tệ VNĐ hiển thị trên giao diện trực quan
  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('en-US').format(value || 0) + ' đ';
  }, []);

  // 🌟 ĐỒNG BỘ HOÀN HẢO THEO useProducts: Áp dụng tra cứu chuẩn key hệ thống
  const handleSelectProduct = useCallback((e) => {
    const selectedId = e.target.value;
    if (!selectedId || !catalog) return;

    // Đối chiếu ID từ Dropdown với danh sách catalog (được nạp từ useProducts)
    const itemInfo = catalog.find(p => String(p.id || p.product_id) === String(selectedId));

    // Luôn cập nhật selectedId ngay lập tức, kể cả khi không tìm thấy catalogItem
    const basePriceFromApi = itemInfo ? Number(itemInfo.price || 0) : 0;
    const productName = itemInfo ? (itemInfo.name || 'Sản phẩm không tên') : 'Sản phẩm không tên';
    const currentQty = Number(product.quantity || 1);

    onUpdate({
      productId: selectedId,
      product_id: selectedId,
      name: productName,
      product_name: productName,
      basePrice: basePriceFromApi,
      base_price: basePriceFromApi,
      price: basePriceFromApi,
      appliedPrice: currentQty * basePriceFromApi,
      applied_price: currentQty * basePriceFromApi,
      appliedPriceDisplay: undefined
    });
  }, [catalog, product.quantity, onUpdate]);

  // Cập nhật số lượng và tính toán lại Giá áp dụng thời gian thực
  const handleQuantityChange = useCallback((e) => {
    const rawValue = e.target.value;

    if (rawValue === '') {
      onUpdate({
        quantity: '',
        appliedPrice: 0,
        applied_price: 0,
        appliedPriceDisplay: undefined
      });
      return;
    }

    const newQty = parseInt(rawValue, 10) || 0;
    const currentBasePrice = Number(product.basePrice || product.price || 0);
    
    onUpdate({ 
      quantity: newQty,
      appliedPrice: newQty * currentBasePrice,
      applied_price: newQty * currentBasePrice,
      appliedPriceDisplay: undefined
    });
  }, [product.basePrice, product.price, onUpdate]);

  const handleAppliedPriceChange = useCallback((e) => {
    const rawValue = e.target.value;
    const cleanValue = rawValue.replace(/[^\d]/g, '');
    const newPrice = Number(cleanValue) || 0;
    
    onUpdate({ 
      appliedPrice: newPrice,
      applied_price: newPrice,
      appliedPriceDisplay: rawValue
    });
  }, [onUpdate]);

  const handleFileUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
  
    const maxFileSize = 50 * 1024 * 1024;
    const oversizedFiles = files.filter(f => f.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      alert(`⚠️ Các tệp sau vượt quá 50MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }
  
    setIsUploading(true);
  
    const uploadPromises = files.map(file => {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('ispublic', '1');
  
      return apiMedia.post(`/upload/image/multi-draft`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    });
  
    try {
      const responses = await Promise.all(uploadPromises);
      const newFiles = responses.flatMap((response, index) => {
        if (response?.errorCode === 1 && response?.data?.success) {
          return response.data.success.map(item => {
            const file = files[index];
            const isImage = file.type.startsWith('image/');
            return {
              id: item.id,
              name: file.name,
              previewUrl: isImage ? URL.createObjectURL(file) : null,
              isImage: isImage,
              size: file.size
            };
          });
        }
        return [];
      });
  
      onUpdate({ images: [...(product.images || []), ...newFiles] });
    } catch (error) {
      console.error('Lỗi khi tải tệp lên:', error);
      let errorMessage = 'Đã xảy ra lỗi trong quá trình tải tệp lên. Vui lòng thử lại.';
      if (error.response) {
        errorMessage = `Lỗi từ máy chủ: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng.';
      } else {
        errorMessage = `Lỗi khi gửi yêu cầu: ${error.message}`;
      }
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  
    e.target.value = null;
  }, [product.images, onUpdate]);

  const handleRemoveImage = useCallback((indexToRemove) => {
    const targetImg = product.images?.[indexToRemove];
    if (targetImg?.previewUrl) {
      URL.revokeObjectURL(targetImg.previewUrl); 
    }
    const updatedImages = product.images?.filter((_, idx) => idx !== indexToRemove) || [];
    onUpdate({ images: updatedImages });
  }, [product.images, onUpdate]);

  const handleDriveLinkChange = useCallback((e) => {
    onUpdate({ driveLink: e.target.value || '' });
  }, [onUpdate]);

  const handleNoteChange = useCallback((e) => {
    onUpdate({ note: e.target.value || '' });
  }, [onUpdate]);

  return {
    isUploading,
    formatCurrency,
    handleSelectProduct,
    handleQuantityChange,
    handleAppliedPriceChange,
    handleFileUpload,
    handleRemoveImage,
    handleDriveLinkChange,
    handleNoteChange,
  };
};