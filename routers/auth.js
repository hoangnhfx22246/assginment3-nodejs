const express = require("express");

const router = express.Router();
const { body } = require("express-validator");

// middleware
const authMiddleware = require("../middlewares/authMiddleware");

// import controller auth
const authController = require("../controllers/auth");

//* auth/signup router
router.post(
  "/signup",
  [
    // Validate request body
    body("name").notEmpty().withMessage("Full Name is required"),
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .normalizeEmail(),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .trim(),
    body("phone")
      .notEmpty()
      .withMessage("phone is required")
      .isMobilePhone()
      .withMessage("Please enter a valid phone number"),
  ],
  authController.signup
);

//* auth/login router
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
  authController.login
);

//* auth/logout router
router.post("/logout", authController.logout);

//* auth/check-token router
router.post("/check-token", authMiddleware, authController.checkToken);

module.exports = router;
