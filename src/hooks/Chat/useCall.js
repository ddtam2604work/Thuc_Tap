import { useState, useEffect, useRef, useCallback } from 'react';

// =========================================================================
// 🔥 ĐIỀU CHỈNH: Bổ sung TURN Server vào rtcConfig để xuyên thủng NAT mạng 4G
// (Mẹo: Bạn có thể đăng ký tài khoản miễn phí tại Metered.ca hoặc Xirsys để lấy cụm này)
// =========================================================================
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};
// =========================================================================

export const useCall = (socket, activeRoomId, role) => {
  const [callState, setCallState] = useState('idle'); // idle | calling | incoming | connected
  const [callType, setCallType] = useState(null); // 'voice' | 'video'
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [roomCallId, setRoomCallId] = useState(null); // 🌟 Lưu ID phòng đang call để hiển thị đúng tên

  const peerConnectionRef = useRef(null);
  const currentCallSessionRef = useRef(null);
  const iceCandidatesQueueRef = useRef([]); // 🌟 BỔ SUNG: Hàng đợi lưu ICE candidates đến sớm khi peer chưa sẵn sàng
  
  // 🌟 KHỞI TẠO BỘ NHẠC CHUÔNG PROCEDURAL (WEB AUDIO API)
  const audioCtxRef = useRef(null);
  const audioOscRef = useRef([]);
  const ringtoneTimerRef = useRef(null);

  const startRingtone = (type) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      stopRingtone(); // Dọn dẹp chuông cũ trước khi phát chuông mới

      if (type === 'incoming') {
        // Âm reng reng báo cuộc gọi đến (Dual-tone 400Hz + 450Hz pulsed)
        const playRing = () => {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc1.type = 'sine'; osc1.frequency.setValueAtTime(400, ctx.currentTime);
          
          // 🌟 ĐÃ SỬA: Thêm const để chặn đứng hoàn toàn lỗi ReferenceError bẻ gãy luồng Signalling
          const box2 = ctx.createOscillator(); 
          
          osc2.type = 'sine'; osc2.frequency.setValueAtTime(450, ctx.currentTime);
          
          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.2, ctx.currentTime + 1.2);
          gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.3);

          osc1.connect(gainNode); osc2.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc1.start(); osc2.start();
          osc1.stop(ctx.currentTime + 1.5); osc2.stop(ctx.currentTime + 1.5);
          audioOscRef.current = [osc1, osc2];
        };
        playRing();
        ringtoneTimerRef.current = setInterval(playRing, 3000);
      } else if (type === 'calling') {
        // Âm bíp... bíp... chờ máy khi gọi đi (440Hz + 480Hz)
        const playDial = () => {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc1.frequency.setValueAtTime(440, ctx.currentTime);
          osc2.frequency.setValueAtTime(480, ctx.currentTime);

          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.1, ctx.currentTime + 1.8);
          gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.0);

          osc1.connect(gainNode); osc2.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc1.start(); osc2.start();
          osc1.stop(ctx.currentTime + 2.2); osc2.stop(ctx.currentTime + 2.2);
          audioOscRef.current = [osc1, osc2];
        };
        playDial();
        ringtoneTimerRef.current = setInterval(playDial, 4000);
      }
    } catch (e) { console.error(e); }
  };

  const stopRingtone = () => {
    if (ringtoneTimerRef.current) { clearInterval(ringtoneTimerRef.current); ringtoneTimerRef.current = null; }
    if (audioOscRef.current.length > 0) {
      audioOscRef.current.forEach(osc => { try { osc.stop(); } catch(e){} });
      audioOscRef.current = [];
    }
  };

  // 🌟 SỬ DỤNG REF STATE ĐỂ KHÔNG BỊ COLLISION KHI SOCKET RE-REGISTER
  const latestStateRef = useRef({ callState, localStream, callType });
  useEffect(() => {
    latestStateRef.current = { callState, localStream, callType };
  }, [callState, localStream, callType]);

  const resetCallContext = useCallback(() => {
    stopRingtone();
    if (peerConnectionRef.current) { peerConnectionRef.current.close(); peerConnectionRef.current = null; }
    if (localStream) { localStream.getTracks().forEach(track => track.stop()); setLocalStream(null); }
    setRemoteStream(null);
    setCallState('idle');
    setCallType(null);
    setRoomCallId(null);
    setIsMuted(false);
    setIsVideoOff(false);
    currentCallSessionRef.current = null;
    iceCandidatesQueueRef.current = []; // 🌟 BỔ SUNG: Dọn sạch hàng đợi khi reset
  }, [localStream]);

  const createPeerConnection = useCallback((targetRoomId) => {
    const pc = new RTCPeerConnection(rtcConfig);
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('call:ice-candidate', { chatconversation_id: targetRoomId, candidate: event.candidate });
      }
    };
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) setRemoteStream(event.streams[0]);
    };
    peerConnectionRef.current = pc;
    return pc;
  }, [socket]);

  const startCall = useCallback(async (type) => {
    if (!socket || !activeRoomId) return;
    try {
      setCallState('calling');
      setCallType(type);
      setRoomCallId(activeRoomId);
      currentCallSessionRef.current = { chatconversation_id: activeRoomId, type };
      
      startRingtone('calling'); // 🔔 Phát nhạc chuông chờ gọi đi

      const constraints = { audio: true, video: type === 'video' };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      socket.emit('call:invite', { chatconversation_id: activeRoomId, type, role });
    } catch (err) {
      alert('Vui lòng mở quyền truy cập Camera/Microphone.');
      resetCallContext();
    }
  }, [socket, activeRoomId, role, resetCallContext]);

  // 🌟 LẮNG NGHE SỰ KIỆN SOCKET CỐ ĐỊNH - ĐẢM BẢO KHÔNG BỊ HỦY LUỒNG ĐẦU NHẬN
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data) => {
      if (currentCallSessionRef.current) {
        socket.emit('call:busy', { chatconversation_id: data.chatconversation_id });
        return;
      }
      currentCallSessionRef.current = data;
      setCallType(data.type);
      setRoomCallId(data.chatconversation_id);
      setCallState('incoming');
      startRingtone('incoming'); // 🔔 Phát nhạc chuông báo gọi đến
    };

    const handleCallAccepted = async (data) => {
      stopRingtone(); // 🔔 Tắt chuông khi đầu kia bắt máy
      const state = latestStateRef.current;
      const pc = peerConnectionRef.current || createPeerConnection(data.chatconversation_id);
      
      if (pc.getSenders().length === 0 && state.localStream) {
        state.localStream.getTracks().forEach(track => pc.addTrack(track, state.localStream));
      }
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        setCallState('connected');
        socket.emit('call:offer', { chatconversation_id: data.chatconversation_id, sdp: offer });
      } catch (err) { console.error(err); }
    };

    const handleCallOffer = async (data) => {
      stopRingtone(); // 🔔 Tắt chuông khi kết nối đàm thoại thiết lập
      try {
        const pc = createPeerConnection(data.chatconversation_id);
        const constraints = { audio: true, video: latestStateRef.current.callType === 'video' };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setLocalStream(stream);
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

        // 🌟 BỔ SUNG: Đẩy toàn bộ các ICE candidate đã tích lũy trong hàng đợi vào Peer Connection
        if (iceCandidatesQueueRef.current.length > 0) {
          for (const candidate of iceCandidatesQueueRef.current) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => {});
          }
          iceCandidatesQueueRef.current = [];
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        setCallState('connected');
        socket.emit('call:answer', { chatconversation_id: data.chatconversation_id, sdp: answer });
      } catch (err) { resetCallContext(); }
    };

    const handleCallAnswer = async (data) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
        setCallState('connected');
      }
    };

    const handleNewIceCandidate = async (data) => {
      if (data.candidate) {
        const pc = peerConnectionRef.current;
        // 🌟 SỬA BUG: Chỉ thêm khi PC sẵn sàng và remoteDescription đã được cấu hình từ Offer/Answer
        if (pc && pc.remoteDescription) {
          try { await pc.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch (e) {}
        } else {
          // Ngược lại đưa vào hàng đợi chờ xử lý sau
          iceCandidatesQueueRef.current.push(data.candidate);
        }
      }
    };

    socket.on('call:incoming', handleIncomingCall);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('call:offer', handleCallOffer);
    socket.on('call:answer', handleCallAnswer);
    socket.on('call:ice-candidate', handleNewIceCandidate);
    socket.on('call:terminated', resetCallContext);
    socket.on('call:busy', () => { alert('Đối phương hiện đang bận.'); resetCallContext(); });

    return () => {
      socket.off('call:incoming', handleIncomingCall);
      socket.off('call:accepted', handleCallAccepted);
      socket.off('call:offer', handleCallOffer);
      socket.off('call:answer', handleCallAnswer);
      socket.off('call:ice-candidate', handleNewIceCandidate);
      socket.off('call:terminated', resetCallContext);
      socket.off('call:busy');
    };
  }, [socket, createPeerConnection, resetCallContext]);

  const acceptCall = useCallback(() => {
    if (!socket || !currentCallSessionRef.current) return;
    stopRingtone();
    socket.emit('call:accept', { chatconversation_id: currentCallSessionRef.current.chatconversation_id });
  }, [socket]);

  const rejectCall = useCallback(() => {
    if (!socket || !currentCallSessionRef.current) return;
    socket.emit('call:reject', { chatconversation_id: currentCallSessionRef.current.chatconversation_id });
    resetCallContext();
  }, [socket, resetCallContext]);

  const endCall = useCallback(() => {
    if (!socket || !currentCallSessionRef.current) return;
    socket.emit('call:terminate', { chatconversation_id: currentCallSessionRef.current.chatconversation_id });
    resetCallContext();
  }, [socket, resetCallContext]);

  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
      setIsMuted(prev => !prev);
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream && callType === 'video') {
      localStream.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
      setIsVideoOff(prev => !prev);
    }
  }, [localStream, callType]);

  return {
    callState, callType, localStream, remoteStream, isMuted, isVideoOff, roomCallId,
    startCall, acceptCall, rejectCall, endCall, toggleMute, toggleVideo
  };
};