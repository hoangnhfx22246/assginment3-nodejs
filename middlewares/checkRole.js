const User = require("../models/User");

const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId; // Giả sử bạn đã xác thực người dùng và lưu thông tin trong `req.user`
      const user = await User.findById(userId);

      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "something went wrong" });
    }
  };
};
module.exports = checkRole;
