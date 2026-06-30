// =========================================================================
// FILE: src/components/Chat/ChatInputArea.jsx
// =========================================================================
import React, { useRef, useState, useEffect } from 'react';

const ChatInputArea = ({
  inputMessage, setInputMessage, isRecording, isListening,
  showStickerPicker, setShowStickerPicker, myStickers, storeStickers,
  handleSendMessage, handleSendImage, handleStartRecording, handleStopRecording,
  handleToggleSpeechToText, handleSendSticker, handleDownloadStickerPack,
  handleUploadSticker
}) => {
  const fileInputRef = useRef(null);
  const stickerInputRef = useRef(null); 
  const [stickerTab, setStickerTab] = useState('mine');
  const [selectedMedia, setSelectedMedia] = useState(null);

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    let foundMedia = false;
    for (let i = 0; i < items.length; i++) {
      const type = items[i].type;
      if (type.indexOf('image') !== -1 || type.indexOf('video') !== -1) {
        foundMedia = true;
        const file = items[i].getAsFile();
        if (file) {
          setSelectedMedia({ 
            file, 
            previewUrl: URL.createObjectURL(file),
            type: type.indexOf('video') !== -1 ? 'video' : 'image'
          });
        }
        break; 
      }
    }
    if (foundMedia) e.preventDefault();
  };

  const handleLocalSendMessage = (e) => {
    e.preventDefault();
    if (selectedMedia) {
      handleSendImage(selectedMedia.file);
      setSelectedMedia(null);
    }
    if (inputMessage.trim()) handleSendMessage(e); 
  };

  useEffect(() => {
    return () => { if (selectedMedia?.previewUrl) URL.revokeObjectURL(selectedMedia.previewUrl); };
  }, [selectedMedia]);

  return (
    <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0 relative flex flex-col gap-3">
      
      {/* KHUNG XEM TRƯỚC MEDIA TẢI LÊN */}
      {selectedMedia && (
        <div className="relative inline-block w-fit animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="relative rounded-xl overflow-hidden border-2 border-blue-500/30 shadow-md max-w-[140px] group">
            {selectedMedia.type === 'video' ? (
              <video src={selectedMedia.previewUrl} className="w-full h-auto max-h-[140px] object-cover bg-black" autoPlay muted loop />
            ) : (
              <img src={selectedMedia.previewUrl} alt="Preview" className="w-full h-auto max-h-[140px] object-cover" />
            )}
            <button type="button" onClick={() => setSelectedMedia(null)} className="absolute top-1 right-1 w-5 h-5 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-rose-500 hover:scale-110 transition-all text-[10px] z-10">✕</button>
            <div className="absolute bottom-0 inset-x-0 bg-slate-950/70 py-0.5 pointer-events-none">
              <span className="text-[9px] text-white font-medium block text-center truncate">Sẵn sàng gửi</span>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC STICKER PICKER POPUP */}
      {showStickerPicker && (
        <div className="absolute bottom-[84px] left-4 w-80 bg-white border border-slate-200/80 shadow-2xl rounded-2xl overflow-hidden flex flex-col z-30 h-76 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex border-b border-slate-100 text-xs font-semibold bg-slate-50 p-1 gap-1">
            <button type="button" onClick={() => setStickerTab('mine')} className={`flex-1 py-2 rounded-xl transition-all ${stickerTab === 'mine' ? 'text-blue-600 bg-white shadow-xs font-bold' : 'text-slate-500 hover:bg-slate-100'}`}>Bộ nhãn dán</button>
            <button type="button" onClick={() => setStickerTab('store')} className={`flex-1 py-2 rounded-xl transition-all ${stickerTab === 'store' ? 'text-blue-600 bg-white shadow-xs font-bold' : 'text-slate-500 hover:bg-slate-100'}`}>Cửa hàng xu hướng</button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto grid grid-cols-4 gap-3 content-start bg-white scrollbar-thin">
            {stickerTab === 'mine' ? (
              <>
                <div onClick={() => stickerInputRef.current?.click()} className="w-full h-14 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-slate-50 hover:border-blue-500 hover:bg-blue-50/50 transition-all group" title="Tải riêng nhãn dán">
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[9px] text-slate-400 font-bold mt-1 group-hover:text-blue-600">Tải lên</span>
                </div>
                {myStickers.map((stkUrl, idx) => (
                  <img key={idx} src={stkUrl} alt="Sticker" onClick={() => handleSendSticker(stkUrl)} className="w-full h-14 object-contain rounded-xl hover:bg-slate-100 p-1 cursor-pointer transition-all hover:scale-110 active:scale-95 duration-150" />
                ))}
              </>
            ) : (
              storeStickers.length > 0 ? storeStickers.map((stkUrl, idx) => (
                <div key={idx} className="relative group aspect-square flex items-center justify-center border border-slate-100 rounded-xl cursor-pointer bg-slate-50/50 hover:border-blue-500 transition-all overflow-hidden" onClick={() => handleDownloadStickerPack(stkUrl)}>
                  <img src={stkUrl} alt="Sticker Pack" className="w-11 h-11 object-contain group-hover:blur-[2px] transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[10px] font-bold text-white bg-blue-600/80 transition-all">Sở hữu</div>
                </div>
              )) : <p className="col-span-4 text-center text-xs text-slate-400 mt-12 font-medium">Bạn đã tải mọi gói nhãn dán xu hướng!</p>
            )}
          </div>
        </div>
      )}

      {/* FORM ACTION CONTROLS */}
      <form onSubmit={handleLocalSendMessage} className="flex items-end gap-2.5">
        <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 border border-slate-200/50">
          
          {/* NÚT CHỨC NĂNG 1: STICKERS TIMELINE */}
          <div className="relative group flex items-center justify-center">
            <button type="button" onClick={() => setShowStickerPicker(!showStickerPicker)} className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all active:scale-95 ${showStickerPicker ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <span className="absolute -top-9 bg-slate-900 text-white text-[10px] font-medium px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm pointer-events-none z-50">Nhãn dán</span>
          </div>
          
          <input type="file" accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime" ref={fileInputRef} className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const type = file.type.startsWith('video/') ? 'video' : 'image';
                setSelectedMedia({ file, previewUrl: URL.createObjectURL(file), type });
                e.target.value = ''; 
              }
            }} />
          
          <input type="file" accept="image/*" ref={stickerInputRef} className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && handleUploadSticker) {
                handleUploadSticker(file);
                e.target.value = ''; 
              }
            }} />

          {/* NÚT CHỨC NĂNG 2: GỬI ẢNH HOẶC VIDEO MP4 */}
          <div className="relative group flex items-center justify-center">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-200 transition-all active:scale-95">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <span className="absolute -top-9 bg-slate-900 text-white text-[10px] font-medium px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm pointer-events-none z-50">Gửi ảnh/video</span>
          </div>

          {/* NÚT CHỨC NĂNG 3: GHI ÂM GIỌNG NÓI AN TOÀN */}
          <div className="relative group flex items-center justify-center">
            <button type="button" onClick={isRecording ? handleStopRecording : handleStartRecording} className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all active:scale-95 ${isRecording ? 'bg-rose-500 text-white animate-pulse shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <span className="absolute -top-9 bg-slate-900 text-white text-[10px] font-medium px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm pointer-events-none z-50">{isRecording ? 'Dừng ghi' : 'Ghi âm thoại'}</span>
          </div>

          {/* NÚT CHỨC NĂNG 4: CHUYỂN GIỌNG NÓI THÀNH VĂN BẢN (SPEECH TO TEXT) */}
          <div className="relative group flex items-center justify-center">
            <button type="button" onClick={handleToggleSpeechToText} className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all active:scale-95 ${isListening ? 'bg-emerald-500 text-white animate-bounce' : 'text-slate-500 hover:bg-slate-200'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
            <span className="absolute -top-9 bg-slate-900 text-white text-[10px] font-medium px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm pointer-events-none z-50">Nhập bằng giọng nói</span>
          </div>
        </div>

        {/* KHUNG INPUT ĐIỀU KHIỂN CHÍNH */}
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10 transition-all shadow-inner">
          <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onPaste={handlePaste} disabled={isRecording} placeholder={isRecording ? "🔴 Đang ghi âm cuộc thoại hỗ trợ..." : isListening ? "🔊 Hệ thống đang nghe giọng nói..." : "Nhập nội dung... (Hỗ trợ Ctrl+V dán ảnh/video)"} className="w-full bg-transparent text-xs text-slate-800 focus:outline-none h-8 disabled:opacity-50" autoComplete="off" />
        </div>

        {/* NÚT GỬI TIN NHẮN CHUẨN HTML5 (ĐÃ KHÔI PHỤC HOÀN TOÀN) */}
        <button 
          type="submit" 
          disabled={(!inputMessage.trim() && !selectedMedia) || isRecording} 
          className="h-11 w-11 rounded-xl flex items-center justify-center bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none transition-all flex-shrink-0"
        >
          <svg className="w-4 h-4 transform rotate-45 -translate-x-0.5 translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatInputArea;