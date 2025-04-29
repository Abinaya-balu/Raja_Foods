const Wishlist = require("../../models/wishlist");
const Product = require("../../models/Product");

// Get a user's wishlist
const getUserWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      // If no wishlist exists, create an empty one
      wishlist = new Wishlist({ userId, products: [] });
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
    });
  }
};

// Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required",
      });
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Find the user's wishlist or create a new one
    let wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [] });
    }

    // Check if the product is already in the wishlist
    const existingProduct = wishlist.products.find(
      (item) => item.productId.toString() === productId
    );

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    // Add product to wishlist
    wishlist.products.push({
      productId,
      title: product.title,
      image: product.image,
      price: product.price,
      salePrice: product.salePrice,
      category: product.category,
      brand: product.brand,
      addedAt: new Date(),
    });

    await wishlist.save();

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      data: wishlist,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist",
    });
  }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required",
      });
    }

    // Find the user's wishlist
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    // Filter out the product to be removed
    const initialLength = wishlist.products.length;
    wishlist.products = wishlist.products.filter(
      (item) => item.productId.toString() !== productId
    );

    // Check if the product was actually in the wishlist
    if (wishlist.products.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      data: wishlist,
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist",
    });
  }
};

// Clear the entire wishlist
const clearWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Find the user's wishlist
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    // Clear all products
    wishlist.products = [];
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      data: wishlist,
    });
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear wishlist",
    });
  }
};

module.exports = {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
}; 