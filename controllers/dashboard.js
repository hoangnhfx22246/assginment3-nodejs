const { json } = require("body-parser");
const User = require("../models/User");
const { Result } = require("express-validator");
const Order = require("../models/Order");

exports.getInfo = async (req, res) => {
  try {
    // Tổng số người dùng
    const totalClient = await User.find({ role: "client" }).countDocuments();

    // Tổng số giao dịch
    const totalTransactions = await Order.countDocuments();
    // Tổng doanh thu
    const totalRevenue = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);
    // Doanh thu trung bình hàng tháng
    const avgMonthlyRevenue = totalRevenue[0]?.total
      ? totalRevenue[0].total / 12
      : 0;

    return res.status(200).json({
      result: {
        totalClient,
        totalTransactions,
        totalRevenue: totalRevenue[0]?.total,
        avgMonthlyRevenue,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.getOrdersHistory = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json({ result: orders });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
};
