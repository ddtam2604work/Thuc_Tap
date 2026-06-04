import { useCallback } from 'react';

const MEDIA_URL = 'https://113.161.204.185:4010';

export const useProductOrderList = () => {
  // Giải mã định danh file (UUID) từ Backend thành một URL liên kết tuyệt đối
  const getAbsoluteUrl = useCallback((fileId) => {
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
  }, []);

  // Ép buộc trình duyệt tải file vật lý về máy thay vì mở tab mới preview (Áp dụng cho mọi định dạng)
  const handleDownloadFile = useCallback(async (fileUrl, fileName) => {
    if (!fileUrl) return;
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || `Tai_Ve_File_${Date.now()}`;
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Lỗi tải tệp tin đính kèm:', error);
      window.open(fileUrl, '_blank'); // Khởi tạo phương án fallback mở tab mới
    }
  }, []);

  // Đọc đuôi file thiết kế nhằm ánh xạ nhãn hiển thị trực quan sinh động trên UI
  const getFileIcon = useCallback((filename = '') => {
    if (!filename) return '📄 FILE';
    const ext = String(filename).split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf': return '📕 PDF';
      case 'doc': case 'docx': return '📘 WORD';
      case 'xls': case 'xlsx': return '📗 EXCEL';
      case 'zip': case 'rar': return '📦 ZIP/RAR';
      case 'ai': return '🎨 ILLUSTRATOR';
      case 'psd': return '📸 PHOTOSHOP';
      case 'cdr': return '📐 COREL';
      default: return '📎 TÀI LIỆU';
    }
  }, []);

  return {
    getAbsoluteUrl,
    handleDownloadFile,
    getFileIcon
  };
};