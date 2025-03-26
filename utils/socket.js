const RoomChat = require("../models/RoomChat"); // Import model RoomChat
const User = require("../models/User");

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Xử lý sự kiện joinRoom
    socket.on("joinRoom", async (roomId) => {
      try {
        socket.join(roomId); // Tham gia vào phòng chat với roomId
        console.log(`User ${socket.id} joined room ${roomId}`);

        // Kiểm tra xem phòng đã tồn tại trong cơ sở dữ liệu chưa
        let room = await RoomChat.findOne({ roomId });
        if (!room) {
          return;
        }

        // Gửi thông tin phòng chat đến client
        const populatedRoom = await RoomChat.findById(room._id)
          .populate("participants.userId", "name email role")
          .populate("messages.sender", "name role");
        io.to(roomId).emit("roomJoined", populatedRoom);
      } catch (error) {
        console.error("Error in joinRoom:", error.message);
      }
    });

    // Xử lý sự kiện sendMessage
    socket.on("sendMessage", async ({ roomId, content, sender }) => {
      try {
        const chatMessage = { sender, content, timestamp: new Date() };
        const userId = sender;
        const user = await User.findById(userId);
        const name = user.name;

        // Lưu tin nhắn vào cơ sở dữ liệu
        let room = await RoomChat.findOne({ roomId });
        if (!room) {
          // Nếu phòng chưa tồn tại, tạo phòng mới
          room = new RoomChat({
            roomId,
            participants: [{ userId, name }],
          });
          await room.save();
        } else {
          // Nếu phòng đã tồn tại, kiểm tra xem người dùng đã có trong danh sách participants chưa
          const isParticipantExists = room.participants.some(
            (participant) => participant.userId.toString() === userId
          );
          if (!isParticipantExists) {
            room.participants.push({ userId, name }); // Thêm người dùng vào danh sách participants
            await room.save();
          }
        }
        if (room) {
          room.messages.push(chatMessage); // Thêm tin nhắn vào danh sách messages
          room.lastMessage = content; // Cập nhật tin nhắn cuối cùng
          room.unreadCount += 1; // Tăng số lượng tin nhắn chưa đọc
          await room.save();
        }

        const populateRoom = await RoomChat.findOne({ roomId: room.roomId })
          .populate("participants.userId", "name email role")
          .populate("messages.sender", "name role");

        const populateMessage = populateRoom.messages.find((message) => {
          return (
            message.timestamp.toString() === chatMessage.timestamp.toString()
          );
        });

        // Lấy danh sách phòng chat mà người dùng tham gia
        const rooms = await RoomChat.find()
          .populate("participants.userId", "name email role")
          .populate("messages.sender", "name role");
        // Gửi danh sách phòng chat đến client
        io.emit("updateRooms", rooms);

        // Gửi tin nhắn đến tất cả các client trong phòng
        console.log(roomId);

        io.to(roomId).emit("receiveMessage", populateMessage);
      } catch (error) {
        console.error("Error in sendMessage:", error.message);
      }
    });
    //lắng nghe sự kiện getRooms
    socket.on("getRooms", async () => {
      try {
        // Lấy danh sách phòng chat mà người dùng tham gia
        const rooms = await RoomChat.find()
          .populate("participants.userId", "name email role")
          .populate("messages.sender", "name role");
        // Gửi danh sách phòng chat đến client
        socket.emit("updateRooms", rooms);
      } catch (error) {
        console.error("Error in getRooms:", error.message);
      }
    });

    // Xử lý sự kiện endChat
    socket.on("endChat", async (roomId) => {
      try {
        // Cập nhật trạng thái phòng chat trong cơ sở dữ liệu
        const room = await RoomChat.findOne({ roomId });
        console.log(roomId);

        if (room) {
          // Xóa phòng chat khỏi cơ sở dữ liệu
          await RoomChat.deleteOne({ roomId });
          console.log(`Room ${roomId} has been deleted.`);
        }

        // Gửi thông báo đến tất cả các client trong phòng rằng chat đã kết thúc
        io.to(roomId).emit("chatEnded", { message: "Chat has been ended." });

        const rooms = await RoomChat.find()
          .populate("participants.userId", "name email role")
          .populate("messages.sender", "name role");
        // Gửi danh sách phòng chat đến client
        io.emit("updateRooms", rooms);

        socket.leave(roomId); // Rời khỏi phòng chat
      } catch (error) {
        console.error("Error in endChat:", error.message);
      }
    });

    // Lắng nghe sự kiện disconnect
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
};

module.exports = socketHandler;
