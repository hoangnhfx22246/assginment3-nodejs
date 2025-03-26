const express = require("express");
const router = express.Router();

// import middleware
const authMiddleware = require("../middlewares/authMiddleware");

// import controller dashboard
const dashboardController = require("../controllers/dashboard");
const checkRole = require("../middlewares/checkRole");

// dashboard/info
router.get(
  "/info",
  authMiddleware,
  checkRole("admin"),
  dashboardController.getInfo
);
router.get(
  "/orders-history",
  authMiddleware,
  checkRole("admin"),
  dashboardController.getOrdersHistory
);

module.exports = router;
