import { Router } from 'express';
const router = Router();

// Giả định db được import từ cấu hình models Sequelize của anh
// import db from '../../../models/index.js'; 

// Đường dẫn Router mẫu trên Backend lõi (Cổng 4000)
// Endpoint: POST /api/v1/chat/conversations/messages/save-call
router.post('/api/v1/chat/conversations/messages/save-call', async (req, res) => {
  try {
    const { 
      chatconversation_id, 
      company_id, 
      msg_type, 
      content, 
      sendertype, 
      sender_name 
    } = req.body;

    // Nguyên tắc phòng thủ tầng API: Kiểm tra dữ liệu bắt buộc đầu vào
    if (!chatconversation_id || !content) {
      return res.status(400).json({ 
        errorCode: 0, 
        message: "Thiếu tham số dữ liệu cuộc gọi bắt buộc." 
      });
    }

    // Thực hiện truy vấn tạo bản ghi trực tiếp vào Database lõi hệ thống chat vĩnh viễn
    const newLog = await db.ChatMessage.create({
      chatconversation_id,
      company_id: company_id || "0e3b15dc-c1d8-4d1c-90a0-dde7333ac791",
      msg_type: msg_type || "call_history",
      content,      // Chuỗi mã hóa JSON chứa thông tin status, duration, type cuộc gọi
      sendertype,   // 1: Nhân viên (Staff), 2: Khách hàng (Customer)
      sender_name: sender_name || "Hệ thống",
      createdate: new Date()
    });

    // Trả lời phản hồi thành công đồng bộ cấu trúc hệ thống
    return res.status(200).json({ 
      errorCode: 1, 
      message: "Đã ghi nhận lịch sử đàm thoại vĩnh viễn vào hệ thống thành công.", 
      data: newLog 
    });

  } catch (error) {
    console.error("❌ [BE_Call Main Database Error]:", error);
    return res.status(500).json({ 
      errorCode: 0, 
      message: "Lỗi hệ thống trong quá trình ghi dữ liệu vào cơ sở dữ liệu." 
    });
  }
});

export default router;