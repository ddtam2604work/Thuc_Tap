import React, { useState, useMemo } from 'react';
import { useChat } from '../../hooks/Chat/useChat';
import { useSocket } from '../../context/SocketContext'; 
import { useCall } from '../../hooks/Chat/useCall';       
import CallWindow from './CallWindow';                   

// Import các modules đã được bóc tách
import ChatSidebarLeft from './ChatSidebarLeft';
import ChatSidebarRight from './ChatSidebarRight';
import ChatMessage, { resolveAbsoluteUrl } from './ChatMessage';
import ChatInputArea from './ChatInputArea';

const ChatPage = () => {
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);

  const {
    role, chatRooms, messages, activeRoomId, activeRoom, inputMessage, typingStatus,
    showMediaSidebar, isRecording, isListening, mediaStorage,
    showStickerPicker, myStickers, storeStickers, forwardModalOpen, selectedMsgToForward,
    setShowStickerPicker, setForwardModalOpen, setSelectedMsgToForward,
    setShowMediaSidebar, setInputMessage, messagesEndRef, messagesContainerRef,
    handleSendMessage, handleRoomSelect, handleScroll,
    handleSendImage, handleStartRecording, handleStopRecording, handleToggleSpeechToText,
    handleForwardMessage, handleSendSticker, handleDownloadStickerPack
  } = useChat();

  const { callSocket } = useSocket();
  const callProps = useCall(callSocket, activeRoomId, role);

  const currentCallRoomName = useMemo(() => {
    const targetRoom = chatRooms.find(r => r.id === callProps.roomCallId);
    return targetRoom ? targetRoom.name : (activeRoom?.name || 'Khách hàng hỗ trợ');
  }, [callProps.roomCallId, chatRooms, activeRoom]);

  const chatImagesArray = useMemo(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const images = [];

    messages.forEach(m => {
      const content = (m.content || m.text || '').trim();
      if (!content) return;

      const isUUID = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/i.test(content);
      const isImageFileName = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(content) && !content.includes(' ');
      const isBase64OrBlob = /^blob:/i.test(content) || /^data:image\//i.test(content);

      let isImgUrl = false;
      let finalImageUrl = content;

      if (urlRegex.test(content)) {
        const matchedUrl = content.match(urlRegex)[0];
        finalImageUrl = matchedUrl;
        try {
          const urlObj = new URL(matchedUrl);
          const domainName = urlObj.hostname;
          let cleanPath = urlObj.pathname.replace(/[.,;!?)]+$/, '');
          isImgUrl = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(cleanPath);

          if (domainName.includes('bing.com') && urlObj.searchParams.has('mediaurl')) {
            finalImageUrl = decodeURIComponent(urlObj.searchParams.get('mediaurl'));
            isImgUrl = true;
          } else if (domainName.includes('google.com') && urlObj.searchParams.has('imgurl')) {
            finalImageUrl = decodeURIComponent(urlObj.searchParams.get('imgurl'));
            isImgUrl = true;
          }
        } catch {
          // Silent catch for malformed URLs
        }
      }

      if (m.msg_type === 'image' || isBase64OrBlob || isUUID || isImageFileName || isImgUrl) {
        images.push(resolveAbsoluteUrl(finalImageUrl));
      }
    });

    return images;
  }, [messages]);

  const [extraImages, setExtraImages] = useState([]);
  const fullChatImages = useMemo(() => [...chatImagesArray, ...extraImages], [chatImagesArray, extraImages]);

  const openLightbox = (url) => {
    const idx = fullChatImages.indexOf(url);
    if (idx !== -1) {
      setActiveLightboxIndex(idx);
    } else {
      setExtraImages(prev => [...prev, url]);
      setActiveLightboxIndex(fullChatImages.length);
    }
  };

  return (
    <div className="flex w-full h-[calc(100vh-140px)] lg:h-[calc(100vh-160px)] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative select-none"> 
      {/* 1. Sidebar Trái */}
      <ChatSidebarLeft role={role} chatRooms={chatRooms} activeRoomId={activeRoomId} handleRoomSelect={handleRoomSelect} />
      
      {/* 2. Cửa sổ Chat Chính */}
      <div className="flex-1 flex flex-col bg-white min-w-0 h-full">
        {activeRoom ? (
          <div className="h-[68px] px-6 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0 z-10">
            <div>
              <h2 className="text-sm font-bold text-gray-800">{activeRoom.name}</h2>
              <span className="text-[11px] text-green-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Trực tuyến
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => callProps.startCall('voice')} 
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-green-600 bg-gray-50 hover:bg-green-50 hover:border-green-200 transition-all group" 
                title="Gọi thoại"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </button>

              <button 
                type="button" 
                onClick={() => callProps.startCall('video')} 
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all group" 
                title="Gọi Video"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
              </button>

              <span className="h-4 w-[1px] bg-gray-200 mx-1"></span>
              
              <button 
                onClick={() => setShowMediaSidebar(!showMediaSidebar)} 
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${
                  showMediaSidebar 
                    ? 'border-amber-300 bg-amber-50 text-amber-500' 
                    : 'border-gray-200 text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-gray-600'
                }`}
                title={showMediaSidebar ? "Đóng kho dữ liệu" : "Mở kho dữ liệu"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 gap-2">
            <span className="text-3xl animate-bounce">💬</span>
            <p className="text-xs font-medium">Hãy chọn một cuộc hội thoại hỗ trợ</p>
          </div>
        )}

        {/* Khung hiển thị List tin nhắn */}
        {activeRoom && (
          <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto p-6 bg-slate-50 flex flex-col gap-4 scrollbar-thin">
            {messages.map((msg) => {
              let isMine = role === 'customer' ? msg.sendertype === 2 : msg.sendertype === 1;
              
              if (typeof msg.content === 'string' && msg.content.startsWith('__CALL_HISTORY__:')) {
                  try {
                      const callData = JSON.parse(msg.content.replace('__CALL_HISTORY__:', ''));
                      isMine = callData.initiator === role;
                  } catch {
                      // Silent catch for invalid JSON
                  }
              }

              const msgTime = msg.createdate ? new Date(msg.createdate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : msg.time;
              const uniqueMsgId = msg.id || msg._id || msg.chatmessage_id || msg.createdate;

              return (
                <div 
                  key={uniqueMsgId} 
                  id={`msg-${msg.id || msg._id || msg.chatmessage_id}`} 
                  className={`flex flex-col w-full ${isMine ? 'items-end' : 'items-start'} transition-all duration-300 scroll-mt-4`}
                >
                  <ChatMessage 
                    msg={msg} 
                    isMine={isMine} 
                    msgTime={msgTime}
                    openLightbox={openLightbox}
                    setSelectedMsgToForward={setSelectedMsgToForward}
                    setForwardModalOpen={setForwardModalOpen}
                    role={role} 
                  />
                </div>
              );
            })}
            {typingStatus && <div className="text-xs text-gray-400 italic animate-pulse self-start ml-2 bg-gray-200/50 px-2 py-1 rounded-md">{typingStatus}</div>}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Khung Nhập Liệu */}
        {activeRoom && (
          <div className="flex-shrink-0 bg-white">
            <ChatInputArea 
              inputMessage={inputMessage} setInputMessage={setInputMessage}
              isRecording={isRecording} isListening={isListening}
              showStickerPicker={showStickerPicker} setShowStickerPicker={setShowStickerPicker}
              myStickers={myStickers} storeStickers={storeStickers}
              handleSendMessage={handleSendMessage} handleSendImage={handleSendImage}
              handleStartRecording={handleStartRecording} handleStopRecording={handleStopRecording}
              handleToggleSpeechToText={handleToggleSpeechToText} handleSendSticker={handleSendSticker}
              handleDownloadStickerPack={handleDownloadStickerPack}
            />
          </div>
        )}
      </div>

      {/* 3. Sidebar Phải */}
      <ChatSidebarRight showMediaSidebar={showMediaSidebar} activeRoom={activeRoom} mediaStorage={mediaStorage} openLightbox={openLightbox} />

      {/* 4. Modals (Forward & Lightbox) */}
      {forwardModalOpen && selectedMsgToForward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] backdrop-blur-xs">
          <div className="bg-white rounded-xl w-80 p-5 shadow-2xl flex flex-col max-h-[400px] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-gray-800 text-xs mb-3">Chuyển tiếp tin nhắn đến:</h3>
            <div className="flex-1 overflow-y-auto flex flex-col gap-1 scrollbar-thin">
              {chatRooms.filter(room => room.id !== activeRoomId).map(room => (
                  <div key={room.id} onClick={() => handleForwardMessage(room.id)} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">{room.avatar}</div>
                    <span className="text-xs font-semibold text-gray-700 truncate">{room.name}</span>
                  </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
              <button type="button" onClick={() => { setForwardModalOpen(false); setSelectedMsgToForward(null); }} className="px-4 py-1.5 bg-gray-100 text-gray-700 font-bold rounded-lg text-xs hover:bg-gray-200 transition-colors">Hủy bỏ</button>
            </div>
          </div>
        </div>
      )}

      {activeLightboxIndex !== null && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] animate-in fade-in duration-200">
          <button className="absolute top-4 right-4 text-white text-2xl w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors" onClick={() => setActiveLightboxIndex(null)}>✕</button>
          {chatImagesArray.length > 1 && (
            <button className="absolute left-6 text-white text-2xl w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30" disabled={activeLightboxIndex === 0} onClick={() => setActiveLightboxIndex(prev => Math.max(0, prev - 1))}>◀</button>
          )}
          <img src={chatImagesArray[activeLightboxIndex]} alt="Lightbox Target" className="max-w-[90vw] max-h-[85vh] object-contain rounded shadow-2xl animate-in zoom-in-95 duration-200" />
          {chatImagesArray.length > 1 && (
            <button className="absolute right-6 text-white text-2xl w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30" disabled={activeLightboxIndex === chatImagesArray.length - 1} onClick={() => setActiveLightboxIndex(prev => Math.min(chatImagesArray.length - 1, prev + 1))}>▶</button>
          )}
          <div className="absolute bottom-4 text-white/60 text-xs font-mono">{activeLightboxIndex + 1} / {chatImagesArray.length}</div>
        </div>
      )}

      <CallWindow {...callProps} roomName={currentCallRoomName} />

    </div>
  );
};

export default ChatPage;