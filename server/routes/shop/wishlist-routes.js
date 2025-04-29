const express = require("express");
const { authMiddleware } = require("../../controllers/auth/auth-controller");
const {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = require("../../controllers/shop/wishlist-controller");

const router = express.Router();

// Apply authentication middleware to all wishlist routes
router.use(authMiddleware);

// Get a user's wishlist
router.get("/:userId", getUserWishlist);

// Add product to wishlist
router.post("/add", addToWishlist);

// Remove product from wishlist
router.delete("/:userId/:productId", removeFromWishlist);

// Clear wishlist
router.delete("/:userId", clearWishlist);

module.exports = router; 