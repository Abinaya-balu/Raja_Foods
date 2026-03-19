// Load environment variables
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dns = require('dns');
const https = require('https');
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");

const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const shopWishlistRouter = require("./routes/shop/wishlist-routes");
const grindingBookingsRouter = require("./routes/shop/grinding-bookings-routes");

const commonFeatureRouter = require("./routes/common/feature-routes");

// Network connectivity diagnostics
function checkNetworkConnectivity() {
  console.log("Checking network connectivity...");
  
  // Check Gmail connectivity (for email services)
  dns.resolve('smtp.gmail.com', (err, addresses) => {
    if (err) {
      console.error('⚠️ DNS resolution failed for smtp.gmail.com:', err.message);
    } else {
      console.log('✅ DNS resolution successful for smtp.gmail.com:', addresses);
      
      // Try connecting to Gmail SMTP on both common ports
      const net = require('net');
      
      // Test port 465 (SSL)
      const socketSSL = net.createConnection(465, 'smtp.gmail.com');
      console.log('Testing connection to Gmail SMTP server on port 465 (SSL)...');
      
      socketSSL.on('connect', () => {
        console.log('✅ Successfully connected to Gmail SMTP server on port 465 (SSL)');
        socketSSL.end();
      });
      
      socketSSL.on('error', (err) => {
        console.error('⚠️ Failed to connect to Gmail SMTP server on port 465:', err.message);
      });
      
      socketSSL.setTimeout(4000, () => {
        console.error('⚠️ Connection timeout while connecting to Gmail SMTP server on port 465');
        socketSSL.destroy();
      });
      
      // Test port 587 (TLS)
      const socketTLS = net.createConnection(587, 'smtp.gmail.com');
      console.log('Testing connection to Gmail SMTP server on port 587 (TLS)...');
      
      socketTLS.on('connect', () => {
        console.log('✅ Successfully connected to Gmail SMTP server on port 587 (TLS)');
        socketTLS.end();
      });
      
      socketTLS.on('error', (err) => {
        console.error('⚠️ Failed to connect to Gmail SMTP server on port 587:', err.message);
      });
      
      socketTLS.setTimeout(4000, () => {
        console.error('⚠️ Connection timeout while connecting to Gmail SMTP server on port 587');
        socketTLS.destroy();
      });
    }
  });
  
  // Check Razorpay API connectivity
  dns.resolve('api.razorpay.com', (err, addresses) => {
    if (err) {
      console.error('⚠️ DNS resolution failed for api.razorpay.com:', err.message);
    } else {
      console.log('✅ DNS resolution successful for api.razorpay.com:', addresses);
      
      // Try making a request to Razorpay
      const req = https.request({
        hostname: 'api.razorpay.com',
        port: 443,
        path: '/',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        console.log(`✅ Razorpay API responded with status code: ${res.statusCode}`);
      });
      
      req.on('error', (err) => {
        console.error('⚠️ Failed to connect to Razorpay API:', err.message);
      });
      
      req.on('timeout', () => {
        console.error('⚠️ Connection timeout while connecting to Razorpay API');
        req.destroy();
      });
      
      req.end();
    }
  });
}

//create a database connection -> u can also
//create a separate file for this and then import/use that file here

mongoose
  .connect("mongodb+srv://thangamabi222:1223@cluster0.8htro.mongodb.net/")
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

// Run connectivity tests after database connection
checkNetworkConnectivity();

const app = express();
const PORT = process.env.PORT || 5000 ;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5175"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/shop/wishlist", shopWishlistRouter);
app.use("/api/bookings", grindingBookingsRouter);

app.use("/api/common/feature", commonFeatureRouter);

app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
