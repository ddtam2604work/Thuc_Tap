import React from 'react';
import Button from '../../components/skeleton/Button';
import { useChat } from '../../hooks/Chat/useChat'; // Import hook mới

const ChatPage = () => {
  // Lấy toàn bộ state và logic từ hook useChat.
  const {
    chatRooms,
    messages,
    activeRoomId,
    activeRoom,
    inputMessage,
    setInputMessage,
    messagesEndRef,
    handleSendMessage,
    handleRoomSelect,
  } = useChat();

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden mt-1">
      
      {/* --- SIDEBAR: DANH SÁCH KHÁCH HÀNG --- */}
      <div className="w-[320px] flex-shrink-0 border-r border-gray-100 flex flex-col bg-gray-50/30">
        {/* Tiêu đề & Tìm kiếm */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="text-[16px] font-bold text-[#1E293B] mb-3">Tin nhắn hỗ trợ</h2>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              className="w-full pl-8 pr-3 h-8.5 border border-gray-200 rounded-lg text-[12px] bg-[#FCFCFC] focus:outline-none focus:border-[#0052FF]"
            />
          </div>
        </div>

        {/* Danh sách Chat (Room List) */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {chatRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => handleRoomSelect(room.id)}
              className={`flex items-start gap-3 p-3.5 border-b border-gray-50 cursor-pointer transition-colors ${
                activeRoomId === room.id ? 'bg-[#F0F5FF]' : 'hover:bg-gray-50'
              }`}
            >
              {/* Avatar kèm chấm Online */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center border border-blue-200">
                  <span className="text-[14px] font-bold text-[#0037B0]">{room.avatar}</span>
                </div>
                {room.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>

              {/* Thông tin hiển thị */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`text-[13px] truncate ${activeRoomId === room.id ? 'font-bold text-[#0037B0]' : 'font-semibold text-[#1E293B]'}`}>
                    {room.name}
                  </h3>
                  <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">{room.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className={`text-[12px] truncate ${room.unread > 0 ? 'text-[#1E293B] font-semibold' : 'text-gray-500'}`}>
                    {room.lastMessage}
                  </p>
                  {room.unread > 0 && (
                    <span className="ml-2 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full">
                      {room.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- KHU VỰC MAIN CHAT --- */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        
        {/* Header khung chat */}
        {activeRoom ? (
          <div className="h-[68px] px-6 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                 <span className="text-[14px] font-bold text-[#0037B0]">{activeRoom.avatar}</span>
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-[#1E293B]">{activeRoom.name}</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${activeRoom.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <span className="text-[11px] font-medium text-gray-500">
                    {activeRoom.isOnline ? 'Đang trực tuyến' : 'Ngoại tuyến'} • ID: {activeRoom.id.split('-')[2]}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-8 px-3 border-gray-200 text-gray-600 text-[12px] rounded-lg bg-gray-50 hover:bg-gray-100">
                Đóng phiên
              </Button>
            </div>
          </div>
        ) : null}

        {/* Khu vực hiển thị tin nhắn */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#F8FAFC] flex flex-col gap-4">
          <div className="text-center">
            <span className="text-[10px] font-medium text-gray-400 bg-white px-3 py-1 rounded-full shadow-xs border border-gray-100">
              Hôm nay
            </span>
          </div>

          {messages.map((msg) => {
            const isAdmin = msg.sender === 'admin';
            return (
              <div key={msg.id} className={`flex flex-col max-w-[70%] ${isAdmin ? 'self-end items-end' : 'self-start items-start'}`}>
                <div 
                  className={`px-4 py-2.5 rounded-[18px] text-[13px] shadow-sm ${
                    isAdmin 
                      ? 'bg-[#0052FF] text-white rounded-br-sm' 
                      : 'bg-white text-[#1E293B] border border-gray-100 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
              </div>
            );
          })}
          
          {/* Thẻ div rỗng dùng làm mốc để auto-scroll */}
          <div ref={messagesEndRef} />
        </div>

        {/* Khung nhập tin nhắn */}
        <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            {/* Các nút công cụ */}
            <div className="flex gap-1 pb-1">
              <button type="button" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#0052FF] hover:bg-blue-50 rounded-full transition-colors text-lg">
                +
              </button>
              <button type="button" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#0052FF] hover:bg-blue-50 rounded-full transition-colors text-lg">
                📷
              </button>
            </div>

            {/* Ô Textarea nhập liệu */}
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-[#0052FF] focus-within:ring-1 focus-within:ring-[#0052FF] transition-all">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập tin nhắn hỗ trợ khách hàng..."
                className="w-full bg-transparent text-[13px] text-[#1E293B] focus:outline-none h-8"
                autoComplete="off"
              />
            </div>

            {/* Nút gửi */}
            <Button 
              type="submit" 
              disabled={!inputMessage.trim()}
              className={`h-12 w-12 rounded-full flex items-center justify-center transition-all p-0 shadow-sm
                ${inputMessage.trim() ? 'bg-[#0052FF] hover:bg-blue-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
              `}
            >
              <span className="text-xl -mt-1 ml-1">➤</span>
            </Button>
          </form>
        </div>
        
      </div>
    </div>
  );
};

export default ChatPage;