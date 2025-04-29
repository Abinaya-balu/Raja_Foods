const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    products: [
      {
        productId: {
          type: String,
          required: true
        },
        title: String,
        image: String,
        price: Number,
        salePrice: Number,
        category: String,
        brand: String,
        addedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

// Create a compound index to ensure fast lookups
WishlistSchema.index({ userId: 1, "products.productId": 1 });

module.exports = mongoose.model("Wishlist", WishlistSchema); 