import React, { useState, useMemo } from 'react';
import { useChat } from '../../hooks/Chat/useChat';
import { useSocket } from '../../context/SocketContext'; // 🌟 BỔ SUNG: Import để lấy trực tiếp thực thể socket kết nối
import { useCall } from '../../hooks/Chat/useCall';       // 🌟 BỔ SUNG: Kích hoạt Hook đàm thoại WebRTC mới
import CallWindow from './CallWindow';                   // 🌟 BỔ SUNG: Layout overlay màn hình cuộc gọi

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

  // 🌟 BỔ SUNG: Liên kết điều phối logic trạng thái cuộc gọi
  const { socket, callSocket } = useSocket();
  const callProps = useCall(callSocket, activeRoomId, role);

  // 🌟 BỔ SUNG: Truy tìm chính xác tên người gọi dựa vào ID phòng cuộc gọi phát sinh
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
        } catch (e) {}
      }

      if (m.msg_type === 'image' || isBase64OrBlob || isUUID || isImageFileName || isImgUrl) {
        images.push(resolveAbsoluteUrl(finalImageUrl));
      }
    });

    return images;
  }, [messages]);

  const openLightbox = (url) => {
    const idx = chatImagesArray.indexOf(url);
    if (idx !== -1) {
      setActiveLightboxIndex(idx);
    } else {
      chatImagesArray.push(url);
      setActiveLightboxIndex(chatImagesArray.length - 1);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mt-1 relative select-none">
      
      {/* 1. Sidebar Trái */}
      <ChatSidebarLeft role={role} chatRooms={chatRooms} activeRoomId={activeRoomId} handleRoomSelect={handleRoomSelect} />

      {/* 2. Cửa sổ Chat Chính */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {activeRoom ? (
          <div className="h-[68px] px-6 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0 z-10">
            <div>
              <h2 className="text-sm font-bold text-gray-800">{activeRoom.name}</h2>
              <span className="text-[11px] text-green-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Trực tuyến
              </span>
            </div>
            
            {/* 🌟 THAY ĐỔI: Tích hợp nút Gọi điện thoại thoại (📞) và Video Call (📹) trực diện lên Header */}
            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => callProps.startCall('voice')} 
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all text-xs" 
                title="Gọi thoại thoại"
              >
                📞
              </button>
              <button 
                type="button" 
                onClick={() => callProps.startCall('video')} 
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all text-xs" 
                title="Gọi cuộc gọi Video"
              >
                📹
              </button>
              <span className="h-4 w-[1px] bg-gray-200 mx-1"></span>
              <button onClick={() => setShowMediaSidebar(!showMediaSidebar)} className="h-8 px-3 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors">
                {showMediaSidebar ? '✕ Đóng kho' : '📁 Kho dữ liệu'}
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
          <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 p-6 overflow-y-auto bg-slate-50 flex flex-col gap-4 scrollbar-thin">
            {messages.map((msg) => {
              const isMine = role === 'customer' ? msg.sendertype === 2 : msg.sendertype === 1;
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
        )}
      </div>

      {/* 3. Sidebar Phải */}
      <ChatSidebarRight showMediaSidebar={showMediaSidebar} activeRoom={activeRoom} mediaStorage={mediaStorage} openLightbox={openLightbox} />

      {/* 4. Modals (Forward & Lightbox) */}
      {forwardModalOpen && selectedMsgToForward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-xs">
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
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 animate-in fade-in duration-200">
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

      {/* 🌟 BỔ SUNG: Render màn hình điều phối cuộc gọi đè lên lớp cha */}
      <CallWindow {...callProps} roomName={currentCallRoomName} />

    </div>
  );
};

export default ChatPage;