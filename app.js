// Import các thư viện cần thiết
const express = require("express"); // Framework để xây dựng ứng dụng web
const cors = require("cors"); // Middleware để xử lý CORS (Cross-Origin Resource Sharing)
const bodyParser = require("body-parser"); // Middleware để phân tích dữ liệu từ body của request
const cookieParser = require("cookie-parser"); // Middleware để phân tích cookie từ request
const mongoose = require("mongoose"); // Thư viện để kết nối và làm việc với MongoDB
const http = require("http"); // Module để tạo HTTP server
const { Server } = require("socket.io"); // Thư viện để xử lý giao tiếp thời gian thực qua WebSocket
const socketHandler = require("./utils/socket"); // Import logic Socket.IO từ tệp socket.js
const path = require("path");

// Import các route
const authRoutes = require("./routers/auth"); // Route xử lý logic xác thực
const productRouters = require("./routers/product"); // Route xử lý logic sản phẩm
const orderRouters = require("./routers/order"); // Route xử lý logic đơn hàng
const adminRouters = require("./routers/admin"); // Route xử lý logic admin
const dashboardRouters = require("./routers/dashboard"); // Route xử lý logic dashboard

require("dotenv").config(); // Load các biến môi trường từ tệp .env

// Khởi tạo ứng dụng Express
const app = express();

// Tạo HTTP server từ ứng dụng Express
const server = http.createServer(app);
const cross_url = process.env.CROSS_URL.split(",");
// Tạo một instance của Socket.IO và cấu hình CORS
console.log(cross_url);

const io = new Server(server, {
  cors: {
    origin: cross_url, // Chỉ cho phép các nguồn gốc này truy cập
    credentials: true, // Cho phép gửi cookie qua CORS
  },
});

// Danh sách các nguồn gốc được phép truy cập
const allowedOrigins = cross_url;

// Cấu hình CORS cho ứng dụng Express
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Cho phép các yêu cầu không có nguồn gốc (như từ ứng dụng di động hoặc curl)
      if (allowedOrigins.indexOf(origin) === -1) {
        // Nếu nguồn gốc không nằm trong danh sách được phép
        const msg =
          "The CORS policy for this site does not allow access from the specified origin.";
        return callback(new Error(msg), false); // Trả về lỗi
      }
      return callback(null, true); // Cho phép yêu cầu tiếp tục
    },
    credentials: true, // Cho phép gửi cookie qua CORS
  })
);

// Cung cấp quyền truy cập thư mục uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware để phân tích dữ liệu JSON từ body của request
app.use(bodyParser.json());
app.use(express.json()); // Phân tích dữ liệu JSON
app.use(express.urlencoded({ extended: true })); // Phân tích dữ liệu URL-encoded

// Middleware để phân tích cookie từ request
app.use(cookieParser());

// Định nghĩa các route cho ứng dụng

// ** sử dụng cho client
app.use("/auth", authRoutes); // Route xử lý logic xác thực
app.use("/products", productRouters); // Route xử lý logic sản phẩm
app.use("/orders", orderRouters); // Route xử lý logic đơn hàng

// ** sử dụng cho admin
app.use("/admin", adminRouters); // Route xử lý logic admin
app.use("/dashboard", dashboardRouters); // Route xử lý logic admin

// Chuỗi kết nối MongoDB
const URI_MONGODB = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@clusternodejs.7bqsu.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

// Kết nối đến MongoDB
mongoose
  .connect(URI_MONGODB)
  .then(() => {
    // Nếu kết nối thành công, khởi động server
    const PORT = process.env.PORT || 5001; // Lấy cổng từ biến môi trường hoặc sử dụng cổng mặc định là 5001
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`); // In ra thông báo server đang chạy
    });
  })
  .catch((error) => {
    // Nếu kết nối thất bại, in ra lỗi
    console.error("Connection error", error);
  });

// Sử dụng logic Socket.IO từ tệp socket.js
socketHandler(io); // Truyền instance của Socket.IO vào hàm xử lý logic
