// Khu vực nhập liệu, xem trước ảnh, dán ảnh
import React, { useRef, useState, useEffect } from 'react';
import Button from '../../components/skeleton/Button';

const ChatInputArea = ({
  inputMessage, setInputMessage, isRecording, isListening,
  showStickerPicker, setShowStickerPicker, myStickers, storeStickers,
  handleSendMessage, handleSendImage, handleStartRecording, handleStopRecording,
  handleToggleSpeechToText, handleSendSticker, handleDownloadStickerPack
}) => {
  const fileInputRef = useRef(null);
  const [stickerTab, setStickerTab] = useState('mine');
  const [selectedImage, setSelectedImage] = useState(null);

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    let foundImage = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        foundImage = true;
        const file = items[i].getAsFile();
        if (file) setSelectedImage({ file, previewUrl: URL.createObjectURL(file) });
        break; 
      }
    }
    if (foundImage) e.preventDefault();
  };

  const handleLocalSendMessage = (e) => {
    e.preventDefault();
    if (selectedImage) {
      handleSendImage(selectedImage.file);
      setSelectedImage(null);
    }
    if (inputMessage.trim()) handleSendMessage(e); 
  };

  useEffect(() => {
    return () => { if (selectedImage?.previewUrl) URL.revokeObjectURL(selectedImage.previewUrl); };
  }, [selectedImage]);

  return (
    <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0 relative flex flex-col gap-3">
      {selectedImage && (
        <div className="relative inline-block w-fit animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="relative rounded-xl overflow-hidden border-2 border-blue-100 shadow-sm max-w-[140px] group">
            <img src={selectedImage.previewUrl} alt="Preview" className="w-full h-auto max-h-[140px] object-cover group-hover:brightness-95 transition-all" />
            <button type="button" onClick={() => setSelectedImage(null)} className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-500 hover:scale-110 transition-all text-xs" title="Xóa ảnh">✕</button>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1">
              <span className="text-[9px] text-white font-medium block truncate text-center">Sẵn sàng gửi</span>
            </div>
          </div>
        </div>
      )}

      {showStickerPicker && (
        <div className="absolute bottom-[88px] left-4 w-80 bg-white border border-gray-200/80 shadow-2xl rounded-xl overflow-hidden flex flex-col z-30 h-72 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex border-b border-gray-100 text-xs font-bold bg-gray-50">
            <button onClick={() => setStickerTab('mine')} className={`flex-1 py-2.5 transition-colors ${stickerTab === 'mine' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}>Bộ nhãn dán</button>
            <button onClick={() => setStickerTab('store')} className={`flex-1 py-2.5 transition-colors ${stickerTab === 'store' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}>Cửa hàng</button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto grid grid-cols-4 gap-3 content-start bg-white scrollbar-thin">
            {stickerTab === 'mine' ? (
              myStickers.length > 0 ? myStickers.map((stkUrl, idx) => (
                <img key={idx} src={stkUrl} alt="Sticker" onClick={() => handleSendSticker(stkUrl)} className="w-full h-14 object-contain rounded-lg hover:bg-gray-100 p-1 cursor-pointer transition-transform hover:scale-110" />
              )) : <p className="col-span-4 text-center text-xs text-gray-400 mt-8">Chưa có nhãn dán khả dụng.</p>
            ) : (
              storeStickers.length > 0 ? storeStickers.map((stkUrl, idx) => (
                <div key={idx} className="relative group aspect-square flex items-center justify-center border border-gray-100 rounded-lg cursor-pointer bg-slate-50 hover:border-blue-400 transition-all overflow-hidden" onClick={() => handleDownloadStickerPack(stkUrl)}>
                  <img src={stkUrl} alt="Sticker Pack" className="w-10 h-10 object-contain group-hover:blur-xs transition-all" />
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[10px] font-bold text-white bg-blue-600/80 transition-opacity">Tải về</span>
                </div>
              )) : <p className="col-span-4 text-center text-xs text-gray-400 mt-8">Bạn đã sở hữu toàn bộ cửa hàng!</p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleLocalSendMessage} className="flex items-end gap-2">
        <div className="flex gap-1 bg-gray-50 rounded-xl p-1 border border-gray-100">
          <button type="button" onClick={() => setShowStickerPicker(!showStickerPicker)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-colors ${showStickerPicker ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`} title="Nhãn dán">💝</button>
          <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setSelectedImage({ file: file, previewUrl: URL.createObjectURL(file) });
                e.target.value = ''; 
              }
            }} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded-lg text-lg" title="Hình ảnh">📷</button>
          <button type="button" onClick={isRecording ? handleStopRecording : handleStartRecording} className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 hover:bg-gray-200'}`} title="Ghi âm">🎙️</button>
          <button type="button" onClick={handleToggleSpeechToText} className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-all ${isListening ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-200'}`} title="Chuyển giọng nói">🗣️</button>
        </div>

        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-inner">
          <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onPaste={handlePaste} disabled={isRecording} placeholder={isRecording ? "🔴 Đang ghi âm thoại..." : isListening ? "🔊 Đang nghe giọng nói..." : "Nhập nội dung... (Hỗ trợ Ctrl+V dán ảnh nhanh)"} className="w-full bg-transparent text-xs text-gray-800 focus:outline-none h-8 disabled:opacity-50" autoComplete="off" />
        </div>

        <Button type="submit" disabled={(!inputMessage.trim() && !selectedImage) || isRecording} className="h-11 w-11 rounded-xl flex items-center justify-center bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none transition-all flex-shrink-0">
          <span className="text-sm">➤</span>
        </Button>
      </form>
    </div>
  );
};

export default ChatInputArea;