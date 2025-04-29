const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../../helpers/email");

// Secret keys
const ACCESS_TOKEN_SECRET = "CLIENT_SECRET_KEY";
const REFRESH_TOKEN_SECRET = "REFRESH_SECRET_KEY";

//register
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    console.log("Registration attempt:", { userName, email, passwordLength: password?.length });
    
    // Check if required fields are present
    if (!userName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required. Please provide userName, email, and password."
      });
    }

    const checkUser = await User.findOne({ email });
    if (checkUser)
      return res.json({
        success: false,
        message: "User Already exists with the same email! Please try again",
      });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    // Set token expiration to 24 hours from now
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
      isVerified: false,
      verificationToken,
      verificationTokenExpires
    });

    await newUser.save();
    console.log("User created successfully:", { id: newUser._id, email });

    // Send verification email
    try {
      await sendVerificationEmail(newUser);
      res.status(200).json({
        success: true,
        message: "Registration successful! Please check your email to verify your account.",
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Still return success as the user was created, but include warning about email
      res.status(200).json({
        success: true,
        message: "Registration successful! We couldn't send the verification email due to a temporary issue. Please contact support to verify your account.",
        emailSent: false
      });
    }
  } catch (e) {
    console.log("Registration error:", e);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again later.",
    });
  }
};

//login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });

    // Check if the user's email is verified
    if (!checkUser.isVerified) {
      return res.json({
        success: false,
        message: "Please verify your email address before logging in.",
      });
    }

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch)
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });

    // Generate access token - shorter lived
    const accessToken = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "120m" } // Increased from 60m to 120m
    );

    // Generate refresh token - longer lived
    const refreshToken = jwt.sign(
      {
        id: checkUser._id,
      },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Set both tokens as cookies
    res.json({
      success: true,
      message: "Logged in successfully",
      accessToken,
      refreshToken,
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//logout
const logoutUser = (req, res) => {
  res.clearCookie("token")
     .clearCookie("refreshToken")
     .json({
       success: true,
       message: "Logged out successfully!",
     });
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    // Get token from Authorization header or cookies
    const authHeader = req.headers['authorization'];
    const refreshToken = authHeader && authHeader.split(' ')[1] || req.cookies.refreshToken;
    
    console.log('Refresh token request received, token exists:', !!refreshToken);
    
    if (!refreshToken) {
      console.log('No refresh token found in Authorization header or cookies');
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }
    
    // Verify the refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
      console.log('Refresh token verified successfully for user ID:', decoded.id);
    } catch (verifyError) {
      console.error('Refresh token verification failed:', verifyError.message);
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token: " + verifyError.message,
      });
    }
    
    // Find the user
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('User not found for ID:', decoded.id);
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    
    // Generate a new access token
    const accessToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        userName: user.userName,
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "120m" }
    );
    
    console.log('New access token generated for user:', user.email);
    
    // Return new access token in response body
    res.json({
      success: true,
      message: "Token refreshed successfully",
      accessToken,
      user: {
        email: user.email,
        role: user.role,
        id: user._id,
        userName: user.userName,
      },
    });
  } catch (error) {
    console.error('Error in refreshToken:', error);
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token: " + (error.message || "Unknown error"),
    });
  }
};

//auth middleware
const authMiddleware = async (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1] || req.cookies.token;
  
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  const { token } = req.params;
  
  try {
    // Find user with the given verification token
    const user = await User.findOne({ 
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() } // Check if token hasn't expired
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Update user to verified and clear verification token
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while verifying your email",
    });
  }
};

// Resend verification email
const resendVerification = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User with this email doesn't exist",
      });
    }
    
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "This email is already verified",
      });
    }
    
    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    // Set token expiration to 24 hours from now
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();
    
    // Send verification email
    await sendVerificationEmail(user);
    
    res.status(200).json({
      success: true,
      message: "Verification email resent successfully",
    });
  } catch (error) {
    console.error("Error resending verification email:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while resending verification email",
    });
  }
};

// Test verification endpoint (for testing only, not for production)
const testVerifyEmail = async (req, res) => {
  const { token } = req.params;
  
  // Log the request details
  console.log('Test verification endpoint called:');
  console.log(`- Token: ${token}`);
  console.log(`- Headers: ${JSON.stringify(req.headers)}`);
  
  // For testing: token "success" will return success, any other token returns error
  if (token === 'success') {
    console.log('Test verification: Returning success');
    res.status(200).json({
      success: true,
      message: "Test email verified successfully. You can now log in.",
    });
  } else if (token === 'error') {
    console.log('Test verification: Returning error');
    res.status(400).json({
      success: false,
      message: "Test verification failed: Invalid or expired verification token",
    });
  } else {
    // Echo the token back
    console.log('Test verification: Echoing token');
    res.status(200).json({
      success: true,
      message: "Test email verified successfully. You can now log in.",
      token: token
    });
  }
};

// Export the basic functions without the constants to avoid circular dependencies
module.exports = { 
  registerUser, 
  loginUser, 
  logoutUser, 
  refreshToken,
  authMiddleware,
  verifyEmail,
  resendVerification,
  testVerifyEmail
};
