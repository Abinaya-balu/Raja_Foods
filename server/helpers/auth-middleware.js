const jwt = require("jsonwebtoken");

// Use a constant for the JWT secret key instead of importing from auth-controller
const ACCESS_TOKEN_SECRET = "CLIENT_SECRET_KEY";

// Authentication middleware
const auth = (req, res, next) => {
  try {
    let token;
    
    // Check Authorization header first
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    
    // If no token in Authorization header, check cookies as fallback
    if (!token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Verify token with the consistent secret key
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    
    // Add user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { auth }; 