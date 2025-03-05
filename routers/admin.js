const express = require("express");

const router = express.Router();
const { body } = require("express-validator");

// middleware
const authMiddleware = require("../middlewares/authMiddleware");

// import controller auth
const adminController = require("../controllers/admin");

//* admin/login router
router.post(
  "/login",
  [
    // Validate request body
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required").trim(),
  ],
  adminController.login
);

//* admin/logout router
router.post("/logout", adminController.logout);

//* admin/check-token router
router.post("/check-token", authMiddleware, adminController.checkToken);

module.exports = router;
