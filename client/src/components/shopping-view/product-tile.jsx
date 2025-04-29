import { ShoppingCart, Star, Heart } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { motion } from "framer-motion";
import { brandOptionsMap, categoryOptionsMap } from "@/config";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
  handleAddToWishlist,
  isInWishlist = false,
  isLoggedIn = false,
}) {
  // Compact star rating display specifically for product tiles
  const renderCompactStarRating = (rating) => {
    const ratingValue = rating || 0;
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={10}
            className={`${
              star <= ratingValue
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-200"
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-500">
          {ratingValue > 0 ? `(${ratingValue.toFixed(1)})` : "(No ratings)"}
        </span>
      </div>
    );
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col w-full h-full min-h-[380px]"
    >
      {/* Product image with overlay */}
      <div 
        className="relative h-[180px] overflow-hidden cursor-pointer" 
        onClick={() => handleGetProductDetails(product?._id)}
      >
        <img
          src={product?.image}
          alt={product?.title}
          className="h-full w-full object-contain object-center p-1 transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
        
        {/* Badges */}
        <div className="absolute top-1 left-1 flex flex-col gap-1">
          {product?.totalStock < 5 && product?.totalStock > 0 && (
            <Badge className="bg-amber-500 text-xs px-1.5 py-0.5 text-[10px]">
              {`Only ${product?.totalStock} left`}
            </Badge>
          )}
          {product?.totalStock === 0 && (
            <Badge className="bg-red-500 text-xs px-1.5 py-0.5 text-[10px]">Out of Stock</Badge>
          )}
          {product?.salePrice > 0 && (
            <Badge className="bg-emerald-500 text-xs px-1.5 py-0.5 text-[10px]">
              {Math.round(((product?.price - product?.salePrice) / product?.price) * 100)}% OFF
            </Badge>
          )}
        </div>
        
        {/* Wishlist button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 w-7 h-7 bg-white/80 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            if (isLoggedIn) {
              handleAddToWishlist(product?._id);
            }
          }}
          disabled={!isLoggedIn}
        >
          <Heart className={`h-full w-full ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
        </Button>
      </div>

      {/* Product info */}
      <div className="flex-1 flex flex-col px-2 py-3 justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full truncate max-w-[60%]">
              {categoryOptionsMap[product?.category] || "Product"}
            </span>
          </div>
          
          <h3 
            className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-teal-700 cursor-pointer mb-1"
            onClick={() => handleGetProductDetails(product?._id)}
          >
            {product?.title}
          </h3>
          
          {/* Star Rating */}
          <div className="mb-1">
            {renderCompactStarRating(product?.averageReview)}
          </div>
          
          <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">
            {product?.description}
          </p>
        </div>
        
        <div className="mt-auto">
          {/* Price display */}
          <div className="flex items-center gap-2 mb-2">
            <p
              className={`font-bold ${
                product?.salePrice > 0 ? "text-gray-400 line-through text-xs" : "text-teal-700 text-sm"
              }`}
            >
              ₹{product?.price}
            </p>
            {product?.salePrice > 0 && (
              <p className="font-bold text-sm text-teal-700">₹{product?.salePrice}</p>
            )}
          </div>
          
          {/* Action button */}
          <Button
            onClick={() => handleAddtoCart(product?._id)}
            disabled={product?.totalStock === 0}
            size="sm"
            className={`w-full gap-1 py-1 text-xs ${
              product?.totalStock === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-teal-600 hover:bg-teal-700 group-hover:shadow-md"
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>{product?.totalStock === 0 ? "Out of Stock" : "Add to Cart"}</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default ShoppingProductTile;
