const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomChatSchema = new Schema(
  {
    roomId: {
      type: String,
      required: true, // Mỗi phòng chat cần có một roomId duy nhất
    },
    participants: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User", // Tham chiếu đến bảng User
          required: true,
        },
        name: {
          type: String,
          required: true, // Tên của người tham gia
        },
      },
    ],
    messages: [
      {
        sender: {
          type: Schema.Types.ObjectId,
          ref: "User", // Tham chiếu đến bảng User
          required: true,
        },
        content: {
          type: String,
          required: true, // Nội dung tin nhắn
        },
        timestamp: {
          type: Date,
          default: Date.now, // Thời gian gửi tin nhắn
        },
      },
    ],
    lastMessage: {
      type: String, // Nội dung tin nhắn cuối cùng
      default: "",
    },
    unreadCount: {
      type: Number, // Số lượng tin nhắn chưa đọc
      default: 0,
    },
    isActive: {
      type: Boolean, // Trạng thái hoạt động của phòng chat
      default: true,
    },
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

module.exports = mongoose.model("RoomChat", roomChatSchema);
