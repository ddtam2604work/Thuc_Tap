import React, { useCallback } from 'react';

const CallWindow = ({ 
  callState, callType, localStream, remoteStream, isMuted, isVideoOff, 
  acceptCall, rejectCall, endCall, toggleMute, toggleVideo, roomName 
}) => {

  // 🌟 GIẢI PHÁP LOGIC: Giữ nguyên Callback Ref xử lý DOM Stream
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
    <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-between text-white select-none backdrop-blur-xl animate-in fade-in duration-300 p-4 md:p-6">
      
      {/* HEADER: THÔNG TIN PHÒNG HỌP / TRẠNG THÁI */}
      <div className="w-full max-w-5xl flex items-center justify-between dynamic-header z-20 bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium tracking-wide text-slate-300">
            {roomName || 'Cuộc gọi bảo mật'}
          </span>
        </div>
        <div className="text-xs font-mono px-3 py-1 bg-white/10 rounded-full text-slate-400 border border-white/5">
          {callType === 'video' ? 'VIDEO CALL' : 'AUDIO CALL'}
        </div>
      </div>

      {/* KHÔNG GIAN HIỂN THỊ VIDEO TRUNG TÂM */}
      <div className="relative w-full flex-1 max-w-5xl my-4 bg-slate-900 rounded-3xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] border border-white/10 flex items-center justify-center group">
        
        {/* Luồng Remote Video hiển thị ở khung chính */}
        {callType === 'video' && callState === 'connected' && (
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover transition-all duration-500" />
        )}

        {/* Luồng Local Stream thu nhỏ ở góc khi hiển thị cuộc gọi Video */}
        {callType === 'video' && localStream && (
          <div className={`absolute rounded-2xl overflow-hidden border border-white/20 shadow-2xl transition-all duration-500 ease-out backdrop-blur-md ${
            callState === 'connected' 
              ? 'bottom-6 right-6 w-36 h-48 md:w-44 md:h-60 z-10 hover:scale-105 hover:border-blue-500/50' 
              : 'w-full h-full object-cover'
          }`}>
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            {isVideoOff && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-center p-2 gap-2 animate-in fade-in">
                <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <span className="text-[11px] font-medium text-slate-400">Camera đã tắt</span>
              </div>
            )}
          </div>
        )}

        {/* Hiển thị Avatar / Trạng thái cuộc gọi dạng Voice hoặc đang kết nối chờ */}
        {(callType === 'voice' || callState === 'calling' || callState === 'incoming') && (
          <div className="flex flex-col items-center gap-6 text-center z-10 p-6">
            <div className="relative flex items-center justify-center">
              {/* Vòng xung tín hiệu (Ripple Rings) cho trạng thái chờ */}
              {(callState === 'calling' || callState === 'incoming') && (
                <>
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping duration-1000 scale-150" />
                  <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-pulse scale-125" />
                </>
              )}
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-4xl font-semibold shadow-[0_0_40px_rgba(59,130,246,0.3)] border border-white/20">
                {roomName ? roomName[0].toUpperCase() : '?'}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold tracking-tight text-white">{roomName || 'Đang kết nối...'}</h3>
              <div className="inline-block">
                {callState === 'calling' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Đang đổ chuông gọi đi...
                  </span>
                )}
                {callState === 'incoming' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-bounce">
                    Cuộc gọi hỗ trợ đến...
                  </span>
                )}
                {callState === 'connected' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Đang đàm thoại ổn định
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BAN ĐIỀU KHIỂN CHỨC NĂNG (ACTION CONTROLS) */}
      <div className="p-4 flex items-center gap-5 bg-slate-900/80 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl mb-4 animate-in slide-in-from-bottom-6 duration-500 z-20">
        {callState === 'incoming' ? (
          <>
            {/* Chấp nhận cuộc gọi */}
            <button 
              onClick={acceptCall} 
              className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-400 hover:scale-105 active:scale-95 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all duration-200" 
              title="Nhận cuộc gọi"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.72l.54 2.21a1 1 0 01-.24.97l-1.45 1.45a15.54 15.54 0 006.26 6.26l1.45-1.45a1 1 0 01.97-.24l2.21.54a1 1 0 01.72.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            {/* Từ chối cuộc gọi */}
            <button 
              onClick={rejectCall} 
              className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center hover:bg-rose-400 hover:scale-105 active:scale-95 hover:shadow-[0_0_25px_rgba(244,63,94,0.4)] transition-all duration-200" 
              title="Từ chối"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <>
            {/* Toggle Mute Micro */}
            <button 
              onClick={toggleMute} 
              className={`w-13 h-13 p-3.5 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                isMuted 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[inset_0_0_10px_rgba(244,63,94,0.2)]' 
                  : 'bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white border border-white/5'
              }`} 
              title={isMuted ? 'Bật Micro' : 'Tắt Micro'}
            >
              {isMuted ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
            
            {/* Toggle Camera Video */}
            {callType === 'video' && (
              <button 
                onClick={toggleVideo} 
                className={`w-13 h-13 p-3.5 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  isVideoOff 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[inset_0_0_10px_rgba(244,63,94,0.2)]' 
                    : 'bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white border border-white/5'
                }`} 
                title={isVideoOff ? 'Mở Camera' : 'Tắt Camera'}
              >
                {isVideoOff ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            )}

            {/* Kết thúc cuộc gọi */}
            <button 
              onClick={endCall} 
              className="w-14 h-14 bg-rose-600 text-white rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:scale-105 active:scale-95 hover:shadow-[0_0_25px_rgba(225,29,72,0.4)] transition-all duration-200" 
              title="Kết thúc"
            >
              <svg className="w-6 h-6 transform rotate-135" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2 2m0 0l2-2m-2 2l2 2m-2-2l-2 2M5 3a2 2 0 00-2 2v3a2 2 0 002 2h3a2 2 0 002-2V5a2 2 0 00-2-2H5zm12 11h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2v-3a2 2 0 012-2z" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CallWindow;