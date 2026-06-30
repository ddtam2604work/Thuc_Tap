// =========================================================================
// FILE: src/hooks/Chat/useChat.js (BẢN PURE SOCKET TRÊN CỔNG 4000)
// =========================================================================
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';
import { chatService } from '../../services/chatService';
import { mediaService } from '../../services/mediaService'; 

const COMPANY_ID = '0e3b15dc-c1d8-4d1c-90a0-dde7333ac791';
const MAX_VIDEO_SIZE_MB = 10; // Giới hạn kích thước video là 10MB (ví dụ)

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
    const { socket, callSocket, setGlobalUnreadCount } = useSocket();
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
    const [myStickers, setMyStickers] = useState([]);
    const [storeStickers, setStoreStickers] = useState([]);
    
    const [forwardModalOpen, setForwardModalOpen] = useState(false);
    const [selectedMsgToForward, setSelectedMsgToForward] = useState(null);

    const role = useMemo(() => getUserRoleFromToken(), []);

    // Nạp gói nhãn dán tự động từ nguồn mở uy tín DiceBear API công khai
    useEffect(() => {
        const styles = ['lorelei', 'adventurer', 'open-peeps', 'bottts-neutral', 'fun-emoji'];
        const minePacks = Array.from({ length: 12 }, (_, i) => {
            const currentStyle = styles[i % styles.length];
            return `https://api.dicebear.com/7.x/${currentStyle}/svg?seed=UserPack_${i + 10}`;
        });
        const storePacks = Array.from({ length: 16 }, (_, i) => {
            const currentStyle = styles[(i + 2) % styles.length];
            return `https://api.dicebear.com/7.x/${currentStyle}/svg?seed=StorePack_${i + 60}`;
        });
        setMyStickers(minePacks);
        setStoreStickers(storePacks);
    }, []);

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
                    
                    mappedRooms.sort((a, b) => b.unread - a.unread);
                    
                    setChatRooms(mappedRooms);
                    if (mappedRooms.length > 0 && !activeRoomId) {
                      setActiveRoomId(mappedRooms[0].id);
                      if(mappedRooms[0].unread > 0){
                          setTimeout(() => {
                              window.dispatchEvent(new CustomEvent('chat:mark_room_read', { detail: { unreadCleared: mappedRooms[0].unread } }));
                          }, 500);
                      }
                    }
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
            
            const isMasked = typeof data.content === 'string' && data.content.startsWith('__CALL_HISTORY__:');
            let previewText = data.content;

            if (isMasked) {
                try {
                    const callData = JSON.parse(data.content.replace('__CALL_HISTORY__:', ''));
                    const isVideo = callData.type === 'video';
                    const icon = isVideo ? '📹' : '📞';
                    const isMyCall = callData.initiator === role; 
                    
                    if (callData.status === 'rejected') {
                        previewText = isMyCall ? `${icon} Cuộc gọi thoại bị từ chối` : `${icon} Từ chối cuộc gọi`;
                    } else if (callData.status === 'missed' || callData.status === 'busy') {
                        previewText = isMyCall ? `${icon} Cuộc gọi đi bị nhỡ` : `${icon} Cuộc gọi đến bị nhỡ`;
                    } else {
                        previewText = `${icon} Cuộc gọi (${callData.duration}s)`;
                    }
                } catch (e) {
                    previewText = '[Lịch sử cuộc gọi]';
                }
            } else if (data.msg_type === 'image') {
                previewText = '[Hình ảnh]';
            } else if (data.msg_type === 'video') {
                previewText = '[Video]';
            } else if (data.msg_type === 'sticker') {
                previewText = '[Nhãn dán]';
            } else if (data.msg_type === 'audio') {
                previewText = '[Ghi âm]';
            }

            const incomingSenderType = Number(data.sendertype || data.sender_type);
            let isFromOther = false;
            
            if (role === 'staff' && incomingSenderType === 1) {
                isFromOther = true;
            } 
            else if (role === 'customer' && incomingSenderType === 2) {
                isFromOther = true;
            }

            const isNewUnread = cid !== activeRoomId;
            if (isNewUnread && isFromOther && typeof setGlobalUnreadCount === 'function') {
                setGlobalUnreadCount(prev => prev + 1);
            }

            setChatRooms((prevRooms) => {
                let isRoomExists = false;
                
                const updatedRooms = prevRooms.map((room) => {
                    if (room.id === cid) {
                        isRoomExists = true;
                        
                        return {
                            ...room,
                            lastMessage: previewText,
                            time: formatTime(data.createdate || new Date()),
                            unread: (isNewUnread && isFromOther) ? (Number(room.unread) || 0) + 1 : Number(room.unread || 0),
                        };
                    }
                    return room;
                });
                
                updatedRooms.sort((a, b) => {
                    if (a.id === cid) return -1;
                    if (b.id === cid) return 1;
                    return b.unread - a.unread;
                });
                
                return updatedRooms;
            });
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
    }, [socket, callSocket, activeRoomId, role, setGlobalUnreadCount]);

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

        // 🌟 ÁP DỤNG LOGIC GỬI VOICE CHO VIDEO THEO YÊU CẦU
        if (isVideo) {
            const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024; // Convert MB to bytes
            if (file.size > MAX_VIDEO_SIZE_BYTES) {
                alert(`Tệp video quá lớn! Kích thước tối đa cho phép là ${MAX_VIDEO_SIZE_MB}MB. Vui lòng chọn tệp nhỏ hơn.`);
                return;
            }

            const videoBlob = new Blob([file], { type: file.type });
            const reader = new FileReader();
            reader.readAsDataURL(videoBlob); 
            reader.onloadend = () => {
                const base64Data = reader.result;
                socket.emit('chat:send', {
                    chatconversation_id: activeRoomId, 
                    company_id: COMPANY_ID,
                    content: base64Data, 
                    msg_type: 'video'
                });
            };
            return; 
        }

        // Đối với ảnh: Giữ luồng gọi HTTP Multipart ổn định đang hoạt động
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

            if (!fileId) throw new Error('Cấu trúc JSON phản hồi từ Server không khớp.');

            socket.emit('chat:send', {
                chatconversation_id: activeRoomId, 
                company_id: COMPANY_ID,
                content: fileId, 
                msg_type: 'image'
            });

        } catch (err) {
            console.error('Lỗi tải ảnh:', err);
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

    // 🌟 KHẮC PHỤC HOÀN TOÀN LỖI 404 AUDIO: Đọc Base64 và truyền tải Pure Realtime qua cổng 4000 tương tự Video
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
                reader.onloadend = () => {
                    const base64Data = reader.result;
                    socket.emit('chat:send', {
                        chatconversation_id: activeRoomId, 
                        company_id: COMPANY_ID,
                        content: base64Data, 
                        msg_type: 'audio'
                    });
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
        if (!SpeechRecognition) {
            alert('Trình duyệt của bạn không hỗ trợ API nhận dạng giọng nói. Vui lòng thử trên Google Chrome hoặc Edge.');
            return;
        }

        if (isListening) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsListening(false);
            return;
        }
        
        let retryCount = 0;
        const maxRetries = 3;

        const startRecognition = () => {
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;

            recognition.lang = 'vi-VN';
            recognition.continuous = true; 
            recognition.interimResults = true; 

            let finalTranscript = '';
            let initialText = inputMessageRef.current; 

            recognition.onstart = () => {
                setIsListening(true);
                initialText = inputMessageRef.current; 
                retryCount = 0; // Reset retry count on successful start
            };

            recognition.onend = () => {
                setIsListening(false);
                recognitionRef.current = null;
            };

            recognition.onerror = (event) => {
                console.error('Lỗi nhận dạng giọng nói:', event.error);

                if (event.error === 'network' && retryCount < maxRetries) {
                    retryCount++;
                    console.log(`Lỗi mạng, đang thử lại lần ${retryCount}/${maxRetries}...`);
                    setTimeout(() => {
                        if (recognitionRef.current && !isListening) {
                           startRecognition();
                        }
                    }, 1000); // Wait 1 second before retrying
                    return;
                }
                
                let alertMsg = 'Đã xảy ra lỗi trong quá trình nhận dạng giọng nói.';
                if (event.error === 'no-speech') {
                    alertMsg = 'Không phát hiện thấy giọng nói. Vui lòng thử lại.';
                } else if (event.error === 'not-allowed') {
                    alertMsg = 'Quyền truy cập micro bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt.';
                } else if (event.error === 'network') {
                    alertMsg = 'Lỗi kết nối mạng. Không thể kết nối đến dịch vụ nhận dạng giọng nói sau nhiều lần thử.';
                }
                alert(alertMsg);
                setIsListening(false);
            };
            
            recognition.onresult = (event) => {
                let interimTranscript = '';
                finalTranscript = ''; 
                
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                const textBefore = initialText ? `${initialText} ` : '';
                
                if (finalTranscript) {
                    initialText = textBefore + finalTranscript;
                    handleInputChange(initialText);
                } else {
                    handleInputChange(textBefore + interimTranscript);
                }
            };

            recognition.start();
        }

        startRecognition();

    }, [isListening, handleInputChange]);

    const handleRoomSelect = useCallback((roomId) => {
        if (role === 'customer') return;
        
        setChatRooms(prevRooms => {
            const targetRoom = prevRooms.find(room => room.id === roomId);
            const roomUnreadCount = targetRoom ? Number(targetRoom.unread || 0) : 0;
            
            if (roomUnreadCount > 0) {
                window.dispatchEvent(new CustomEvent('chat:mark_room_read', { 
                    detail: { unreadCleared: roomUnreadCount } 
                }));
            }
            
            return prevRooms.map(room => room.id === roomId ? { ...room, unread: 0 } : room);
        });

        setActiveRoomId(roomId);
        setShowMediaSidebar(false);
        setShowStickerPicker(false);
        
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
        
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