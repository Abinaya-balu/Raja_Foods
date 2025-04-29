const express = require("express");
const { authMiddleware } = require("../../controllers/auth/auth-controller");

const {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  processRefund,
  updatePaymentStatus
} = require("../../controllers/admin/order-controller");

const router = express.Router();

// Protect all admin routes with authentication
router.get("/get", authMiddleware, getAllOrdersOfAllUsers);
router.get("/details/:id", authMiddleware, getOrderDetailsForAdmin);
router.put("/update/:id", authMiddleware, updateOrderStatus);
router.post("/refund/:id", authMiddleware, processRefund);
router.put("/updatePaymentStatus/:id", authMiddleware, updatePaymentStatus);

module.exports = router;
