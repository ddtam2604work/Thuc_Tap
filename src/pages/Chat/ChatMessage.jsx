import React from 'react';
import { mediaService } from '../../services/mediaService'; 

export const resolveAbsoluteUrl = (fileId) => {
  if (!fileId) return '';
  const idStr = String(fileId).trim();
  
  if (idStr.startsWith('http://') || idStr.startsWith('https://') || idStr.startsWith('blob:') || idStr.startsWith('data:')) {
    return idStr;
  }
  
  return mediaService.getViewUrl(idStr);
};

const ChatMessage = ({ msg, isMine, msgTime, openLightbox, setSelectedMsgToForward, setForwardModalOpen }) => {
  const dataContent = (msg.content || msg.text || '').trim();

  const renderBody = () => {
    // 1. Sticker
    if (msg.msg_type === 'sticker') {
      return (
        <div className="hover:scale-105 transition-transform duration-200 py-1">
          <img src={resolveAbsoluteUrl(dataContent)} alt="Sticker" className="w-28 h-28 object-contain drop-shadow-md" />
        </div>
      );
    }

    // 2. Image (Bắt chết định dạng ảnh, ưu tiên cao nhất)
    const isForcedImage = msg.msg_type === 'image' || /^blob:/i.test(dataContent) || /^data:image\//i.test(dataContent);
    
    if (isForcedImage) {
      const imageUrl = resolveAbsoluteUrl(dataContent);
      return (
        <div className="relative overflow-hidden rounded-xl border border-gray-100 shadow-xs max-w-[260px] bg-gray-100 min-h-[100px] min-w-[100px] flex items-center justify-center">
          <img 
            src={imageUrl} 
            alt="Chat Media" 
            className="max-h-[320px] w-full object-cover cursor-zoom-in hover:brightness-95 transition-all" 
            onClick={() => openLightbox(imageUrl)} 
            onError={(e) => { 
              // Nếu link ảnh bị hỏng/chết, hiển thị thông báo lỗi thay vì ẩn mất tiêu
              e.target.onerror = null; 
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjY2NjIiBkPSJNMTIgMmMyLjIxIDAgNC4yMS44OSA1LjY2IDIuMzRMMi4MzQgMTcuNjZDMS4xMSAxNi4yMSAyIDE0LjIxIDIgMTJjMC01LjUyIDQuNDgtMTAgMTAtMTB6bTcuNjYgMi4zNEMyMS4xMSA1Ljc5IDIyIDcuNzkgMjIgMTJjMCA1LjUyLTQuNDggMTAtMTAgMTAtMi4yMSAwLTQuMjEtLjg5LTUuNjYtMi4zNGwxNS4zMi0xNS4zMnoiLz48L3N2Zz4=';
              e.target.className = "w-12 h-12 opacity-50 p-2";
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
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    
    if (urlRegex.test(dataContent)) {
      const matchedUrl = dataContent.match(urlRegex)[0];
      let isImageUrl = false, isVideoUrl = false, isYouTube = false, youtubeId = '';
      let finalImageUrl = matchedUrl;
      let domainName = 'Liên kết ngoài';

      try { 
        const urlObj = new URL(matchedUrl);
        domainName = urlObj.hostname; 
        
        let cleanPath = urlObj.pathname.replace(/[.,;!?)]+$/, '');
        isImageUrl = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(cleanPath);
        
        if (domainName.includes('bing.com') && urlObj.searchParams.has('mediaurl')) {
          finalImageUrl = decodeURIComponent(urlObj.searchParams.get('mediaurl'));
          isImageUrl = true;
        } else if (domainName.includes('google.com') && urlObj.searchParams.has('imgurl')) {
          finalImageUrl = decodeURIComponent(urlObj.searchParams.get('imgurl'));
          isImageUrl = true;
        }
        
        if (!isImageUrl) {
          isVideoUrl = /\.(mp4|webm|ogg)$/i.test(cleanPath);
        }
        
        if (!isImageUrl && !isVideoUrl) {
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

          {isImageUrl ? (
            <img src={finalImageUrl} alt="Preview" className="w-full max-h-[180px] rounded-lg cursor-zoom-in shadow-sm border border-black/5 object-cover bg-white" onClick={() => openLightbox(finalImageUrl)} onError={(e) => { e.target.style.display = 'none'; }} />
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

    // 5. Text thường
    return <span className="whitespace-pre-wrap break-words line-clamp-[15] leading-relaxed">{dataContent}</span>;
  };

  return (
    <div className={`flex flex-col max-w-[75%] group relative ${isMine ? 'self-end items-end' : 'self-start items-start'}`}>
      <div className={`absolute top-1/2 -translate-y-1/2 hidden group-hover:flex items-center bg-white border border-gray-200 rounded-lg shadow-md p-1 gap-1 z-20 text-[11px] ${isMine ? '-left-12' : '-right-12'}`}>
        <button type="button" onClick={() => { setSelectedMsgToForward(msg); setForwardModalOpen(true); }} className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-50" title="Chuyển tiếp">↩️</button>
      </div>

      <div className={`px-3.5 py-2 text-[13px] leading-relaxed shadow-xs ${msg.msg_type === 'sticker' ? 'bg-transparent shadow-none p-0' : isMine ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' : 'bg-white text-gray-800 border border-gray-200/60 rounded-xl rounded-tl-none'}`}>
        {renderBody()}
      </div>
      <span className="text-[10px] text-gray-400 mt-1 px-1 tracking-tight">{msgTime}</span>
    </div>
  );
};

export default ChatMessage;