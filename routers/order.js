const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { postOrder, getOrder, getOrders } = require("../controllers/order");
const { body } = require("express-validator");
const router = express.Router();

// /orders/checkout
router.post(
  "/checkout",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("please enter a valid email")
      .normalizeEmail(),
    body("phone")
      .notEmpty()
      .withMessage("Phone is required")
      .isMobilePhone()
      .withMessage("Please enter a valid phone number"),
    body("address").notEmpty().withMessage("Address is required"),
    body("carts")
      .notEmpty()
      .withMessage("Carts is required")
      .isArray({ min: 1 })
      .withMessage("please add product to cart"),
    body("totalAmount").notEmpty().withMessage("Total amount is required"),
  ],
  authMiddleware,
  postOrder
);

// /orders/:id
router.get("/:id", authMiddleware, getOrder);

// /orders/checkout
router.get("/", authMiddleware, getOrders);
module.exports = router;
