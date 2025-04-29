const express = require("express");
const router = express.Router();
const { auth } = require("../../helpers/auth-middleware");
const { adminAuth } = require("../../helpers/admin-middleware");
const {
  getAvailableSlots,
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus
} = require("../../controllers/shop/grinding-bookings-controller");

// Debug endpoint to check authentication
router.get("/check-auth", auth, (req, res) => {
  return res.json({
    success: true,
    message: "Authentication successful",
    user: req.user
  });
});

// Get available time slots for a specific date
router.get("/availability", getAvailableSlots);

// Customer creates a booking (requires auth)
router.post("/", auth, createBooking);

// Customer gets their bookings (requires auth)
router.get("/my", auth, getMyBookings);

// Admin gets all bookings (requires admin auth)
router.get("/", adminAuth, getAllBookings);

// Admin updates booking status (requires admin auth)
router.put("/:id", adminAuth, updateBookingStatus);

module.exports = router; 