import { StarIcon, ThumbsUp, MessageSquare, User, Heart, ShoppingCart } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "../../store/shop/cart-slice";
import { addToWishlist, fetchWishlist } from "../../store/shop/wishlist-slice";
import { useToast } from "../ui/use-toast";
import { setProductDetails } from "../../store/shop/products-slice";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/star-rating";
import { useEffect, useState } from "react";
import { addReview, getReviews } from "../../store/shop/review-slice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";

function CompactStarRating({ rating, size = "md" }) {
  const starSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };
  
  const starSize = starSizes[size] || starSizes.md;
  
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`${starSize} ${
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
          }`}
        />
      ))}
      <span className="ml-1.5 text-sm font-medium">
        {rating > 0 ? rating.toFixed(1) : "No ratings"}
      </span>
    </div>
  );
}

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [activeTab, setActiveTab] = useState("product");
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const { wishlist } = useSelector((state) => state.shopWishlist);

  const { toast } = useToast();

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });

          return;
        }
      }
    }
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  function handleAddToWishlist(productId) {
    if (!user?.id) {
      toast({
        title: "Please log in to add items to your wishlist",
        variant: "destructive",
      });
      return;
    }

    // Check if the product is already in the wishlist
    const isInWishlist = wishlist?.products?.some(
      (item) => item.productId === productId
    );

    if (isInWishlist) {
      toast({
        title: "This item is already in your wishlist",
      });
      return;
    }

    dispatch(
      addToWishlist({
        userId: user?.id,
        productId: productId,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchWishlist(user?.id));
        toast({
          title: "Product added to wishlist",
        });
      }
    });
  }

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
  }

  function handleAddReview() {
    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data.type.endsWith('/fulfilled')) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({
          title: "Review added successfully!",
        });
      } else if (data.type.endsWith('/rejected')) {
        toast({
          title: "Unable to add review",
          description: data.payload?.message || "You can only review products you have purchased.",
          variant: "destructive",
        });
      }
    });
  }

  useEffect(() => {
    if (productDetails !== null && productDetails?._id) {
      dispatch(getReviews(productDetails._id));
    }
  }, [productDetails, dispatch]);

  const averageReview =
    reviews && Array.isArray(reviews) && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + (reviewItem?.reviewValue || 0), 0) /
        reviews.length
      : 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid md:grid-cols-2 gap-6 p-4 sm:p-6 md:p-8 max-w-[95vw] sm:max-w-[85vw] md:max-w-[75vw]">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
          <img
            src={productDetails?.image}
            alt={productDetails?.title}
            width={600}
            height={600}
            className="aspect-square w-full object-contain p-2"
          />
        </div>
        
        {/* Product Info */}
        <div className="flex flex-col h-full">
          <Tabs defaultValue="product" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-800 leading-tight">{productDetails?.title}</h1>
                <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                  <CompactStarRating rating={averageReview} />
                  <Badge variant="outline" className="ml-1 bg-teal-50 text-teal-700 border-teal-200 text-xs">
                    {reviews?.length || 0} reviews
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-baseline gap-2">
                  {productDetails?.salePrice > 0 && (
                    <p className="text-lg font-bold text-gray-400 line-through">
                      ₹{productDetails?.price}
                    </p>
                  )}
                  <p className="text-2xl font-bold text-teal-700">
                    ₹{productDetails?.salePrice > 0 ? productDetails?.salePrice : productDetails?.price}
                  </p>
                </div>
                {productDetails?.totalStock > 0 ? (
                  <Badge className="bg-green-100 text-green-800 font-medium">In Stock</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 font-medium">Out of Stock</Badge>
                )}
              </div>
            </div>
            
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="product">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  Product Details
                </span>
              </TabsTrigger>
              <TabsTrigger value="reviews">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  Reviews ({reviews?.length || 0})
                </span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="product" className="flex-1 space-y-4">
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">Description</h2>
                <p className="text-gray-700">
                  {productDetails?.description}
                </p>
              </div>
              
              <Separator />
              
              {/* Additional product details could go here */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">Category</h2>
                  <p className="text-gray-700">{productDetails?.category || "N/A"}</p>
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">Product Type</h2>
                  <p className="text-gray-700">{productDetails?.brand || "N/A"}</p>
                </div>
              </div>
              
              <div className="mt-auto pt-4">
                <div className="grid grid-cols-5 gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    className="col-span-1"
                    onClick={() => handleAddToWishlist(productDetails?._id)}
                    disabled={!user}
                  >
                    <Heart className={`h-5 w-5 ${
                      wishlist?.products?.some(item => item.productId === productDetails?._id)
                        ? "fill-red-500 text-red-500" 
                        : ""
                    }`} />
                  </Button>
                  <Button
                    className="col-span-4"
                    size="lg"
                    disabled={productDetails?.totalStock === 0}
                    onClick={() =>
                      handleAddToCart(
                        productDetails?._id,
                        productDetails?.totalStock
                      )
                    }
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {productDetails?.totalStock === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="flex-1 flex flex-col">
              <div className="flex-1 overflow-auto pr-2" style={{ maxHeight: "400px" }}>
                <div className="space-y-4">
                  {Array.isArray(reviews) && reviews.length > 0 ? (
                    reviews.map((reviewItem, index) => (
                      <div 
                        key={reviewItem?._id || index} 
                        className="border border-gray-100 rounded-lg p-3 bg-gray-50"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="w-8 h-8 border">
                            <AvatarFallback className="bg-teal-100 text-teal-700">
                              {reviewItem?.userName && reviewItem.userName[0] ? reviewItem.userName[0].toUpperCase() : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-sm">{reviewItem?.userName || 'Anonymous'}</h3>
                            <div className="flex items-center">
                              <CompactStarRating rating={reviewItem?.reviewValue || 0} size="sm" />
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {reviewItem?.reviewMessage || 'No comment'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <User className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">No reviews yet</p>
                      <p className="text-gray-400 text-sm">Be the first to review this product!</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-sm font-bold mb-2">Write a review</h3>
                <div className="space-y-3">
                  <div className="flex gap-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(star)}
                          className="p-1"
                        >
                          <StarIcon
                            className={`w-5 h-5 ${
                              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 self-center ml-2">
                      {rating > 0 ? `Your rating: ${rating}/5` : "Select a rating"}
                    </span>
                  </div>
                  
                  <Input
                    name="reviewMsg"
                    value={reviewMsg}
                    onChange={(event) => setReviewMsg(event.target.value)}
                    placeholder="Share your thoughts about this product..."
                    className="text-sm"
                  />
                  
                  {!user ? (
                    <p className="text-sm text-amber-600">Please log in to leave a review.</p>
                  ) : (
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        Note: You can only review products you have purchased.
                      </p>
                      <Button
                        onClick={handleAddReview}
                        disabled={reviewMsg.trim() === "" || rating === 0}
                        size="sm"
                      >
                        Submit Review
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
