const express = require("express");

const {
  handleImageUpload,
  addProduct,
  editProduct,
  fetchAllProducts,
  deleteProduct,
} = require("../../controllers/admin/products-controller");

const { upload } = require("../../helpers/cloudinary");
const { sendNewProductNotification } = require("../../helpers/email");
const User = require("../../models/User");
const Product = require("../../models/Product");

const router = express.Router();

router.post("/upload-image", upload.single("my_file"), handleImageUpload);
router.post("/add", addProduct);
router.put("/edit/:id", editProduct);
router.delete("/delete/:id", deleteProduct);
router.get("/get", fetchAllProducts);

// Test route for sending product notifications
router.post("/test-notification/:productId", async (req, res) => {
  try {
    console.log(`Starting test notification for product ID: ${req.params.productId}`);
    const { productId } = req.params;
    
    // Get the product
    const product = await Product.findById(productId);
    if (!product) {
      console.log(`Product not found with ID: ${productId}`);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    console.log(`Found product: ${product.title}`);
    
    // Get all users or specific test users
    const query = req.query.testEmail ? { email: req.query.testEmail } : {};
    if (req.query.testEmail) {
      console.log(`Testing with specific email: ${req.query.testEmail}`);
    } else {
      console.log('Testing with all registered users');
    }
    
    const users = await User.find(query, 'email userName');
    
    if (users.length === 0) {
      console.log('No users found matching the criteria');
      return res.status(404).json({
        success: false,
        message: "No users found to send notifications",
      });
    }
    console.log(`Found ${users.length} users to send notifications to`);
    
    // Send notifications
    console.log('Sending notifications...');
    const result = await sendNewProductNotification(users, product);
    
    if (result) {
      console.log('Notifications sent successfully');
      res.status(200).json({
        success: true,
        message: `Notification sent to ${users.length} users about product: ${product.title}`,
      });
    } else {
      console.log('Failed to send notifications');
      res.status(500).json({
        success: false,
        message: "Failed to send notifications - check server logs for details",
      });
    }
  } catch (error) {
    console.error('Error in test notification:', error);
    res.status(500).json({
      success: false,
      message: "Error occurred while sending test notification",
      error: error.message,
    });
  }
});

module.exports = router;
