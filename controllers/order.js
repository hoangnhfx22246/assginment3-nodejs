const { validationResult } = require("express-validator");
const Order = require("../models/Order");
const User = require("../models/User");
const sendOrderConfirmationEmail = require("../utils/mailer");

exports.postOrder = async (req, res, next) => {
  const userId = req.userId; // get in authMiddleware
  const { name, email, phone, address, carts, totalAmount } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // create a new order
    const order = new Order({
      user: userId,
      carts,
      name,
      email,
      phone,
      address,
      totalAmount,
    });
    await order.save();

    //add a new order to user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.orders.push(order._id);
    await user.save();

    // Send order confirmation email
    sendOrderConfirmationEmail(order);

    res
      .status(200)
      .json({ result: order, message: "Order created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
exports.getOrder = async (req, res, next) => {
  const userId = req.userId; // get in authMiddleware
  const { id } = req.params; //id order
  try {
    const order = await Order.findById(id);
    res.status(200).json({ result: order });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
exports.getOrders = async (req, res, next) => {
  const userId = req.userId; // get in authMiddleware
  try {
    const orders = await Order.find({ user: userId });
    res.status(200).json({ result: orders });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
