const Order = require("../../models/Order");
const Product = require("../../models/Product");
const ProductReview = require("../../models/Review");

// Add Product Review
const addProductReview = async (req, res) => {
  try {
    const { productId, userId, userName, reviewMessage, reviewValue } = req.body;

    // Validate required fields
    if (!productId || !userId || !userName || !reviewMessage || typeof reviewValue !== 'number') {
      return res.status(400).json({
        success: false,
        message: "All fields are required and reviewValue must be a number.",
      });
    }

    // Check if the user has already reviewed this product
    const checkExistingReview = await ProductReview.findOne({
      productId,
      userId,
    });

    if (checkExistingReview) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this product!",
      });
    }

    // Check if the user has ordered this product
    const userOrders = await Order.find({ 
      userId,
      orderStatus: { $in: ["confirmed", "delivered"] }, // Only consider confirmed or delivered orders
      paymentStatus: "paid" // Only consider paid orders
    });

    // Check if any of the user's orders contain the product
    const hasOrderedProduct = userOrders.some(order => 
      order.cartItems && order.cartItems.some(item => item.productId === productId)
    );

    if (!hasOrderedProduct) {
      return res.status(403).json({
        success: false,
        message: "You can only review products you have purchased.",
      });
    }

    // Create and save the new review
    const newReview = new ProductReview({
      productId,
      userId,
      userName,
      reviewMessage,
      reviewValue,
    });

    await newReview.save();

    // Update the product's average review
    const reviews = await ProductReview.find({ productId });
    const totalReviewsLength = reviews.length;
    const averageReview =
      reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
      totalReviewsLength;

    await Product.findByIdAndUpdate(productId, { averageReview });

    res.status(201).json({
      success: true,
      data: newReview,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error processing review submission. Please try again later.",
      error: e.message
    });
  }
};

// Get Product Reviews
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await ProductReview.find({ productId });
    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

// Get All Reviews (for admin reporting)
const getAllReviews = async (req, res) => {
  try {
    // Optional query parameter for filtering by rating
    const { minRating, maxRating } = req.query;
    
    let query = {};
    
    // Apply rating filters if provided
    if (minRating !== undefined || maxRating !== undefined) {
      query.reviewValue = {};
      if (minRating !== undefined) {
        query.reviewValue.$gte = parseInt(minRating);
      }
      if (maxRating !== undefined) {
        query.reviewValue.$lte = parseInt(maxRating);
      }
    }
    
    // Fetch reviews with optional filters
    const reviews = await ProductReview.find(query)
      .populate('productId', 'title')
      .sort({ createdAt: -1 });
      
    // Get product details for each review
    const reviewsWithProductDetails = await Promise.all(
      reviews.map(async (review) => {
        // If productId is just a string, try to get the product details
        if (typeof review.productId === 'string') {
          try {
            const product = await Product.findById(review.productId);
            return {
              ...review.toObject(),
              productTitle: product ? product.title : 'Unknown Product'
            };
          } catch (error) {
            return {
              ...review.toObject(),
              productTitle: 'Unknown Product'
            };
          }
        }
        
        return {
          ...review.toObject(),
          productTitle: review.productId ? review.productId.title : 'Unknown Product'
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: reviewsWithProductDetails,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error fetching all reviews",
    });
  }
};

module.exports = {
  addProductReview,
  getProductReviews,
  getAllReviews
};

