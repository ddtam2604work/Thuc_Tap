import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';
import { chatService } from '../../services/chatService';

const COMPANY_ID = '0e3b15dc-c1d8-4d1c-90a0-dde7333ac791';

// Hàm helper phân tích vai trò từ JWT Token
const getUserRoleFromToken = () => {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) return 'staff';
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        // Giống file test HTML: Nếu có customer_id thì là Khách hàng, ngược lại là Nhân viên
        return payload.customer_id ? 'customer' : 'staff';
    } catch (e) {
        return 'staff';
    }
};

export const useChat = () => {
    const { socket, setGlobalUnreadCount } = useSocket();
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const [chatRooms, setChatRooms] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeRoomId, setActiveRoomId] = useState(null);
    const [typingStatus, setTypingStatus] = useState('');
    const [inputMessage, setInputMessage] = useState('');
    const [pagination, setPagination] = useState({ page: 1, hasMore: false, isLoading: false });

    // Xác định vai trò hiện tại của người dùng
    const role = useMemo(() => getUserRoleFromToken(), []);

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // 1. Logic Khởi tạo dựa trên Vai trò (Role-based Initialization)
    useEffect(() => {
        if (!socket) return;

        const initializeChat = async () => {
            if (role === 'customer') {
                // LOGIC KHÁCH HÀNG: Chỉ lấy/tạo duy nhất 1 phòng chat của chính mình với Admin
                try {
                    const result = await chatService.getOrCreateConversation(COMPANY_ID);
                    const convId = result?.data?.id;
                    if (convId) {
                        setChatRooms([{
                            id: convId,
                            name: 'Labs Support',
                            avatar: 'L',
                            lastMessage: 'Nhân viên hỗ trợ',
                            time: '',
                            unread: 0,
                            isOnline: true
                        }]);
                        setActiveRoomId(convId);
                    }
                } catch (err) {
                    console.error('Không khởi tạo được cuộc hội thoại của khách hàng', err);
                }
            } else {
                // LOGIC NHÂN VIÊN (Giữ nguyên cấu trúc cũ)
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
                    if (mappedRooms.length > 0 && !activeRoomId) {
                        setActiveRoomId(mappedRooms[0].id);
                    }
                } catch (err) {
                    console.error('Không tải được danh sách phòng chat nhân viên', err);
                }
            }
        };

        initializeChat();
    }, [socket, role]);

    // 2. Tải tin nhắn khi đổi phòng chat (Giữ nguyên logic gốc)
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
                console.error('Lỗi tải tin nhắn', err);
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

    // 3. Sự kiện Real-time Socket (Đảm bảo chạy mượt cho cả 2 vai trò)
    useEffect(() => {
        if (!socket) return;

        const handleChatMessage = (data) => {
            const cid = data.chatconversation_id;
            if (!cid) return;

            if (cid === activeRoomId) {
                setMessages((prev) => [...prev, data]);
                socket.emit('chat:read', { chatconversation_id: activeRoomId });
            }

            setChatRooms((prevRooms) =>
                prevRooms.map((room) =>
                    room.id === cid
                        ? {
                              ...room,
                              lastMessage: data.content,
                              time: formatTime(data.createdate || new Date()),
                              unread: cid === activeRoomId ? 0 : room.unread + 1,
                          }
                        : room
                )
            );
        };

        const handleNewMessageNotify = (data) => {
            // Chỉ nhân viên mới cần lắng nghe cảnh báo phòng chat mới
            if (role === 'customer') return;
            const cid = data.chatconversation_id;
            setChatRooms((prevRooms) => {
                const exist = prevRooms.find(r => r.id === cid);
                if (!exist) {
                    return [{
                        id: cid,
                        name: data.sender_name || 'Khách hàng mới',
                        avatar: (data.sender_name || 'K')[0].toUpperCase(),
                        lastMessage: data.content || 'Tin nhắn mới',
                        time: formatTime(new Date()),
                        unread: 1,
                        isOnline: true
                    }, ...prevRooms];
                }
                return prevRooms;
            });
        };

        const handleTyping = (data) => {
            if (data.chatconversation_id === activeRoomId) {
                // Tùy biến hiển thị tên người đang gõ chữ tương ứng
                const typerName = role === 'customer' ? 'Nhân viên' : (data.sender_name || 'Khách');
                setTypingStatus(data.isTyping ? `${typerName} đang nhập...` : '');
            }
        };

        socket.on('chat:message', handleChatMessage);
        socket.on('chat:new_message', handleNewMessageNotify);
        socket.on('chat:typing', handleTyping);

        return () => {
            socket.off('chat:message', handleChatMessage);
            socket.off('chat:new_message', handleNewMessageNotify);
            socket.off('chat:typing', handleTyping);
        };
    }, [socket, activeRoomId, role]);

    // 4. Kéo cuộn trang cũ (Giữ nguyên)
    const handleScroll = useCallback(async (e) => {
        const container = e.currentTarget;
        if (container.scrollTop <= 10 && !pagination.isLoading && pagination.hasMore && activeRoomId) {
            try {
                setPagination(prev => ({ ...prev, isLoading: true }));
                const nextPage = pagination.page + 1;
                const prevScrollHeight = container.scrollHeight;

                const response = await chatService.getConversationMessages(activeRoomId, nextPage, 20);
                const rawMsgs = response?.data?.rows || [];
                const olderMsgs = rawMsgs.slice().reverse();

                setMessages(prev => [...olderMsgs, ...prev]);
                const total = response?.data?.total || 0;
                setPagination({ page: nextPage, hasMore: total > nextPage * 20, isLoading: false });

                setTimeout(() => { container.scrollTop = container.scrollHeight - prevScrollHeight; }, 10);
            } catch (error) {
                console.error("Lỗi tải thêm tin nhắn cũ:", error);
                setPagination(prev => ({ ...prev, isLoading: false }));
            }
        }
    }, [activeRoomId, pagination]);

    // 5. Gửi tin nhắn (Ghi nhận chính xác theo ID phòng)
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !socket || !activeRoomId) return;

        socket.emit('chat:send', {
            chatconversation_id: activeRoomId,
            company_id: COMPANY_ID,
            content: inputMessage,
        });
        setInputMessage('');
        socket.emit('chat:typing', { chatconversation_id: activeRoomId, isTyping: false });
    };

    const typingTimeoutRef = useRef(null);
    const handleInputChange = (val) => {
        setInputMessage(val);
        if (!socket || !activeRoomId) return;

        if (!typingTimeoutRef.current) {
            socket.emit('chat:typing', { chatconversation_id: activeRoomId, isTyping: true });
        }

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('chat:typing', { chatconversation_id: activeRoomId, isTyping: false });
            typingTimeoutRef.current = null;
        }, 2000);
    };

    const handleRoomSelect = (roomId) => {
        if (role === 'customer') return; // Khách hàng không cần sự kiện chọn phòng khác
        setActiveRoomId(roomId);
        setChatRooms(prevRooms => prevRooms.map(room =>
            room.id === roomId ? { ...room, unread: 0 } : room
        ));
    };

    const activeRoom = useMemo(() => chatRooms.find(r => r.id === activeRoomId), [chatRooms, activeRoomId]);

    return {
        role,
        chatRooms,
        messages,
        activeRoomId,
        activeRoom,
        inputMessage,
        typingStatus,
        setInputMessage: handleInputChange,
        messagesEndRef,
        messagesContainerRef,
        handleSendMessage,
        handleRoomSelect,
        handleScroll
    };
};