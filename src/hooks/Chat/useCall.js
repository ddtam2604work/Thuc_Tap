cat << 'EOF' > /var/www/qlkd/src/hooks/Chat/useCall.js
import { useState, useEffect, useRef, useCallback } from 'react';

// =========================================================================
// 🎯 HẠ TẦNG CHUẨN: Chỉ sử dụng cổng 3478 (UDP/TCP) phân vùng Singapore thật
// =========================================================================
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:sg.turn.metered.ca:3478?transport=udp',
      username: '25af1a05bc8b364f03a4d339',
      credential: '4ViOVjtSABg67DiZ'
    },
    {
      urls: 'turn:sg.turn.metered.ca:3478?transport=tcp',
      username: '25af1a05bc8b364f03a4d339',
      credential: '4ViOVjtSABg67DiZ'
    }
  ]
};

export const useCall = (socket, activeRoomId, role) => {
  const [callState, setCallState] = useState('idle'); 
  const [callType, setCallType] = useState(null); 
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [roomCallId, setRoomCallId] = useState(null); 

  const peerConnectionRef = useRef(null);
  const currentCallSessionRef = useRef(null);
  const iceCandidatesQueueRef = useRef([]); 
  
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

      stopRingtone(); 

      if (type === 'incoming') {
        const playRing = () => {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc1.type = 'sine'; osc1.frequency.setValueAtTime(400, ctx.currentTime);
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
    iceCandidatesQueueRef.current = []; 
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
      
      startRingtone('calling'); 

      const constraints = { audio: true, video: type === 'video' };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      latestStateRef.current.localStream = stream;
      setLocalStream(stream);

      socket.emit('call:invite', { chatconversation_id: activeRoomId, type, role });
    } catch (err) {
      alert('Vui lòng mở quyền truy cập Camera/Microphone.');
      resetCallContext();
    }
  }, [socket, activeRoomId, role, resetCallContext]);

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
      startRingtone('incoming'); 
    };

    const handleCallAccepted = async (data) => {
      stopRingtone(); 
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
      stopRingtone(); 
      try {
        const pc = createPeerConnection(data.chatconversation_id);
        let stream = latestStateRef.current.localStream;
        
        if (!stream) {
          const constraints = { audio: true, video: latestStateRef.current.callType === 'video' };
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          latestStateRef.current.localStream = stream;
          setLocalStream(stream);
        }
        
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

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
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
          setCallState('connected');

          if (iceCandidatesQueueRef.current.length > 0) {
            for (const candidate of iceCandidatesQueueRef.current) {
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => {});
            }
            iceCandidatesQueueRef.current = [];
          }
        } catch (err) { console.error(err); }
      }
    };

    const handleNewIceCandidate = async (data) => {
      if (data.candidate) {
        const pc = peerConnectionRef.current;
        if (pc && pc.remoteDescription) {
          try { await pc.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch (e) {}
        } else {
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

  const acceptCall = useCallback(async () => {
    if (!socket || !currentCallSessionRef.current) return;
    stopRingtone();
    
    try {
      const constraints = { audio: true, video: latestStateRef.current.callType === 'video' };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      latestStateRef.current.localStream = stream;
      setLocalStream(stream);
      
      socket.emit('call:accept', { chatconversation_id: currentCallSessionRef.current.chatconversation_id });
    } catch (err) {
      alert('Vui lòng mở quyền truy cập Camera/Microphone trên trình duyệt di động để nhận cuộc gọi.');
      resetCallContext();
    }
  }, [socket, resetCallContext]);

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
EOF