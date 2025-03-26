const { validationResult } = require("express-validator");
const Order = require("../models/Order");
const User = require("../models/User");
const sendOrderConfirmationEmail = require("../utils/mailer");
const Product = require("../models/Product");

exports.postOrder = async (req, res, next) => {
  const userId = req.userId; // get in authMiddleware
  const { name, email, phone, address, carts, totalAmount } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Kiểm tra số lượng sản phẩm trong kho
    for (const cart of carts) {
      const product = await Product.findById(cart.product.id);

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${cart.product.name}` });
      }

      // Kiểm tra số lượng sản phẩm trong kho
      if (product.quantity < cart.quantity) {
        return res.status(400).json({
          message: `Not enough stock for product: ${cart.product.name}. Available: ${product.quantity}, Requested: ${cart.quantity}`,
        });
      }
    }

    // Nếu tất cả sản phẩm đều đủ số lượng, cập nhật số lượng trong kho
    for (const cart of carts) {
      const product = await Product.findById(cart.product.id);
      product.quantity -= cart.quantity;
      await product.save();
    }

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
