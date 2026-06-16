import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';
import { chatService } from '../../services/chatService';
import { mediaService } from '../../services/mediaService'; 

const COMPANY_ID = '0e3b15dc-c1d8-4d1c-90a0-dde7333ac791';

const INITIAL_MY_STICKERS = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Jack',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Boots',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Lulu'
];
const INITIAL_STORE_STICKERS = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=Socks',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Tiger',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Buster',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Missy'
];

const getUserRoleFromToken = () => {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) return 'staff';
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        return payload.customer_id ? 'customer' : 'staff';
    } catch (e) {
        return 'staff';
    }
};

export const useChat = () => {
    const { socket, callSocket } = useSocket();
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recognitionRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const inputMessageRef = useRef('');

    const [chatRooms, setChatRooms] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeRoomId, setActiveRoomId] = useState(null);
    const [typingStatus, setTypingStatus] = useState('');
    const [inputMessage, setInputMessage] = useState('');
    const [pagination, setPagination] = useState({ page: 1, hasMore: false, isLoading: false });

    const [showMediaSidebar, setShowMediaSidebar] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isListening, setIsListening] = useState(false);
    
    const [showStickerPicker, setShowStickerPicker] = useState(false);
    const [myStickers, setMyStickers] = useState(INITIAL_MY_STICKERS);
    const [storeStickers, setStoreStickers] = useState(INITIAL_STORE_STICKERS);
    
    const [forwardModalOpen, setForwardModalOpen] = useState(false);
    const [selectedMsgToForward, setSelectedMsgToForward] = useState(null);

    const role = useMemo(() => getUserRoleFromToken(), []);

    useEffect(() => {
        inputMessageRef.current = inputMessage;
    }, [inputMessage]);

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const mediaStorage = useMemo(() => {
        const images = [];
        const links = [];

        messages.forEach(msg => {
            const content = (msg.content || msg.text || '').trim();
            if (!content) return;

            const isUUID = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/i.test(content);
            const isImageFileName = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(content) && !content.includes(' ');
            const isBase64OrBlob = /^blob:/i.test(content) || /^data:image\//i.test(content);
            
            const isStickerFallback = /api\.dicebear\.com/i.test(content);
            const isActualSticker = msg.msg_type === 'sticker' || isStickerFallback;

            const isPureUploadedImage = !isActualSticker && (msg.msg_type === 'image' || isBase64OrBlob || (isUUID && msg.msg_type !== 'video' && msg.msg_type !== 'audio') || (isImageFileName && !content.startsWith('http')));

            if (isPureUploadedImage) {
                let finalImageUrl = content;
                if (!content.startsWith('http://') && !content.startsWith('https://') && !content.startsWith('blob:') && !content.startsWith('data:')) {
                    finalImageUrl = mediaService.getViewUrl(content); 
                }
                images.push({ ...msg, url: finalImageUrl });
            } 
            
            const foundLinks = content.match(/(https?:\/\/[^\s]+)/gi);
            if (foundLinks && !isActualSticker && msg.msg_type !== 'audio' && msg.msg_type !== 'image') {
                foundLinks.forEach(link => {
                    links.push({ ...msg, url: link });
                });
            }
        });

        return { images, links };
    }, [messages]);

    useEffect(() => {
        if (!socket) return;

        const initializeChat = async () => {
            if (role === 'customer') {
                try {
                    const result = await chatService.getOrCreateConversation(COMPANY_ID);
                    const convId = result?.data?.id;
                    if (convId) {
                        setChatRooms([{
                            id: convId, name: 'Labs Support', avatar: 'L',
                            lastMessage: 'Nhân viên hỗ trợ', time: '', unread: 0, isOnline: true
                        }]);
                        setActiveRoomId(convId);
                    }
                } catch (err) { console.error('Error initiating conversation', err); }
            } else {
                try {
                    socket.emit('chat:join_company', { company_id: COMPANY_ID });
                    const response = await chatService.getConversations(COMPANY_ID);
                    const rows = response?.data?.rows || [];
                    const mappedRooms = rows.map(item => ({
                        id: item.id,
                        name: item.customer_name || `KH ${item.customer_id?.slice(0, 8)}`,
                        avatar: (item.customer_name || '?')[0].toUpperCase(),
                        lastMessage: item.lastmessage || 'Chưa có tin nhắn',
                        time: item.updatedate ? formatTime(item.updatedate) : '',
                        unread: Number(item.unreadcount_staff || 0),
                        isOnline: true,
                    }));
                    setChatRooms(mappedRooms);
                    if (mappedRooms.length > 0 && !activeRoomId) setActiveRoomId(mappedRooms[0].id);
                } catch (err) { console.error('Error loading conversations', err); }
            }
        };

        initializeChat();
    }, [socket, role]);

    useEffect(() => {
        if (!activeRoomId) return;
        const fetchMessages = async () => {
            try {
                setPagination(prev => ({ ...prev, page: 1, isLoading: true }));
                const response = await chatService.getConversationMessages(activeRoomId, 1, 20);
                const rawMsgs = response?.data?.rows || [];
                setMessages(rawMsgs.slice().reverse());
                const total = response?.data?.total || 0;
                setPagination(prev => ({ ...prev, hasMore: total > 20, isLoading: false }));
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
            } catch (err) {
                setPagination(prev => ({ ...prev, isLoading: false }));
            }
        };

        if (socket) {
            socket.emit('chat:join', { chatconversation_id: activeRoomId, company_id: COMPANY_ID });
            socket.emit('chat:read', { chatconversation_id: activeRoomId });
        }
        fetchMessages();
        setTypingStatus('');
    }, [activeRoomId, socket]);

    useEffect(() => {
        if (!socket) return;

        const handleChatMessage = (data) => {
            const cid = data.chatconversation_id;
            if (!cid) return;
            if (cid === activeRoomId) {
                setMessages((prev) => [...prev, data]);
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 30);
                socket.emit('chat:read', { chatconversation_id: activeRoomId });
            }
            
            // 🌟 THAY ĐỔI: Xử lý logic bóc tách chi tiết trạng thái cuộc gọi theo vai trò
            const isMasked = typeof data.content === 'string' && data.content.startsWith('__CALL_HISTORY__:');
            let previewText = data.content;

            if (isMasked) {
                try {
                    const callData = JSON.parse(data.content.replace('__CALL_HISTORY__:', ''));
                    const isVideo = callData.type === 'video';
                    const icon = isVideo ? '📹' : '📞';
                    
                    // Kiểm tra xem user hiện tại có phải là người gọi hay không
                    const isMyCall = callData.initiator === role; 
                    
                    if (callData.status === 'rejected') {
                        // Nếu mình là người gọi đi (Khách hàng) -> Hiển thị "bị từ chối"
                        // Nếu mình là người nhận (Admin) -> Hiển thị "Từ chối cuộc gọi"
                        previewText = isMyCall 
                            ? `${icon} Cuộc gọi thoại bị từ chối` 
                            : `${icon} Từ chối cuộc gọi`;
                    } else if (callData.status === 'missed' || callData.status === 'busy') {
                        previewText = isMyCall 
                            ? `${icon} Cuộc gọi đi bị nhỡ` 
                            : `${icon} Cuộc gọi đến bị nhỡ`;
                    } else {
                        previewText = `${icon} Cuộc gọi (${callData.duration}s)`;
                    }
                } catch (e) {
                    previewText = '[Lịch sử cuộc gọi]';
                }
            } else if (data.msg_type === 'image') {
                previewText = '[Hình ảnh]';
            } else if (data.msg_type === 'sticker') {
                previewText = '[Nhãn dán]';
            } else if (data.msg_type === 'audio') {
                previewText = '[Ghi âm]';
            }

            setChatRooms((prevRooms) =>
                prevRooms.map((room) =>
                    room.id === cid
                        ? {
                              ...room,
                              lastMessage: previewText,
                              time: formatTime(data.createdate || new Date()),
                              unread: cid === activeRoomId ? 0 : room.unread + 1,
                          }
                        : room
                )
            );
        };

        const handleTyping = (data) => {
            if (data.chatconversation_id === activeRoomId) {
                const typerName = role === 'customer' ? 'Nhân viên Support' : (data.sender_name || 'Khách hàng');
                setTypingStatus(data.isTyping ? `${typerName} đang nhập...` : '');
            }
        };

        socket.on('chat:message', handleChatMessage);
        socket.on('chat:typing', handleTyping);
        
        if (callSocket) {
            callSocket.on('chat:message', handleChatMessage);
            
            callSocket.on('call:save_log', (logData) => {
                // Giải pháp tối ưu: Chỉ cho tài khoản 'staff' gửi tín hiệu 'chat:send' để lưu DB lõi qua tin nhắn văn bản,
                // tránh hiện tượng nhân bản bản ghi (Duplicate) từ cả 2 đầu client cùng lúc.
                if (role === 'staff' && socket && logData.chatconversation_id) {
                    socket.emit('chat:send', {
                        chatconversation_id: logData.chatconversation_id,
                        company_id: COMPANY_ID,
                        msg_type: 'text', 
                        content: `__CALL_HISTORY__:${JSON.stringify({
                            type: logData.type,
                            duration: logData.duration,
                            status: logData.status,
                            initiator: logData.initiator
                        })}`
                    });
                }
            });
        }

        return () => {
            socket.off('chat:message', handleChatMessage);
            socket.off('chat:typing', handleTyping);
            if (callSocket) {
                callSocket.off('chat:message', handleChatMessage);
                callSocket.off('call:save_log');
            }
        };
    }, [socket, callSocket, activeRoomId, role]);

    const handleScroll = useCallback(async (e) => {
        const container = e.currentTarget;
        if (container.scrollTop <= 5 && !pagination.isLoading && pagination.hasMore && activeRoomId) {
            try {
                setPagination(prev => ({ ...prev, isLoading: true }));
                const nextPage = pagination.page + 1;
                const prevScrollHeight = container.scrollHeight;
                const response = await chatService.getConversationMessages(activeRoomId, nextPage, 20);
                const rawMsgs = response?.data?.rows || [];
                setMessages(prev => [...rawMsgs.slice().reverse(), ...prev]);
                setPagination({ page: nextPage, hasMore: (response?.data?.total || 0) > nextPage * 20, isLoading: false });
                setTimeout(() => { container.scrollTop = container.scrollHeight - prevScrollHeight; }, 10);
            } catch (error) { setPagination(prev => ({ ...prev, isLoading: false })); }
        }
    }, [activeRoomId, pagination]);

    const handleSendMessage = useCallback((e) => {
        if (e) e.preventDefault();
        if (!inputMessage.trim() || !socket || !activeRoomId) return;

        const urlRegex = /(https?:\/\/[^\s]+)/gi;
        let payload = {
            chatconversation_id: activeRoomId,
            company_id: COMPANY_ID,
            content: inputMessage,
            msg_type: 'text'
        };

        if (urlRegex.test(inputMessage)) {
            const matchedUrl = inputMessage.match(urlRegex)[0];
            payload.link_title = "Cổng thông tin & Trải nghiệm Nền tảng số";
            payload.link_description = `Hệ thống phân phối và định tuyến liên kết chính thức cho URL: ${matchedUrl}. Khám phá ngay!`;
        }

        socket.emit('chat:send', payload);
        setInputMessage('');
        socket.emit('chat:typing', { chatconversation_id: activeRoomId, isTyping: false });
    }, [inputMessage, socket, activeRoomId]);

    const handleInputChange = useCallback((val) => {
        setInputMessage(val);
        if (!socket || !activeRoomId) return;
        if (!typingTimeoutRef.current) socket.emit('chat:typing', { chatconversation_id: activeRoomId, isTyping: true });
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('chat:typing', { chatconversation_id: activeRoomId, isTyping: false });
            typingTimeoutRef.current = null;
        }, 1500);
    }, [socket, activeRoomId]);

    const handleSendImage = useCallback(async (file) => {
        if (!file || !socket || !activeRoomId) return;
        
        const isVideo = file.type && file.type.startsWith('video/');

        // 🌟 XỬ LÝ VIDEO TƯƠNG TỰ AUDIO: Chuyển thành Base64 và Fallback qua Socket nếu API lỗi 404
        if (isVideo) {
            const reader = new FileReader();
            reader.readAsDataURL(file); // Mã hóa video thành Base64
            
            reader.onloadend = async () => {
                const base64Data = reader.result;
                try {
                    // Thử gọi API upload Base64
                    const result = await chatService.uploadVideoBase64(base64Data);
                    const savedPath = result?.data?.filePath || result?.data?.fileUrl || base64Data;
                    
                    socket.emit('chat:send', {
                        chatconversation_id: activeRoomId, company_id: COMPANY_ID,
                        content: savedPath, msg_type: 'video'
                    });
                } catch (err) {
                    // 🎯 FALLBACK: Vì API đang báo 404, code sẽ nhảy vào đây và gửi trực tiếp Video Base64 vào thẳng Socket chat!
                    socket.emit('chat:send', {
                        chatconversation_id: activeRoomId, company_id: COMPANY_ID,
                        content: base64Data, msg_type: 'video'
                    });
                }
            };
            return; // Dừng luồng tại đây để chờ FileReader hoàn tất
        }

        // ==========================================
        // KHỐI LOGIC UPLOAD ẢNH CŨ (GIỮ NGUYÊN 100%)
        // ==========================================
        try {
            const formData = new FormData();
            formData.append('files', file); 
            formData.append('ispublic', '1');

            const response = await mediaService.uploadMultiDraft(formData);
            const uploadedData = response?.data || response;
            let fileId = '';

            if (uploadedData?.success && Array.isArray(uploadedData.success) && uploadedData.success.length > 0) {
                const targetFile = uploadedData.success[0];
                fileId = targetFile?.id || targetFile?.filename || targetFile?.fileId || targetFile?.path || targetFile?.filePath || targetFile?.fileUrl;
            } 
            else if (Array.isArray(uploadedData) && uploadedData.length > 0) {
                fileId = uploadedData[0].id || uploadedData[0].filename || uploadedData[0].fileUrl || uploadedData[0].filePath;
            } 
            else if (typeof uploadedData === 'object' && uploadedData !== null) {
                fileId = uploadedData.id || uploadedData.filename || uploadedData.fileUrl || uploadedData.filePath || uploadedData.data?.[0]?.id;
            } 
            else if (typeof uploadedData === 'string') {
                fileId = uploadedData;
            }

            if (!fileId) throw new Error('Cấu trúc JSON phản hồi từ Server không khớp với cấu trúc phân giải của Client.');

            socket.emit('chat:send', {
                chatconversation_id: activeRoomId, 
                company_id: COMPANY_ID,
                content: fileId, 
                msg_type: 'image'
            });

        } catch (err) {
            let detailError = '';
            if (typeof err === 'object' && err !== null) {
                detailError = err.message || err.error || JSON.stringify(err);
            } else {
                detailError = String(err);
            }
            alert(`Tải file thất bại!\n\nChi tiết lỗi hệ thống:\n${detailError}`); 
        }
    }, [socket, activeRoomId]);

    const handleForwardMessage = useCallback((targetRoomId) => {
        if (!socket || !targetRoomId || !selectedMsgToForward) return;
        socket.emit('chat:send', {
            chatconversation_id: targetRoomId, company_id: COMPANY_ID,
            content: selectedMsgToForward.content || selectedMsgToForward.text,
            msg_type: selectedMsgToForward.selectedMsgToForward?.msg_type || 'text'
        });
        setForwardModalOpen(false);
        setSelectedMsgToForward(null);
    }, [socket, selectedMsgToForward]);

    const handleSendSticker = useCallback((stickerUrl) => {
        if (!socket || !activeRoomId) return;
        socket.emit('chat:send', {
            chatconversation_id: activeRoomId, company_id: COMPANY_ID,
            content: stickerUrl, msg_type: 'sticker'
        });
        setShowStickerPicker(false);
    }, [socket, activeRoomId]);

    const handleUploadSticker = useCallback(async (file) => {
        if (!file || !socket || !activeRoomId) return;
        try {
            const formData = new FormData();
            formData.append('files', file); 
            formData.append('ispublic', '1');

            const response = await mediaService.uploadMultiDraft(formData);
            const uploadedData = response?.data || response;
            let fileId = '';

            if (uploadedData?.success && Array.isArray(uploadedData.success) && uploadedData.success.length > 0) {
                const targetFile = uploadedData.success[0];
                fileId = targetFile?.id || targetFile?.filename || targetFile?.fileId || targetFile?.path || targetFile?.filePath || targetFile?.fileUrl;
            } else if (Array.isArray(uploadedData) && uploadedData.length > 0) {
                fileId = uploadedData[0].id || uploadedData[0].filename || uploadedData[0].fileUrl || uploadedData[0].filePath;
            } else if (typeof uploadedData === 'object' && uploadedData !== null) {
                fileId = uploadedData.id || uploadedData.filename || uploadedData.fileUrl || uploadedData.filePath || uploadedData.data?.[0]?.id;
            } else if (typeof uploadedData === 'string') {
                fileId = uploadedData;
            }

            if (fileId) {
                socket.emit('chat:send', {
                    chatconversation_id: activeRoomId, 
                    company_id: COMPANY_ID,
                    content: fileId, 
                    msg_type: 'sticker'
                });
                setShowStickerPicker(false);
            }
        } catch (err) {
            console.error('❌ [Upload Sticker Error]:', err);
        }
    }, [socket, activeRoomId]);

    const handleDownloadStickerPack = useCallback((stickerUrl) => {
        setMyStickers(prev => [...prev, stickerUrl]);
        setStoreStickers(prev => prev.filter(s => s !== stickerUrl));
    }, []);

    const handleStartRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Data = reader.result;
                    try {
                        const result = await chatService.uploadAudioBase64(base64Data);
                        const savedAudioPath = result?.data?.filePath || result?.data?.fileUrl || base64Data;
                        socket.emit('chat:send', {
                            chatconversation_id: activeRoomId, company_id: COMPANY_ID,
                            content: savedAudioPath, msg_type: 'audio'
                        });
                    } catch (err) {
                        socket.emit('chat:send', {
                            chatconversation_id: activeRoomId, company_id: COMPANY_ID,
                            content: base64Data, msg_type: 'audio'
                        });
                    }
                };
                stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) { alert('Vui lòng cấp quyền Microphone để ghi âm thoại.'); }
    }, [socket, activeRoomId]);

    const handleStopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, []);

    const handleToggleSpeechToText = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return alert('Trình duyệt hiện tại không hỗ trợ bộ nhận diện Web Speech.');
        if (isListening) {
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsListening(false);
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const updatedText = inputMessageRef.current ? `${inputMessageRef.current} ${transcript}` : transcript;
            handleInputChange(updatedText);
        };
        recognitionRef.current = recognition;
        recognition.start();
    }, [isListening, handleInputChange]);

    const handleRoomSelect = useCallback((roomId) => {
        if (role === 'customer') return;
        setActiveRoomId(roomId);
        setChatRooms(prevRooms => prevRooms.map(room => room.id === roomId ? { ...room, unread: 0 } : room));

        // 🌟 NÂNG CẤP UX: Tự động thu gọn tất cả các chức năng mở rộng khi đổi khách hàng (Reset Context)
        setShowMediaSidebar(false);
        setShowStickerPicker(false);
        
        // Dọn dẹp micro nếu đang bật ghi âm
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
        
        // Dọn dẹp bộ nhận diện giọng nói nếu đang dịch
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [role]);

    const activeRoom = useMemo(() => chatRooms.find(r => r.id === activeRoomId), [chatRooms, activeRoomId]);

    return {
        role, chatRooms, messages, activeRoomId, activeRoom, inputMessage, typingStatus,
        showMediaSidebar, isRecording, isListening, mediaStorage,
        showStickerPicker, myStickers, storeStickers, forwardModalOpen, selectedMsgToForward,
        setShowStickerPicker, setForwardModalOpen, setSelectedMsgToForward,
        setShowMediaSidebar, setInputMessage: handleInputChange, messagesEndRef, messagesContainerRef,
        handleSendMessage, handleRoomSelect, handleScroll,
        handleSendImage, handleStartRecording, handleStopRecording, handleToggleSpeechToText,
        handleForwardMessage, handleSendSticker, handleUploadSticker, handleDownloadStickerPack 
    };
};