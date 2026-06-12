// Đường dẫn Router mẫu trên Backend lõi (Cổng 4000)
// Endpoint: POST /api/v1/chat/conversations/messages/save-call
router.post('/api/v1/chat/conversations/messages/save-call', async (req, res) => {
  try {
    const { chatconversation_id, company_id, msg_type, content, sendertype, sender_name } = req.body;

    if (!chatconversation_id || !content) {
      return res.status(400).json({ errorCode: 0, message: "Thiếu tham số cuộc gọi" });
    }

    // Thực hiện truy vấn tạo bản ghi trực tiếp vào Database lõi hệ thống chat của anh
    const newLog = await db.ChatMessage.create({
      chatconversation_id,
      company_id: company_id || "0e3b15dc-c1d8-4d1c-90a0-dde7333ac791",
      msg_type: msg_type || "call_history",
      content, // Chuỗi mã hóa JSON chứa thông tin status, duration, type cuộc gọi
      sendertype, // 1: Nhân viên, 2: Khách hàng
      sender_name: sender_name || "Hệ thống",
      createdate: new Date()
    });

    return res.status(200).json({ errorCode: 1, message: "Đã ghi nhận lịch sử đàm thoại vĩnh viễn", data: newLog });
  } catch (error) {
    console.error("❌ [BE_Call Main Error]:", error);
    return res.status(500).json({ errorCode: 0, message: "Lỗi xử lý cơ sở dữ liệu" });
  }
});