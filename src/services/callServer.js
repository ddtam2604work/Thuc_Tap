import 'dotenv/config'; // Đọc cấu hình từ file .env
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

// BẮT BUỘC PHÒNG THỦ: Bỏ qua cảnh báo chặn bảo mật TLS khi Node gọi HTTPS tới IP Public chứng chỉ tự ký
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();

// Cấu hình CORS mềm dẻo cho Express HTTP endpoints nếu có phát sinh
app.use(cors({
  origin: true,
  credentials: true
}));

// Vận hành nội bộ dưới giao thức HTTP/WS thuần túy (SSL Offloading được xử lý bởi Nginx ở cổng 7002)
const server = http.createServer(app);
console.log('🔓 Call Server vận hành nội bộ dưới giao thức HTTP/WS (SSL Offloading Enabled)');

// Khởi tạo Socket.io với cấu hình CORS tối ưu cho môi trường Production
const io = new Server(server, {
  // 🎯 ĐIỀU CHỈNH CHÍNH: Thay đổi thành '/socket.io' để khớp hoàn toàn với cấu hình proxy_pass của Nginx
  path: '/socket.io', 
  connectTimeout: 45000,
  pingTimeout: 30000,
  pingInterval: 25000,
  cors: {
    origin: (origin, callback) => {
      // Chấp nhận mọi Origin kết nối đến (bao gồm cả domain + port 7002)
      callback(null, true); 
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

const activeCalls = new Map();

// Hàm xử lý gọi API lưu dữ liệu sang Backend lõi (Port 4000)
async function saveCallToMainDatabase(roomCallId, session, status, duration = 0) {
  try {
    // 🎯 ƯU TIÊN LUỒNG NỘI BỘ: Nếu không có cấu hình env, gọi thẳng qua localhost HTTPS để có tốc độ cao nhất
    const backendBaseUrl = process.env.BE_Call || 'https://127.0.0.1:4000';
    const cleanUrl = backendBaseUrl.replace(/\/$/, '');

    const payload = {
      chatconversation_id: roomCallId,
      company_id: "0e3b15dc-c1d8-4d1c-90a0-dde7333ac791",
      sender_name: "Hệ thống",
      sendertype: session.initiatorRole === 'customer' ? 2 : 1,
      msg_type: "call_history",
      content: JSON.stringify({
        type: session.type,
        duration: duration,
        status: status,
        initiator: session.initiatorRole
      })
    };

    const response = await fetch(`${cleanUrl}/api/v1/chat/conversations/messages/save-call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP Error Status: ${response.status}`);
    }

    console.log(`💾 [BE_Call API] Đồng bộ dữ liệu cuộc gọi sang API cổng 4000 thành công.`);
  } catch (err) {
    console.error("❌ [BE_Call API Error] Không thể kết nối API cổng 4000:", err.message);
  }
}

// Middleware xác thực trạng thái kết nối
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.auth.accessToken;
  if (!token || token === "null" || token === "undefined") {
    socket.isGuest = true;
    return next();
  }
  socket.isGuest = false;
  next();
});

io.on('connection', (socket) => {
  console.log('🟢 Một Client đã kết nối! Socket ID:', socket.id);

  socket.on('call:invite', (data) => {
    const roomCallId = data.chatconversation_id;
    activeCalls.set(roomCallId, {
      startTime: null,
      type: data.type,
      initiatorSocketId: socket.id,
      initiatorRole: data.role || 'staff',
      status: 'ringing'
    });
    socket.broadcast.emit('call:incoming', data);
  });

  socket.on('call:accept', (data) => {
    const roomCallId = data.chatconversation_id;
    const session = activeCalls.get(roomCallId);
    if (session) {
      session.startTime = Date.now();
      session.status = 'connected';
    }
    socket.broadcast.emit('call:accepted', data);
  });

  socket.on('call:reject', (data) => {
    const roomCallId = data.chatconversation_id;
    const session = activeCalls.get(roomCallId);
    if (session) {
      saveCallToMainDatabase(roomCallId, session, 'rejected', 0);
      
      io.emit('call:save_log', {
        chatconversation_id: roomCallId,
        type: session.type,
        duration: 0,
        status: 'rejected',
        initiator: session.initiatorRole 
      });
      activeCalls.delete(roomCallId);
    }
    socket.broadcast.emit('call:terminated', data);
  });

  socket.on('call:terminate', (data) => {
    const roomCallId = data.chatconversation_id;
    const session = activeCalls.get(roomCallId);
    if (session) {
      let duration = 0;
      if (session.startTime) {
        duration = Math.round((Date.now() - session.startTime) / 1000); 
      }

      saveCallToMainDatabase(roomCallId, session, duration > 0 ? 'completed' : 'missed', duration);

      io.emit('call:save_log', {
        chatconversation_id: roomCallId,
        type: session.type,
        duration: duration,
        status: duration > 0 ? 'completed' : 'missed',
        initiator: session.initiatorRole
      });
      activeCalls.delete(roomCallId);
    }
    socket.broadcast.emit('call:terminated', data);
  });

  socket.on('call:busy', (data) => {
    const roomCallId = data.chatconversation_id;
    const session = activeCalls.get(roomCallId);
    if (session) {
      saveCallToMainDatabase(roomCallId, session, 'busy', 0);

      io.emit('call:save_log', {
        chatconversation_id: roomCallId,
        type: session.type,
        duration: 0,
        status: 'busy',
        initiator: session.initiatorRole
      });
      activeCalls.delete(roomCallId);
    }
    socket.broadcast.emit('call:busy', data);
  });

  // Luồng WebRTC Signaling trung chuyển gói tin thô
  socket.on('call:offer', (data) => { socket.broadcast.emit('call:offer', data); });
  socket.on('call:answer', (data) => { socket.broadcast.emit('call:answer', data); });
  socket.on('call:ice-candidate', (data) => { socket.broadcast.emit('call:ice-candidate', data); });

  // Cơ chế thông báo đẩy mô phỏng (Giữ nguyên gốc)
  let mockInterval;
  if (!socket.isGuest) {
    mockInterval = setInterval(() => {
      const mockData = {
        id: Date.now(),
        sender: 'Hệ thống Quản Lý',
        message: 'Bạn có một thông báo đơn hàng mới!'
      };
      socket.emit('receive_message', mockData);
    }, 10000);
  }

  socket.on('disconnect', () => {
    console.log('🔴 Client đã ngắt kết nối:', socket.id);
    if (mockInterval) clearInterval(mockInterval);
    
    activeCalls.forEach((session, convId) => {
      if (session.initiatorSocketId === socket.id) {
        if (session.status === 'ringing') {
          saveCallToMainDatabase(convId, session, 'missed', 0);
          io.emit('call:save_log', {
            chatconversation_id: convId,
            type: session.type,
            duration: 0,
            status: 'missed',
            initiator: session.initiatorRole
          });
        }
        socket.broadcast.emit('call:terminated');
        activeCalls.delete(convId);
      }
    });
  });
});

const PORT = 4001;
server.listen(PORT, () => {
  console.log(`🚀 Call Server vận hành chính thức tại Port: ${PORT}`);
});