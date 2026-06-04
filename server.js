const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // Cho phép Cross-Origin resource sharing

const server = http.createServer(app);

// 1. Khởi tạo Socket.io và cấp quyền CORS cho Vite (thường chạy port 5173)
const io = new Server(server, {
  cors: {
    // Cho phép tất cả các cổng chạy từ localhost kết nối tới
    origin: [/http:\/\/localhost:\d+/], 
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 2. Middleware giả lập bắt Token từ Frontend gửi lên (Đã nâng cấp)
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  // Nếu không có token, không ném lỗi nữa mà chỉ log cảnh báo và cho qua dạng "Khách"
  if (!token || token === "null" || token === "undefined") {
    console.log("🟡 Client kết nối ở chế độ chờ (Chưa đăng nhập / Chưa có Token)");
    socket.isGuest = true; // Đánh dấu đây là khách chưa login
    return next();
  }
  
  console.log(`🔑 Đã xác thực token thành công: ${token.substring(0, 15)}...`);
  socket.isGuest = false;
  next();
});

// 3. Xử lý logic khi Client kết nối thành công
io.on('connection', (socket) => {
  console.log('🟢 Một Client đã kết nối! Socket ID:', socket.id);

  // Chỉ bắn data giả lập nếu user ĐÃ đăng nhập thành công (không phải Guest)
  let mockInterval;
  if (!socket.isGuest) {
    mockInterval = setInterval(() => {
      const mockData = {
        id: Date.now(),
        sender: 'Hệ thống Quản Lý',
        message: 'Bạn có một thông báo đơn hàng mới!'
      };
      socket.emit('receive_message', mockData);
      console.log('📤 Đã bắn sự kiện [receive_message] tới client:', socket.id);
    }, 10000);
  }

  socket.on('disconnect', () => {
    console.log('🔴 Client đã ngắt kết nối:', socket.id);
    if (mockInterval) clearInterval(mockInterval);
  });
});

// Chạy server ở port 4001 (để tránh đụng port 4000 của BE thật nếu bạn đang chạy song song)
const PORT = 4001;
server.listen(PORT, () => {
  console.log(`🚀 Local Socket Mock Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`⏳ Đang chờ Frontend kết nối tới...`);
});