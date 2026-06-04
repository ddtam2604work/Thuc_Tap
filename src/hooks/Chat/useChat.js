import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';

const INITIAL_CHAT_ROOMS = [
    { id: 'uuid-khach-001', name: 'Nguyễn Văn Khách', avatar: 'N', lastMessage: 'Tôi muốn hỏi về đơn hàng DH-1023', time: '10:42', unread: 0, isOnline: true },
    { id: 'uuid-khach-002', name: 'Trần Thị Mai', avatar: 'T', lastMessage: 'Sản phẩm này còn màu xanh không shop?', time: '09:15', unread: 0, isOnline: false },
    { id: 'uuid-khach-003', name: 'Lê Hoàng Phong', avatar: 'L', lastMessage: 'Cảm ơn bạn đã hỗ trợ.', time: 'Hôm qua', unread: 0, isOnline: true }
];

const INITIAL_MESSAGES = [
    { id: 1, sender: 'customer', text: 'Chào shop, tôi cần hỗ trợ!', time: '10:40' },
    { id: 2, sender: 'admin', text: 'Chào bạn, Labs Flow có thể giúp gì cho bạn?', time: '10:41' },
    { id: 3, sender: 'customer', text: 'Tôi muốn hỏi về đơn hàng DH-1023', time: '10:42' },
];

export const useChat = () => {
    const { socket, setGlobalUnreadCount } = useSocket();
    const messagesEndRef = useRef(null);

    // State
    const [chatRooms, setChatRooms] = useState(INITIAL_CHAT_ROOMS);
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [activeRoomId, setActiveRoomId] = useState(INITIAL_CHAT_ROOMS[0].id);
    const [inputMessage, setInputMessage] = useState('');

    // Tự động cuộn xuống tin nhắn mới nhất
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Logic Socket.IO
    useEffect(() => {
        if (!socket) return;

        setGlobalUnreadCount(0);
        socket.emit('join_room', activeRoomId);

        const handleReceiveMessage = (incomingMsg) => {
            if (incomingMsg.roomId === activeRoomId) {
                setMessages((prev) => [...prev, incomingMsg]);
            } else {
                setChatRooms(prevRooms => prevRooms.map(room =>
                    room.id === incomingMsg.roomId
                        ? { ...room, lastMessage: incomingMsg.text, unread: room.unread + 1, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                        : room
                ));
            }
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.emit('leave_room', activeRoomId);
        };
    }, [socket, activeRoomId, setGlobalUnreadCount]);

    // Xử lý gửi tin nhắn
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const newMsg = {
            id: Date.now(),
            roomId: activeRoomId,
            sender: 'admin',
            text: inputMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        if (socket) {
            socket.emit('send_message', newMsg);
        }

        setMessages(prev => [...prev, newMsg]);
        setInputMessage('');

        setChatRooms(prevRooms => prevRooms.map(room =>
            room.id === activeRoomId
                ? { ...room, lastMessage: newMsg.text, time: newMsg.time }
                : room
        ));
    };

    // Xử lý chọn phòng chat
    const handleRoomSelect = (roomId) => {
        setActiveRoomId(roomId);
        setChatRooms(prevRooms => prevRooms.map(room =>
            room.id === roomId ? { ...room, unread: 0 } : room
        ));
        // TODO: Fetch message history for the new room
    };

    const activeRoom = useMemo(() => chatRooms.find(r => r.id === activeRoomId), [chatRooms, activeRoomId]);

    return {
        chatRooms,
        messages,
        activeRoomId,
        activeRoom,
        inputMessage,
        setInputMessage,
        messagesEndRef,
        handleSendMessage,
        handleRoomSelect,
    };
};