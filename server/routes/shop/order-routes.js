const express = require("express");

const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  capturePayment,
  createOrderWithoutPayment,
  createRazorpayOrder,
  verifyRazorpayPayment
} = require("../../controllers/shop/order-controller");

const Order = require("../../models/Order");

const router = express.Router();

router.post("/create", createOrder);
router.post("/capture", capturePayment);
router.post("/create-without-payment", createOrderWithoutPayment);
router.post("/create-razorpay", createRazorpayOrder);
router.post("/verify-razorpay", verifyRazorpayPayment);
router.get("/user/:userId", getAllOrdersByUser);
router.get("/details/:id", getOrderDetails);

// Debug route to check all unique user IDs in orders
router.get("/debug/user-ids", async (req, res) => {
  try {
    // Find all orders
    const orders = await Order.find();
    
    // Extract unique user IDs
    const userIds = [...new Set(orders.map(order => order.userId))];
    
    // Count orders per user ID
    const userOrderCounts = {};
    userIds.forEach(userId => {
      userOrderCounts[userId] = orders.filter(order => order.userId === userId).length;
    });
    
    res.status(200).json({
      success: true,
      totalOrders: orders.length,
      uniqueUserIds: userIds.length,
      userIds: userOrderCounts
    });
  } catch (error) {
    console.error("Error in debug route:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving user IDs",
      error: error.message
    });
  }
});

// Utility route to update user ID for orders (use with caution)
router.post("/debug/update-user-id", async (req, res) => {
  try {
    const { currentUserId, correctUserId, orderId } = req.body;
    
    if (!correctUserId) {
      return res.status(400).json({
        success: false,
        message: "correctUserId is required"
      });
    }
    
    let query = {};
    
    // If orderId is provided, update just that order
    if (orderId) {
      query = { _id: orderId };
    } 
    // Otherwise, update all orders with the currentUserId
    else if (currentUserId) {
      query = { userId: currentUserId };
    } else {
      return res.status(400).json({
        success: false,
        message: "Either orderId or currentUserId must be provided"
      });
    }
    
    const result = await Order.updateMany(
      query,
      { $set: { userId: correctUserId } }
    );
    
    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} orders`,
      result
    });
  } catch (error) {
    console.error("Error updating user IDs:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user IDs",
      error: error.message
    });
  }
});

module.exports = router;
