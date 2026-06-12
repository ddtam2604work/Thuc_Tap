import React, { useCallback } from 'react';

const CallWindow = ({ 
  callState, callType, localStream, remoteStream, isMuted, isVideoOff, 
  acceptCall, rejectCall, endCall, toggleMute, toggleVideo, roomName 
}) => {

  // 🌟 GIẢI PHÁP: Sử dụng Callback Ref để bắt chính xác khoảnh khắc phần tử DOM vừa Mount
  const localVideoRef = useCallback((node) => {
    if (node && localStream) {
      node.srcObject = localStream;
    }
  }, [localStream]);

  const remoteVideoRef = useCallback((node) => {
    if (node && remoteStream) {
      node.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (callState === 'idle') return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center text-white select-none backdrop-blur-md animate-in fade-in duration-200">
      
      {/* KHÔNG GIAN HIỂN THỊ VIDEO */}
      <div className="relative w-full flex-1 max-w-4xl max-h-[70vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 m-4 flex items-center justify-center">
        
        {/* Luồng Remote Video hiển thị ở khung chính */}
        {callType === 'video' && callState === 'connected' && (
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        )}

        {/* Luồng Local Stream thu nhỏ ở góc khi hiển thị cuộc gọi Video */}
        {callType === 'video' && localStream && (
          <div className={`absolute rounded-xl overflow-hidden border-2 border-white/20 shadow-md transition-all ${
            callState === 'connected' ? 'bottom-4 right-4 w-36 h-48 z-10' : 'w-full h-full object-cover'
          }`}>
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            {isVideoOff && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-xs text-gray-400">Camera đóng</div>
            )}
          </div>
        )}

        {/* Hiển thị Avatar / Trạng thái cuộc gọi dạng Voice hoặc đang kết nối chờ */}
        {(callType === 'voice' || callState === 'calling' || callState === 'incoming') && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold animate-pulse shadow-xl">
              {roomName ? roomName[0].toUpperCase() : '?'}
            </div>
            <div>
              <h3 className="text-lg font-bold">{roomName || 'Đối tác'}</h3>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-mono">
                {callState === 'calling' && '⏳ Đang đổ chuông gọi đi...'}
                {callState === 'incoming' && '📞 Cuộc gọi hỗ trợ đến...'}
                {callState === 'connected' && '🟢 Đang đàm thoại...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* BAN ĐIỀU KHIỂN CHỨC NĂNG (ACTION CONTROLS) */}
      <div className="p-6 flex items-center gap-4 bg-white/5 rounded-full backdrop-blur-lg border border-white/10 mb-8 animate-in slide-in-from-bottom-4 duration-300">
        {callState === 'incoming' ? (
          <>
            <button onClick={acceptCall} className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-xl hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all shadow-lg" title="Nhận cuộc gọi">📞</button>
            <button onClick={rejectCall} className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-xl hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-lg" title="Từ chối">✕</button>
          </>
        ) : (
          <>
            <button onClick={toggleMute} className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all ${isMuted ? 'bg-orange-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`} title={isMuted ? 'Bật Micro' : 'Tắt Micro'}>
              {isMuted ? '🔇' : '🎙️'}
            </button>
            
            {callType === 'video' && (
              <button onClick={toggleVideo} className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all ${isVideoOff ? 'bg-orange-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`} title={isVideoOff ? 'Mở Camera' : 'Tắt Camera'}>
                {isVideoOff ? '📷✕' : '📷'}
              </button>
            )}

            <button onClick={endCall} className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-xl hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-md" title="Kết thúc">🛑</button>
          </>
        )}
      </div>
    </div>
  );
};

export default CallWindow;