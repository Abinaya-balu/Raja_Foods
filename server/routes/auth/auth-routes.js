const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  authMiddleware,
  verifyEmail,
  resendVerification,
  testVerifyEmail
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);
router.post("/logout", logoutUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);

// Test route for verification (remove in production)
router.get("/test-verify-email/:token", testVerifyEmail);

router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    user,
  });
});

module.exports = router;
