const jwt = require("jsonwebtoken");
const Session = require("../models/Session");

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      // Xóa session nếu token hết hạn
      await Session.findOneAndDelete({ token });
      // Xóa cookie
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict", // Bảo vệ chống lại CSRF
      });
      return res.status(401).json({ message: "Token expired, logged out" });
    } else {
      return res.status(401).json({ message: "Invalid token" });
    }
  }
};

module.exports = authMiddleware;
