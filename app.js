const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const authRoutes = require("./routers/auth");
const productRouters = require("./routers/product");
const orderRouters = require("./routers/order");
const adminRouters = require("./routers/admin");

require("dotenv").config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://hoangnhfx22246.github.io",
];
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Cho phép gửi cookie
  })
);
app.use(bodyParser.json());
app.use(cookieParser()); // Sử dụng middleware cookie-parser

app.use("/auth", authRoutes);
app.use("/products", productRouters);
app.use("/orders", orderRouters);
app.use("/admin", adminRouters);

const URI_MONGODB = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@clusternodejs.7bqsu.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;
mongoose
  .connect(URI_MONGODB)
  .then(() => {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Connection error", error);
  });
