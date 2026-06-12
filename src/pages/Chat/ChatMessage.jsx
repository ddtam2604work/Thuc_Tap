import React from 'react';
import { mediaService } from '../../services/mediaService'; 

export const resolveAbsoluteUrl = (fileContent) => {
  if (!fileContent) return '';
  const idStr = String(fileContent).trim();
  
  if (idStr.startsWith('http://') || idStr.startsWith('https://') || idStr.startsWith('blob:') || idStr.startsWith('data:')) {
    return idStr;
  }
  
  return mediaService.getViewUrl(idStr);
};

const ChatMessage = ({ msg, isMine, msgTime, openLightbox, setSelectedMsgToForward, setForwardModalOpen }) => {
  const dataContent = (msg.content || msg.text || '').trim();

  const isUUID = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/i.test(dataContent);
  const isImageFileName = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(dataContent) && !dataContent.includes(' ');

  const isStickerFallback = /api\.dicebear\.com/i.test(dataContent);
  const isSticker = msg.msg_type === 'sticker' || isStickerFallback;
  
  const isForcedImage = !isSticker && (msg.msg_type === 'image' || /^blob:/i.test(dataContent) || /^data:image\//i.test(dataContent) || isUUID || isImageFileName);
  
  // 🌟 ĐỒNG BỘ ĐA TẦNG: Chấp nhận cả kiểu cấu trúc msg_type native lẫn chuỗi text mặt nạ từ DB đổ ra
  const isMaskedCallStr = dataContent.startsWith('__CALL_HISTORY__:');
  const isCallHistory = msg.msg_type === 'call_history' || isMaskedCallStr;
  const isMediaCard = isForcedImage || isSticker || isCallHistory;

  const handleContextMenu = (e) => {
    e.preventDefault(); 
    setSelectedMsgToForward(msg);
    setForwardModalOpen(true);
  };

  const renderBody = () => {
    if (isCallHistory) {
      try {
        const rawJson = isMaskedCallStr ? dataContent.substring('__CALL_HISTORY__:'.length) : dataContent;
        const callData = JSON.parse(rawJson);
        const isVideo = callData.type === 'video';
        
        const mins = Math.floor((callData.duration || 0) / 60);
        const secs = (callData.duration || 0) % 60;
        const timeString = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        let statusText = '';
        let subText = '';
        let icon = isVideo ? '📹' : '📞';

        const currentRole = localStorage.getItem('accessToken') && 
          JSON.parse(window.atob(localStorage.getItem('accessToken').split('.')[1])).customer_id ? 'customer' : 'staff';
        
        const isInitiatorMe = callData.initiator === currentRole;

        if (callData.status === 'completed') {
          statusText = isInitiatorMe ? (isVideo ? 'Cuộc gọi video đi' : 'Cuộc gọi thoại đi') : (isVideo ? 'Cuộc gọi video đến' : 'Cuộc gọi thoại đến');
          subText = `Thời lượng: ${timeString}`;
        } else if (callData.status === 'busy') {
          statusText = isInitiatorMe ? 'Máy bận' : 'Cuộc gọi nhỡ';
          subText = 'Đối phương đang bận';
        } else if (callData.status === 'rejected') {
          statusText = isInitiatorMe ? (isVideo ? 'Cuộc gọi video bị từ chối' : 'Cuộc gọi thoại bị từ chối') : (isVideo ? 'Từ chối cuộc gọi video' : 'Từ chối cuộc gọi thoại');
          subText = 'Đã từ chối';
        } else {
          statusText = isInitiatorMe ? (isVideo ? 'Cuộc gọi video không trả lời' : 'Cuộc gọi thoại không trả lời') : (isVideo ? 'Cuộc gọi video nhỡ' : 'Cuộc gọi thoại nhỡ');
          subText = 'Bỏ lỡ';
        }

        return (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-xs shadow-xs min-w-[220px] transition-all max-w-[280px] ${
            isMine 
              ? 'bg-blue-50/70 border-blue-100 text-blue-950 rounded-tr-none' 
              : 'bg-gray-50/90 border-gray-100 text-gray-800 rounded-tl-none'
          }`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shadow-xs ${
              callData.status === 'completed' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-500'
            }`}>
              {icon}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-bold truncate text-[13px]">{statusText}</span>
              <span className="text-[11px] font-medium text-gray-500">{subText}</span>
            </div>
          </div>
        );
      } catch (e) {
        console.error("❌ Lỗi cấu trúc JSON trong msg.content của call_history:", e);
        return <span className="text-xs italic text-gray-400 bg-gray-100 p-2 rounded-lg">Bản ghi cuộc gọi lỗi cấu trúc</span>;
      }
    }

    // 1. Sticker
    if (isSticker) {
      return (
        <div className="hover:scale-105 transition-transform duration-200 py-1">
          <img 
            src={resolveAbsoluteUrl(dataContent)} 
            alt="Sticker" 
            className="w-28 h-28 object-contain drop-shadow-md" 
            referrerPolicy="no-referrer"
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.src = 'https://placehold.co/112x112/transparent/94a3b8?text=Sticker+Lỗi';
            }} 
          />
        </div>
      );
    }

    // 2. Image
    if (isForcedImage) {
      const imageUrl = resolveAbsoluteUrl(dataContent);
      return (
        <div className="relative overflow-hidden rounded-xl border border-gray-100 shadow-xs max-w-[260px] bg-gray-50 flex items-center justify-center min-h-[100px] min-w-[100px]">
          <img 
            src={imageUrl} 
            alt="Chat Media" 
            className="max-h-[320px] w-full object-cover cursor-zoom-in hover:brightness-95 transition-all" 
            referrerPolicy="no-referrer"
            onClick={() => openLightbox(imageUrl)} 
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.src = 'https://placehold.co/260x200/e2e8f0/94a3b8?text=Image+Not+Found';
              e.target.className = "w-full h-full object-cover opacity-70 p-1 rounded-xl";
            }} 
          />
        </div>
      );
    }

    // 3. Audio
    if (msg.msg_type === 'audio' || /^data:audio\//i.test(dataContent) || /\.mp3/i.test(dataContent)) {
      return (
        <div className="flex items-center py-1 min-w-[220px]">
          <audio src={resolveAbsoluteUrl(dataContent)} controls className="w-full h-9" />
        </div>
      );
    }

    // 4. URL / Link Image / Video / Youtube
    const urlMatches = dataContent.match(/(https?:\/\/[^\s]+)/gi);
    
    if (urlMatches && urlMatches.length > 0) {
      const matchedUrl = urlMatches[0];
      let isImgUrl = false, isVideoUrl = false, isYouTube = false, youtubeId = '';
      let finalImageUrl = matchedUrl;
      let domainName = 'Liên kết ngoài';

      try { 
        const urlObj = new URL(matchedUrl);
        domainName = urlObj.hostname; 
        
        let cleanPath = urlObj.pathname.replace(/[.,;!?)]+$/, '');
        isImgUrl = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(cleanPath);
        
        if (domainName.includes('bing.com') && urlObj.searchParams.has('mediaurl')) {
          finalImageUrl = decodeURIComponent(urlObj.searchParams.get('mediaurl'));
          isImgUrl = true;
        } else if (domainName.includes('google.com') && urlObj.searchParams.has('imgurl')) {
          finalImageUrl = decodeURIComponent(urlObj.searchParams.get('imgurl'));
          isImgUrl = true;
        }
        
        if (!isImgUrl) {
          isVideoUrl = /\.(mp4|webm|ogg)$/i.test(cleanPath);
        }
        
        if (!isImgUrl && !isVideoUrl) {
          const ytMatch = matchedUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
          if (ytMatch && ytMatch[1]) {
            isYouTube = true;
            youtubeId = ytMatch[1];
          }
        }
      } catch (e) {}

      const parts = dataContent.split(matchedUrl);
      const shortUrl = matchedUrl.length > 40 ? matchedUrl.substring(0, 37) + '...' : matchedUrl;

      return (
        <div className="flex flex-col gap-2 mt-1 max-w-[280px]">
          <div className="text-[13px] leading-relaxed break-words whitespace-pre-wrap">
            {parts[0]}
            <a href={matchedUrl} target="_blank" rel="noopener noreferrer" title={matchedUrl} className={`underline font-medium break-all transition-colors ${isMine ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}>{shortUrl}</a>
            {parts[1]}
          </div>

          {isImgUrl ? (
            <img 
              src={finalImageUrl} 
              alt="Preview" 
              className="w-full max-h-[180px] rounded-lg cursor-zoom-in shadow-sm border border-black/5 object-cover bg-white" 
              referrerPolicy="no-referrer"
              onClick={() => openLightbox(finalImageUrl)} 
              onError={(e) => { e.target.style.display = 'none'; }} 
            />
          ) : isYouTube ? (
            <div className="relative w-full rounded-lg overflow-hidden bg-black shadow-sm" style={{ paddingBottom: '56.25%' }}>
              <iframe className="absolute top-0 left-0 w-full h-full" src={`https://www.youtube.com/embed/${youtubeId}`} title="YouTube" frameBorder="0" allowFullScreen></iframe>
            </div>
          ) : isVideoUrl ? (
            <video src={matchedUrl} controls className="w-full max-h-[220px] rounded-lg bg-black shadow-sm border border-gray-100" />
          ) : (
            <a href={matchedUrl} target="_blank" rel="noopener noreferrer" className={`flex flex-col rounded-xl overflow-hidden border transition-all text-left ${isMine ? 'bg-white/10 border-white/20 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
              <div className="p-2.5 flex flex-col gap-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>🔗 {domainName}</span>
                <p className={`text-xs font-bold line-clamp-2 leading-snug ${isMine ? 'text-white' : 'text-gray-800'}`}>{msg.link_title || "Xem nội dung trang web"}</p>
                <p className={`text-[11px] line-clamp-2 ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>{msg.link_description || "Nhấp để truy cập chi tiết."}</p>
              </div>
            </a>
          )}
        </div>
      );
    }

    return <span className="whitespace-pre-wrap break-words line-clamp-[15] leading-relaxed">{dataContent}</span>;
  };

  return (
    <div 
      onContextMenu={handleContextMenu}
      className={`flex flex-col max-w-[75%] group relative cursor-pointer select-none ${isMine ? 'self-end items-end' : 'self-start items-start'}`}
    >
      <div className={`absolute top-1/2 -translate-y-1/2 hidden group-hover:flex items-center bg-white border border-gray-200 rounded-lg shadow-md p-1 gap-1 z-20 text-[11px] ${isMine ? '-left-12' : '-right-12'}`}>
        <button type="button" onClick={() => { setSelectedMsgToForward(msg); setForwardModalOpen(true); }} className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-50" title="Chuyển tiếp">↩️</button>
      </div>

      <div className={`px-3.5 py-2 text-[13px] leading-relaxed shadow-xs ${
        isMediaCard 
          ? 'bg-transparent shadow-none p-0' 
          : isMine 
            ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' 
            : 'bg-white text-gray-800 border border-gray-200/60 rounded-xl rounded-tl-none'
      }`}>
        {renderBody()}
      </div>
      <span className="text-[10px] text-gray-400 mt-1 px-1 tracking-tight">{msgTime}</span>
    </div>
  );
};

export default ChatMessage;