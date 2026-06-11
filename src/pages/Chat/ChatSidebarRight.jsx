// Kho lưu trữ Media/Links
import React from 'react';
import { mediaService } from '../../services/mediaService'; 

const resolveAbsoluteUrl = (fileContent) => {
  if (!fileContent) return '';
  const idStr = String(fileContent).trim();
  if (idStr.startsWith('http://') || idStr.startsWith('https://') || idStr.startsWith('blob:') || idStr.startsWith('data:')) {
    return idStr;
  }
  return mediaService.getViewUrl(idStr);
};

const ChatSidebarRight = ({ showMediaSidebar, activeRoom, mediaStorage, openLightbox }) => {
  if (!showMediaSidebar || !activeRoom) return null;

  /**
   * 🎯 HÀM TRUY VẾT TIN NHẮN GỐC
   * Định vị và cuộn khung chat mượt mà tìm về đúng vị trí tin nhắn phát sinh ảnh
   */
  const handleScrollToMessage = (msgId) => {
    if (!msgId) return;
    const element = document.getElementById(`msg-${msgId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Thêm hiệu ứng nhấp nháy (Highlight) giúp người dùng nhận biết ngay tin nhắn gốc
      element.classList.add('animate-pulse', 'bg-blue-50', 'ring-2', 'ring-blue-400', 'rounded-lg');
      setTimeout(() => {
        element.classList.remove('animate-pulse', 'bg-blue-50', 'ring-2', 'ring-blue-400');
      }, 2500);
    } else {
      alert('Tin nhắn gốc đã quá cũ hoặc chưa được tải vào khung xem hiện tại!');
    }
  };

  /**
   * 📥 HÀM TẢI ẢNH XUỐNG THIẾT BỊ
   * Chuyển đổi URL sang định dạng Blob để ép trình duyệt tải xuống thay vì tự động mở tab mới
   */
  const handleDownloadImage = async (url, idx) => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `chat-media-${idx + 1}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      
      // Dọn dẹp bộ nhớ RAM sau khi tải xong
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      // Fallback: Mở tab mới để tải thủ công nếu dính chính sách bảo mật CORS nghiêm ngặt
      window.open(url, '_blank');
    }
  };

  return (
    <div className="w-[280px] flex-shrink-0 border-l border-gray-100 bg-white flex flex-col animate-in slide-in-from-right duration-200 z-10">
      <div className="p-4 border-b border-gray-100 font-bold text-xs text-gray-700 bg-gray-50">📁 Kho tư liệu hội thoại</div>
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-5 text-xs scrollbar-thin">
        
        {/* KHU VỰC HÌNH ẢNH */}
        <div>
          <h4 className="font-bold text-gray-400 mb-2 uppercase text-[10px] tracking-wider">Hình ảnh ({mediaStorage.images.length})</h4>
          {mediaStorage.images.length === 0 ? <p className="text-gray-400 italic text-[11px]">Chưa có ảnh chia sẻ.</p> : (
            <div className="grid grid-cols-3 gap-1.5">
              {mediaStorage.images.map((img, idx) => {
                const imageUrl = resolveAbsoluteUrl(img.content || img.text) || img.url;
                const msgId = img.id || img._id || img.chatmessage_id;

                return (
                  <div key={idx} className="relative group w-full h-16 rounded-md overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                    {/* Hình ảnh hiển thị gốc */}
                    <img 
                      src={imageUrl} 
                      alt="Storage Piece" 
                      className="w-full h-full object-cover transition-all group-hover:scale-105" 
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = 'https://placehold.co/260x200/e2e8f0/94a3b8?text=Error';
                      }} 
                    />

                    {/* 🌟 LỚP PHỦ TIỆN ÍCH HOVER (Xem - Định vị - Tải về) */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-1 z-10">
                      {/* 1. Xem ảnh lớn (Lightbox) */}
                      <button 
                        type="button" 
                        onClick={() => openLightbox(imageUrl)} 
                        className="w-[22px] h-[22px] rounded bg-white/20 text-white flex items-center justify-center text-[11px] hover:bg-white hover:text-gray-900 transition-colors"
                        title="Xem ảnh lớn"
                      >
                        👁️
                      </button>

                      {/* 2. Định vị về tin nhắn gốc */}
                      <button 
                        type="button" 
                        onClick={() => handleScrollToMessage(msgId)} 
                        className="w-[22px] h-[22px] rounded bg-white/20 text-white flex items-center justify-center text-[11px] hover:bg-white hover:text-gray-900 transition-colors"
                        title="Đến tin nhắn gốc"
                      >
                        🎯
                      </button>

                      {/* 3. Tải file về thiết bị */}
                      <button 
                        type="button" 
                        onClick={() => handleDownloadImage(imageUrl, idx)} 
                        className="w-[22px] h-[22px] rounded bg-white/20 text-white flex items-center justify-center text-[11px] hover:bg-white hover:text-gray-900 transition-colors"
                        title="Tải ảnh về máy"
                      >
                        📥
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* KHU VỰC LIÊN KẾT CHIA SẺ */}
        <div className="border-t border-gray-100 pt-3">
          <h4 className="font-bold text-gray-400 mb-2 uppercase text-[10px] tracking-wider">Liên kết chia sẻ ({mediaStorage.links.length})</h4>
          {mediaStorage.links.length === 0 ? <p className="text-gray-400 italic text-[11px]">Chưa có liên kết.</p> : (
            <div className="flex flex-col gap-2">
              {mediaStorage.links.map((link, idx) => (
                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline bg-gray-50 p-2.5 rounded-lg block border border-gray-100 font-medium truncate max-w-full" title={link.url}>
                  {link.url}
                </a>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ChatSidebarRight;