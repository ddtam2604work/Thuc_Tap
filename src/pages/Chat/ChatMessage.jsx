// =========================================================================
// FILE: src/pages/Chat/ChatMessage.jsx (BẢN VÁ LỖI HIỂN THỊ VIDEO BASE64)
// =========================================================================
import React, { useState, useRef, useEffect } from 'react';
import { mediaService } from '../../services/mediaService'; 

export const resolveAbsoluteUrl = (fileContent) => {
  if (!fileContent) return '';
  const idStr = String(fileContent).trim();
  
  if (idStr.startsWith('http://') || idStr.startsWith('https://') || idStr.startsWith('blob:') || idStr.startsWith('data:')) {
    return idStr;
  }
  
  return mediaService.getViewUrl(idStr);
};

const ChatMessage = ({ msg, isMine: propIsMine, msgTime, openLightbox, setSelectedMsgToForward, setForwardModalOpen, role }) => {
  const dataContent = (msg.content || msg.text || '').trim();

  const [showMenu, setShowMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayableVideoUrl, setDisplayableVideoUrl] = useState(null);
  const menuRef = useRef(null);

  // Effect to convert Base64 video to a blob URL for stable playback
  useEffect(() => {
    let objectUrl = null;
    const isBase64Video = msg.msg_type === 'video' && dataContent.startsWith('data:video');

    if (isBase64Video) {
      const convertBase64ToBlobUrl = async () => {
        try {
          const response = await fetch(dataContent);
          const blob = await response.blob();
          objectUrl = URL.createObjectURL(blob);
          setDisplayableVideoUrl(objectUrl);
        } catch (error) {
          console.error('Lỗi chuyển đổi Base64 sang Blob URL:', error);
          setDisplayableVideoUrl(null); // Fallback or show error
        }
      };
      convertBase64ToBlobUrl();
    } else {
      // If it's not a base64 video, reset the state
      setDisplayableVideoUrl(null);
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [dataContent, msg.msg_type]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const isUUID = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/i.test(dataContent);
  const isImageFileName = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(dataContent) && !dataContent.includes(' ');
  const isVideoFileName = /\.(mp4|webm|ogg|mov)$/i.test(dataContent) && !dataContent.includes(' ');

  const isStickerFallback = /api\.dicebear\.com/i.test(dataContent);
  const isSticker = msg.msg_type === 'sticker' || isStickerFallback;
  
  const isForcedImage = !isSticker && (msg.msg_type === 'image' || /^blob:/i.test(dataContent) || /^data:image\//i.test(dataContent) || (isUUID && msg.msg_type !== 'video' && msg.msg_type !== 'audio') || isImageFileName);
  
  // 🌟 KHẮC PHỤC CHÍNH: Bổ sung kiểm tra chuỗi data:video/ hoặc tin nhắn định danh msg_type === 'video' để bắt được Base64 Video
  const isForcedVideo = !isSticker && (msg.msg_type === 'video' || /^data:video\//i.test(dataContent) || isVideoFileName);
  
  const isMaskedCallStr = dataContent.startsWith('__CALL_HISTORY__:');
  const isCallHistory = msg.msg_type === 'call_history' || isMaskedCallStr;

  let isMine = propIsMine;
  let parsedCallData = null;

  if (isCallHistory) {
    const rawJson = isMaskedCallStr ? dataContent.substring('__CALL_HISTORY__:'.length) : dataContent;
    try {
      parsedCallData = JSON.parse(rawJson);
      const isCustomerInitiator = parsedCallData.initiator === 'customer' || parsedCallData.initiator === 2 || parsedCallData.initiator === '2';
      isMine = role === 'customer' ? isCustomerInitiator : !isCustomerInitiator;
    } catch (e) {
      parsedCallData = {
        status: 'unknown',
        type: 'voice',
        duration: 0,
        customText: rawJson
      };
      isMine = propIsMine;
    }
  }

  const isMediaCard = isForcedImage || isForcedVideo || isSticker || isCallHistory;

  const handleContextMenu = (e) => {
    e.preventDefault(); 
    setSelectedMsgToForward(msg);
    setForwardModalOpen(true);
  };

  const renderBody = () => {
    if (isCallHistory) {
      const callData = parsedCallData;
      const isVideo = callData.type === 'video';
      
      const mins = Math.floor((callData.duration || 0) / 60);
      const secs = (callData.duration || 0) % 60;
      const timeString = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      let statusText = '';
      let subText = '';
      const isSuccess = callData.status === 'completed';

      if (callData.customText) {
        statusText = callData.customText;
        subText = 'Lịch sử cuộc gọi';
      } else if (callData.status === 'completed') {
        statusText = isMine ? (isVideo ? 'Cuộc gọi video đi' : 'Cuộc gọi thoại đi') : (isVideo ? 'Cuộc gọi video đến' : 'Cuộc gọi thoại đến');
        subText = `Thời lượng: ${timeString}`;
      } else if (callData.status === 'busy') {
        statusText = isMine ? 'Máy bận' : 'Cuộc gọi nhỡ';
        subText = 'Đối phương đang bận';
      } else if (callData.status === 'rejected') {
        statusText = isMine ? (isVideo ? 'Cuộc gọi video bị từ chối' : 'Cuộc gọi thoại bị từ chối') : (isVideo ? 'Từ chối cuộc gọi video' : 'Từ chối cuộc gọi thoại');
        subText = 'Đã từ chối';
      } else {
        statusText = isMine ? (isVideo ? 'Cuộc gọi video không trả lời' : 'Cuộc gọi thoại không trả lời') : (isVideo ? 'Cuộc gọi video nhỡ' : 'Cuộc gọi thoại nhỡ');
        subText = 'Bỏ lỡ';
      }

      return (
        <div className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl border text-xs shadow-xs min-w-[240px] transition-all max-w-[300px] ${
          isMine 
            ? 'bg-blue-500/10 border-blue-500/20 text-blue-950 rounded-tr-none' 
            : 'bg-slate-100/90 border-slate-200/80 text-slate-800 rounded-tl-none'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${
            isSuccess || callData.status === 'unknown' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
          }`}>
            {isVideo ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.72l.54 2.21a1 1 0 01-.24.97l-1.45 1.45a15.54 15.54 0 006.26 6.26l1.45-1.45a1 1 0 01.97-.24l2.21.54a1 1 0 01.72.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            )}
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <span className="font-semibold truncate text-[13px] tracking-tight">{statusText}</span>
            <span className={`text-[11px] font-medium ${isMine ? 'text-blue-600/80' : 'text-slate-500'}`}>{subText}</span>
          </div>
        </div>
      );
    }

    if (isSticker) {
      return (
        <div className="hover:scale-105 transition-transform duration-200 py-1">
          <img 
            src={resolveAbsoluteUrl(dataContent)} alt="Sticker" 
            className="w-28 h-28 object-contain drop-shadow-md" referrerPolicy="no-referrer"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/112x112/transparent/94a3b8?text=Sticker+Lỗi'; }} 
          />
        </div>
      );
    }

    if (isForcedImage) {
      const imageUrl = resolveAbsoluteUrl(dataContent);
      return (
        <div className="relative overflow-hidden rounded-xl border border-gray-100 shadow-xs max-w-[260px] bg-gray-50 flex items-center justify-center min-h-[100px] min-w-[100px]">
          <img 
            src={imageUrl} alt="Chat Media" referrerPolicy="no-referrer" onClick={() => openLightbox(imageUrl)} 
            className="max-h-[320px] w-full object-cover cursor-zoom-in hover:brightness-95 transition-all" 
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/260x200/e2e8f0/94a3b8?text=Image+Not+Found'; e.target.className = "w-full h-full object-cover opacity-70 p-1 rounded-xl"; }} 
          />
        </div>
      );
    }

    if (isForcedVideo) {
      // Ưu tiên sử dụng blob URL đã được tạo để tăng hiệu suất và độ ổn định
      const videoUrl = displayableVideoUrl || resolveAbsoluteUrl(dataContent);
      return (
        <div className="relative overflow-hidden rounded-xl border border-slate-200/60 shadow-md max-w-[280px] bg-slate-950 flex items-center justify-center min-h-[160px] min-w-[200px]">
          <video 
            key={videoUrl} // Thêm key để React nhận diện sự thay đổi src
            src={videoUrl} 
            controls 
            playsInline 
            preload="metadata"
            className="max-h-[320px] w-full h-auto object-contain rounded-xl" 
            onError={(e) => { console.error('Lỗi tải video. Có thể do nguồn không hợp lệ hoặc lỗi mạng.'); }} 
          />
        </div>
      );
    }

    if (msg.msg_type === 'audio' || /^data:audio\//i.test(dataContent) || /\.mp3/i.test(dataContent)) {
      return (
        <div className="flex items-center py-1 min-w-[220px]">
          <audio src={resolveAbsoluteUrl(dataContent)} controls className="w-full h-9" />
        </div>
      );
    }

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
        
        if (!isImgUrl) isVideoUrl = /\.(mp4|webm|ogg)$/i.test(cleanPath);
        
        if (!isImgUrl && !isVideoUrl) {
          const ytMatch = matchedUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
          if (ytMatch && ytMatch[1]) { isYouTube = true; youtubeId = ytMatch[1]; }
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
            <img src={finalImageUrl} alt="Preview" referrerPolicy="no-referrer" onClick={() => openLightbox(finalImageUrl)} onError={(e) => { e.target.style.display = 'none'; }} className="w-full max-h-[180px] rounded-lg cursor-zoom-in shadow-sm border border-black/5 object-cover bg-white" />
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

    const TEXT_LIMIT = 400;
    if (dataContent.length > TEXT_LIMIT) {
      return (
        <div className="flex flex-col gap-1">
          <span className="whitespace-pre-wrap break-words leading-relaxed">
            {isExpanded ? dataContent : `${dataContent.substring(0, TEXT_LIMIT)}...`}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className={`text-[11px] font-bold mt-1 self-end transition-colors ${isMine ? 'text-blue-200 hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}
          >
            {isExpanded ? 'Thu gọn' : 'Xem thêm'}
          </button>
        </div>
      );
    }

    return <span className="whitespace-pre-wrap break-words leading-relaxed">{dataContent}</span>;
  };

  return (
    <div 
      onContextMenu={handleContextMenu}
      className={`flex flex-col max-w-[75%] group relative cursor-pointer select-none ${isMine ? 'self-end items-end' : 'self-start items-start'}`}
    >
      <div ref={menuRef} className={`absolute top-1/2 -translate-y-1/2 flex flex-col items-center z-20 ${isMine ? '-left-8' : '-right-8'}`}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className={`w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-white/90 rounded-full shadow-xs border border-gray-100 transition-all ${showMenu ? 'opacity-100 ring-2 ring-blue-100' : 'opacity-0 group-hover:opacity-100'}`}
          title="Tùy chọn tin nhắn"
        >
          ⋮
        </button>

        {showMenu && (
          <div className={`absolute top-full mt-1 bg-white border border-gray-100 shadow-xl rounded-xl py-1.5 flex flex-col min-w-[130px] text-xs z-50 animate-in fade-in zoom-in-95 duration-100 ${isMine ? 'right-0' : 'left-0'}`}>
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); setSelectedMsgToForward(msg); setForwardModalOpen(true); setShowMenu(false); }} 
              className="px-3 py-2 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              <span>↩️</span> Chuyển tiếp
            </button>
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(dataContent); setShowMenu(false); }} 
              className="px-3 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <span>📋</span> Sao chép
            </button>
          </div>
        )}
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