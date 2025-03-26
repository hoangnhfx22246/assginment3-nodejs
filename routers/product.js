const express = require("express");
const {
  getProducts,
  getProduct,
  deleteProduct,
  postProduct,
  updateProduct,
} = require("../controllers/product");
const upload = require("../utils/multer");
const authMiddleware = require("../middlewares/authMiddleware");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const checkRole = require("../middlewares/checkRole");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProduct);

// for admin only
router.post(
  "/product",
  (req, res, next) => {
    // Middleware xử lý upload file với Multer
    upload.array("images", 5)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Xử lý lỗi Multer
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(400)
            .json({ message: "File too large. Maximum size is 5MB." });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res
            .status(400)
            .json({ message: "Too many files. Maximum 5 files are allowed." });
        }

        return res.status(400).json({ message: err.message });
      } else if (err) {
        // Xử lý các lỗi khác
        return res
          .status(500)
          .json({ message: "An unexpected error occurred." });
      }
      next();
    });
  },
  [
    // Validate request body
    body("name").notEmpty().withMessage("name is required"),
    body("category").notEmpty().withMessage("category is required"),
    body("long_desc").notEmpty().withMessage("long_desc is required"),
    body("short_desc").notEmpty().withMessage("short_desc is required"),
    body("price")
      .notEmpty()
      .withMessage("price is required")
      .isNumeric()
      .withMessage("must be a number"),
    body("quantity")
      .notEmpty()
      .withMessage("quantity is required")
      .isNumeric()
      .withMessage("must be a number"),
  ],
  authMiddleware,
  checkRole("admin"),
  postProduct
);
router.delete("/:id", authMiddleware, checkRole("admin"), deleteProduct);
router.put(
  "/product/:id",
  (req, res, next) => {
    // Middleware xử lý upload file với Multer
    upload.array("images", 5)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Xử lý lỗi Multer
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(400)
            .json({ message: "File too large. Maximum size is 5MB." });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res
            .status(400)
            .json({ message: "Too many files. Maximum 5 files are allowed." });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        // Xử lý các lỗi khác
        return res
          .status(500)
          .json({ message: "An unexpected error occurred." });
      }
      next();
    });
  }, // Middleware xử lý upload file
  [
    // Validate request body
    body("name").optional().notEmpty().withMessage("name is required"),
    body("category").optional().notEmpty().withMessage("category is required"),
    body("long_desc")
      .optional()
      .notEmpty()
      .withMessage("long_desc is required"),
    body("short_desc")
      .optional()
      .notEmpty()
      .withMessage("short_desc is required"),
    body("price")
      .optional()
      .notEmpty()
      .withMessage("price is required")
      .withMessage("must be a number"),
    body("quantity")
      .notEmpty()
      .withMessage("quantity is required")
      .isNumeric()
      .withMessage("must be a number"),
  ],
  authMiddleware, // Middleware xác thực
  checkRole("admin"),
  (req, res, next) => {
    // Kiểm tra lỗi từ express-validator
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    next();
  },
  updateProduct // Controller xử lý cập nhật sản phẩm
);
module.exports = router;
