import React, { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Button from '../../skeleton/Button'; // Giả sử bạn có component Button chung

// Component Modal đơn giản để xem ảnh toàn màn hình
const ImageModal = ({ src, alt, onClose }) => {
  if (!src) return null;
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={alt} className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" />
        <button 
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 text-black shadow-lg hover:scale-110 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const OrderDetailImageViewer = ({ images = [], orderCode = 'download' }) => {
  const [isZipping, setIsZipping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleDownloadZip = useCallback(async () => {
    if (images.length === 0) {
      alert('Không có ảnh để tải.');
      return;
    }

    setIsZipping(true);
    try {
      const zip = new JSZip();
      const imagePromises = images.map(async (image) => {
        try {
          // Dùng `fetch` để tải dữ liệu ảnh, hoạt động tốt với CORS
          const response = await fetch(image.previewUrl);
          if (!response.ok) {
            throw new Error(`Không thể tải ảnh: ${image.name}`);
          }
          const blob = await response.blob();
          
          // Đặt tên file an toàn và thêm vào zip
          const fileName = image.name || `image_${image.id}.jpg`;
          zip.file(fileName, blob);
        } catch (error) {
          console.error(`Lỗi khi xử lý ảnh ${image.name || image.id}:`, error);
        }
      });

      await Promise.all(imagePromises);

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${orderCode}_images.zip`);

    } catch (error) {
      console.error('Lỗi khi tạo file ZIP:', error);
      alert('Đã xảy ra lỗi khi tạo file ZIP. Vui lòng thử lại.');
    } finally {
      setIsZipping(false);
    }
  }, [images, orderCode]);

  if (images.length === 0) {
    return <p className="text-sm text-gray-500 italic">Đơn hàng này không có tệp đính kèm.</p>;
  }

  return (
    <div className="bg-white p-4 border rounded-xl">
      <div className="flex justify-end mb-4">
        <Button
          onClick={handleDownloadZip}
          disabled={isZipping}
          variant="secondary"
          className="flex items-center gap-2"
        >
          {isZipping ? 'Đang nén...' : 'Tải tất cả (ZIP)'}
        </Button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <div 
            key={image.id || index} 
            className="relative aspect-square border rounded-lg overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-shadow"
            onClick={() => setSelectedImage(image.previewUrl)}
          >
            <img src={image.previewUrl} alt={image.name} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
               <p className="text-white text-xs truncate font-medium">{image.name}</p>
            </div>
          </div>
        ))}
      </div>

      <ImageModal src={selectedImage} alt="Xem ảnh chi tiết" onClose={() => setSelectedImage(null)} />
    </div>
  );
};

export default OrderDetailImageViewer;