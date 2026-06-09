import React, { useRef, useState } from 'react';
import Button from '../../components/skeleton/Button';
import { useChat } from '../../hooks/Chat/useChat';

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'https://113.161.204.185:4010';

const resolveAbsoluteUrl = (fileId) => {
  if (!fileId) return '';
  const idStr = String(fileId).trim();
  if (idStr.startsWith('http://') || idStr.startsWith('https://') || idStr.startsWith('blob:') || idStr.startsWith('data:')) return idStr;
  if (!idStr.includes('/') && !idStr.includes('.')) return `${MEDIA_URL}/api/get/public/${idStr}`;
  const cleanPath = idStr.startsWith('/') ? idStr : `/${idStr}`;
  return `${MEDIA_URL}${cleanPath}`;
};

const ChatPage = () => {
  const fileInputRef = useRef(null);
  const [stickerTab, setStickerTab] = useState('mine'); // 'mine' hoặc 'store'
  
  const {
    role, chatRooms, messages, activeRoomId, activeRoom, inputMessage, typingStatus,
    showMediaSidebar, isRecording, isListening, mediaStorage,
    showStickerPicker, myStickers, storeStickers, forwardModalOpen, setShowStickerPicker, setForwardModalOpen, setSelectedMsgToForward,
    setShowMediaSidebar, setInputMessage, messagesEndRef, messagesContainerRef,
    handleSendMessage, handleRoomSelect, handleScroll,
    handleSendImage, handleStartRecording, handleStopRecording, handleToggleSpeechToText,
    handleRecallMessage, handleForwardMessage, handleSendSticker, handleDownloadStickerPack
  } = useChat();

  // HOÀN THIỆN: Logic hiển thị xem trước hình ảnh/trang web chuẩn Zalo/Messenger
  const renderMessageBody = (msg, isMine) => {
    if (msg.is_recalled) {
      return <span className="text-gray-400 italic text-[12px] flex items-center gap-1">🚫 Tin nhắn đã được thu hồi</span>;
    }

    const dataContent = msg.content || msg.text || '';

    // 1. Dạng nhãn dán Sticker
    if (msg.msg_type === 'sticker') {
      return <img src={resolveAbsoluteUrl(dataContent)} alt="Sticker" className="w-20 h-20 object-contain drop-shadow-md" />;
    }

    // 2. Dạng ảnh tải lên
    if (msg.msg_type === 'image') {
      const imageUrl = resolveAbsoluteUrl(dataContent);
      return (
        <img 
          src={imageUrl} 
          alt="Chat Media" 
          className="max-w-[240px] max-h-[300px] rounded-lg cursor-pointer hover:opacity-95 shadow-sm object-cover" 
          onClick={() => window.open(imageUrl, '_blank')}
        />
      );
    }

    // 3. Dạng ghi âm
    if (msg.msg_type === 'audio' || dataContent.startsWith('data:audio') || /\.mp3/i.test(dataContent)) {
      return (
        <div className="flex items-center py-1 min-w-[200px]">
          <audio src={resolveAbsoluteUrl(dataContent)} controls className="w-full h-8 max-w-[220px]" />
        </div>
      );
    }

    // 4. Dạng liên kết (Tự bóc tách và tạo Card View mượt mà)
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    if (urlRegex.test(dataContent)) {
      const matchedUrl = dataContent.match(urlRegex)[0];
      const isImageUrl = /\.(jpg|jpeg|png|gif|webp|svg)/i.test(matchedUrl) || matchedUrl.includes('blob:');

      // Tách Domain để hiển thị Card Website
      let domainName = 'Trang web ngoài';
      try { domainName = new URL(matchedUrl).hostname; } catch (e) { }

      return (
        <div className="flex flex-col gap-1.5 mt-1">
          {/* Tag text link gốc được rút gọn */}
          <a href={matchedUrl} target="_blank" rel="noopener noreferrer" className={`underline font-semibold block max-w-[220px] truncate ${isMine ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-800'}`} title={dataContent}>
            {dataContent}
          </a>

          {/* Nếu là link ảnh -> Hiện ảnh trực tiếp */}
          {isImageUrl ? (
            <img src={matchedUrl} alt="Link Preview" className="max-w-[240px] max-h-[200px] rounded-lg cursor-pointer shadow-sm border border-black/10 object-cover bg-white" onClick={() => window.open(matchedUrl, '_blank')} />
          ) : (
            /* Nếu là link Web thường -> Hiện Card Messenger Style */
            <a href={matchedUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-2 rounded-lg transition-colors border max-w-[240px] ${isMine ? 'bg-black/10 border-black/10 hover:bg-black/20' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
              <div className="w-9 h-9 bg-white/80 flex items-center justify-center rounded shadow-xs flex-shrink-0 text-lg">🔗</div>
              <div className="flex-1 min-w-0">
                <p className={`text-[12px] font-bold truncate ${isMine ? 'text-white' : 'text-gray-800'}`}>{domainName}</p>
                <p className={`text-[10px] truncate ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>Nhấn để truy cập trang web</p>
              </div>
            </a>
          )}
        </div>
      );
    }

    return <span>{dataContent}</span>;
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden mt-1 relative">
      
      {/* --- SIDEBAR TRÁI --- */}
      {role !== 'customer' && (
        <div className="w-[320px] flex-shrink-0 border-r border-gray-100 flex flex-col bg-gray-50/30">
          <div className="p-4 border-b border-gray-100 bg-white">
            <h2 className="text-[16px] font-bold text-[#1E293B] mb-3">Tin nhắn hỗ trợ</h2>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
              <input type="text" placeholder="Tìm kiếm khách hàng..." className="w-full pl-8 pr-3 h-8.5 border border-gray-200 rounded-lg text-[12px] bg-[#FCFCFC] focus:outline-none focus:border-[#0052FF]" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {chatRooms.map((room) => (
              <div key={room.id} onClick={() => handleRoomSelect(room.id)} className={`flex items-start gap-3 p-3.5 border-b border-gray-50 cursor-pointer transition-colors ${activeRoomId === room.id ? 'bg-[#F0F5FF]' : 'hover:bg-gray-50'}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center border border-blue-200 font-bold text-[#0037B0] text-[14px]">{room.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={`text-[13px] truncate ${activeRoomId === room.id ? 'font-bold text-[#0037B0]' : 'font-semibold text-[#1E293B]'}`}>{room.name}</h3>
                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">{room.time}</span>
                  </div>
                  <p className="text-[12px] text-gray-500 truncate">{room.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- CỬA SỔ CHAT CHÍNH --- */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {activeRoom ? (
          <div className="h-[68px] px-6 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
            <div>
              <h2 className="text-[15px] font-bold text-[#1E293B]">{activeRoom.name}</h2>
              <span className="text-[11px] text-green-500 font-medium">● Đang hoạt động</span>
            </div>
            <button onClick={() => setShowMediaSidebar(!showMediaSidebar)} className="h-8 px-3 text-[12px] font-medium rounded-lg border border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors">
              {showMediaSidebar ? '✕ Đóng kho' : '📁 Kho dữ liệu'}
            </button>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 bg-[#F8FAFC]">Đang tải luồng dữ liệu kết nối...</div>
        )}

        {/* Khung hiển thị tin nhắn */}
        {activeRoom && (
          <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 p-6 overflow-y-auto bg-[#F8FAFC] flex flex-col gap-4 scrollbar-thin">
            {messages.map((msg) => {
              const isMine = role === 'customer' ? msg.sendertype === 2 : msg.sendertype === 1;
              const msgTime = msg.createdate ? new Date(msg.createdate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : msg.time;

              return (
                <div key={msg.id || msg.createdate} className={`flex flex-col max-w-[75%] group relative ${isMine ? 'self-end items-end' : 'self-start items-start'}`}>
                  
                  {/* Menu Hành Động thu hồi & chuyển tiếp */}
                  {!msg.is_recalled && (
                    <div className={`absolute top-0 -translate-y-6 hidden group-hover:flex items-center bg-white border border-gray-200 rounded-lg shadow-md px-1.5 py-0.5 gap-2 z-10 text-[11px] ${isMine ? 'right-0' : 'left-0'}`}>
                      <button type="button" onClick={() => { setSelectedMsgToForward(msg); setForwardModalOpen(true); }} className="text-gray-600 hover:text-blue-600 font-medium">
                        ↩ Chuyển tiếp
                      </button>
                      {isMine && (
                        <button type="button" onClick={() => handleRecallMessage(msg.id || msg._id)} className="text-red-500 hover:text-red-700 font-medium">
                          🗑️ Thu hồi
                        </button>
                      )}
                    </div>
                  )}

                  <div className={`px-4 py-2.5 text-[13px] shadow-xs ${
                    msg.msg_type === 'sticker' 
                      ? 'bg-transparent shadow-none p-0' 
                      : isMine 
                        ? 'bg-[#0052FF] text-white rounded-[18px] rounded-br-sm' 
                        : 'bg-white text-[#1E293B] border border-gray-100 rounded-[18px] rounded-bl-sm'
                  }`}>
                    {renderMessageBody(msg, isMine)}
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 px-1">{msgTime}</span>
                </div>
              );
            })}
            {typingStatus && <div className="text-[11px] text-gray-400 italic animate-pulse self-start">{typingStatus}</div>}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Khung công cụ nhập liệu */}
        {activeRoom && (
          <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0 relative">
            
            {/* GIAO DIỆN CHỌN VÀ TẢI STICKER */}
            {showStickerPicker && (
              <div className="absolute bottom-16 left-4 w-72 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden flex flex-col z-30 h-64 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex border-b border-gray-100 text-[12px] font-bold">
                  <button onClick={() => setStickerTab('mine')} className={`flex-1 py-2 ${stickerTab === 'mine' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-gray-500 hover:bg-gray-50'}`}>Đã tải</button>
                  <button onClick={() => setStickerTab('store')} className={`flex-1 py-2 ${stickerTab === 'store' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-gray-500 hover:bg-gray-50'}`}>Cửa hàng</button>
                </div>
                <div className="flex-1 p-3 overflow-y-auto grid grid-cols-4 gap-2 content-start">
                  {stickerTab === 'mine' ? (
                    myStickers.length > 0 ? myStickers.map((stkUrl, idx) => (
                      <img key={idx} src={stkUrl} alt="Sticker" onClick={() => handleSendSticker(stkUrl)} className="w-12 h-12 object-contain rounded hover:bg-gray-100 p-1 cursor-pointer transition-transform hover:scale-110" />
                    )) : <p className="col-span-4 text-center text-xs text-gray-400 mt-4">Chưa có nhãn dán nào.</p>
                  ) : (
                    storeStickers.length > 0 ? storeStickers.map((stkUrl, idx) => (
                      <div key={idx} className="relative group w-12 h-12 flex items-center justify-center border border-gray-100 rounded cursor-pointer hover:border-blue-300" onClick={() => handleDownloadStickerPack(stkUrl)}>
                        <img src={stkUrl} alt="Sticker Pack" className="w-10 h-10 object-contain group-hover:opacity-50" />
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[10px] font-bold text-blue-600 bg-white/80">Tải ⬇</span>
                      </div>
                    )) : <p className="col-span-4 text-center text-xs text-gray-400 mt-4">Bạn đã tải hết nhãn dán!</p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <div className="flex gap-1.5 pb-0.5">
                <button type="button" onClick={() => setShowStickerPicker(!showStickerPicker)} className={`w-8 h-8 flex items-center justify-center rounded-full text-lg ${showStickerPicker ? 'bg-blue-50 text-[#0052FF]' : 'text-gray-400 hover:text-[#0052FF]'}`} title="Gửi Sticker">💝</button>
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files?.[0] && handleSendImage(e.target.files[0])} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#0052FF] text-lg" title="Gửi ảnh">📷</button>
                <button type="button" onClick={isRecording ? handleStopRecording : handleStartRecording} className={`w-8 h-8 flex items-center justify-center rounded-full text-[16px] transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-md' : 'text-gray-400 hover:text-red-500'}`} title="Ghi âm thoại">🎙️</button>
                <button type="button" onClick={handleToggleSpeechToText} className={`w-8 h-8 flex items-center justify-center rounded-full text-[15px] transition-all ${isListening ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-orange-500'}`} title="Giọng nói thành chữ">🗣️</button>
              </div>

              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-[#0052FF] focus-within:ring-1 focus-within:ring-[#0052FF]">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isRecording}
                  placeholder={isRecording ? "🔴 Đang ghi âm thoại..." : isListening ? "🔊 Đang nhận diện giọng nói..." : "Nhập nội dung tin nhắn..."}
                  className="w-full bg-transparent text-[13px] text-[#1E293B] focus:outline-none h-8 disabled:opacity-50"
                  autoComplete="off"
                />
              </div>

              <Button type="submit" disabled={!inputMessage.trim() || isRecording} className="h-12 w-12 rounded-full flex items-center justify-center p-0 bg-[#0052FF] text-white disabled:bg-gray-100 disabled:text-gray-400">
                <span className="text-xl -mt-1 ml-1">➤</span>
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* --- SIDEBAR PHẢI - KHO LƯU TRỮ ZALO STYLE CHUẨN --- */}
      {showMediaSidebar && activeRoom && (
        <div className="w-[280px] flex-shrink-0 border-l border-gray-100 bg-white flex flex-col animate-in slide-in-from-right duration-200">
          <div className="p-4 border-b border-gray-100 font-bold text-[13px] text-gray-700 bg-gray-50/50">📁 Kho tư liệu hội thoại</div>
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-5 text-[12px] scrollbar-thin">
            <div>
              <h4 className="font-bold text-gray-400 mb-2 uppercase text-[10px] tracking-wider">Hình ảnh Upload ({mediaStorage.images.length})</h4>
              {mediaStorage.images.length === 0 ? <p className="text-gray-400 italic text-[11px]">Chưa có ảnh upload.</p> : (
                <div className="grid grid-cols-3 gap-1.5">
                  {mediaStorage.images.map((img, idx) => (
                    <img key={idx} src={img.url} alt="Storage Piece" onClick={() => window.open(img.url, '_blank')} className="w-full h-16 object-cover rounded border border-gray-100 cursor-pointer" />
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3">
              <h4 className="font-bold text-gray-400 mb-2 uppercase text-[10px] tracking-wider">Liên kết / Links ({mediaStorage.links.length})</h4>
              {mediaStorage.links.length === 0 ? <p className="text-gray-400 italic text-[11px]">Chưa có liên kết.</p> : (
                <div className="flex flex-col gap-2">
                  {mediaStorage.links.map((link, idx) => (
                    <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="text-[#0052FF] hover:underline bg-gray-50 p-2 rounded block border border-gray-100 font-medium max-w-[240px] truncate" title={link.url}>
                      {link.url}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CHUYỂN TIẾP TIN NHẮN --- */}
      {forwardModalOpen && selectedMsgToForward && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-80 p-5 shadow-2xl flex flex-col max-h-[400px]">
            <h3 className="font-bold text-gray-800 text-sm mb-3">Chuyển tiếp đến cuộc trò chuyện:</h3>
            <div className="flex-1 overflow-y-auto flex flex-col gap-1.5">
              {chatRooms.filter(room => room.id !== activeRoomId).map(room => (
                  <div key={room.id} onClick={() => handleForwardMessage(room.id)} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-100 cursor-pointer border border-gray-50">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0052FF] flex items-center justify-center font-bold text-xs">{room.avatar}</div>
                    <span className="text-[12.5px] font-semibold text-gray-700 truncate">{room.name}</span>
                  </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
              <button type="button" onClick={() => { setForwardModalOpen(false); setSelectedMsgToForward(null); }} className="px-4 py-1.5 bg-gray-100 text-gray-700 font-semibold rounded-lg text-xs hover:bg-gray-200">Hủy bỏ</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChatPage;