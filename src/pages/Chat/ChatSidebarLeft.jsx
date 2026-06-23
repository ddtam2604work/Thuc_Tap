import React, { useState } from 'react';

const ChatSidebarLeft = ({ role, chatRooms, activeRoomId, handleRoomSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (role === 'customer') return null;

  const filteredRooms = chatRooms.filter(room => 
    room?.name?.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="w-[320px] flex-shrink-0 border-r border-gray-100 flex flex-col bg-gray-50/50 h-full overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-white">
        <h2 className="text-[16px] font-bold text-gray-800 mb-3">Tin nhắn hỗ trợ</h2>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          
          <input 
            type="text" 
            placeholder="Tìm kiếm khách hàng..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-8 h-9 border border-gray-200 rounded-lg text-xs bg-[#FCFCFC] focus:outline-none focus:border-blue-500 focus:bg-white transition-all" 
          />
          
          {searchTerm && (
            <button 
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 w-4 h-4 flex items-center justify-center transition-colors"
              title="Xoá tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredRooms.map((room) => {
          // 🎯 Render trạng thái chưa đọc
          const hasUnread = Number(room.unread) > 0;
          return (
            <div 
              key={room.id} 
              onClick={() => handleRoomSelect(room.id)} 
              className={`flex items-start gap-3 p-3.5 border-b border-gray-50 cursor-pointer transition-colors ${activeRoomId === room.id ? 'bg-blue-50/70' : 'hover:bg-gray-50'}`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-xs flex-shrink-0 relative">
                  {room.avatar}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`text-xs truncate ${activeRoomId === room.id ? 'font-bold text-blue-700' : (hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800')}`}>{room.name}</h3>
                  <div className="flex items-center gap-1.5 ml-2 shrink-0">
                      <span className={`text-[10px] whitespace-nowrap ${hasUnread ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>{room.time}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                    <p className={`text-xs truncate ${hasUnread ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>{room.lastMessage}</p>
                    {/* 🎯 Hiển thị cục Badge đỏ chưa đọc */}
                    {hasUnread && (
                        <span className="ml-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm">
                            {room.unread > 99 ? '99+' : room.unread}
                        </span>
                    )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredRooms.length === 0 && (
          <div className="text-center text-xs text-gray-400 mt-5">Không tìm thấy khách hàng.</div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebarLeft;