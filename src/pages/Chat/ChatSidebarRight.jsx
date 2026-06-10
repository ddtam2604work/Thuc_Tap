//Kho lưu trữ Media/Links
import React from 'react';

const ChatSidebarRight = ({ showMediaSidebar, activeRoom, mediaStorage, openLightbox }) => {
  if (!showMediaSidebar || !activeRoom) return null;

  return (
    <div className="w-[280px] flex-shrink-0 border-l border-gray-100 bg-white flex flex-col animate-in slide-in-from-right duration-200 z-10">
      <div className="p-4 border-b border-gray-100 font-bold text-xs text-gray-700 bg-gray-50">📁 Kho tư liệu hội thoại</div>
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-5 text-xs scrollbar-thin">
        <div>
          <h4 className="font-bold text-gray-400 mb-2 uppercase text-[10px] tracking-wider">Hình ảnh ({mediaStorage.images.length})</h4>
          {mediaStorage.images.length === 0 ? <p className="text-gray-400 italic text-[11px]">Chưa có ảnh chia sẻ.</p> : (
            <div className="grid grid-cols-3 gap-1.5">
              {mediaStorage.images.map((img, idx) => (
                <img key={idx} src={img.url} alt="Storage Piece" onClick={() => openLightbox(img.url)} className="w-full h-16 object-cover rounded-md border border-gray-100 cursor-zoom-in hover:brightness-95 transition-all" />
              ))}
            </div>
          )}
        </div>

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