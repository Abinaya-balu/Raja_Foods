import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWishlist, removeFromWishlist, clearWishlist } from "../../store/shop/wishlist-slice";
import { addToCart, fetchCartItems } from "../../store/shop/cart-slice";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useToast } from "../ui/use-toast";
import { ShoppingCart, Trash2, X, AlertCircle } from "lucide-react";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";

function ShoppingWishlist() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  
  const { user } = useSelector((state) => state.auth);
  const { wishlist, isLoading, error } = useSelector((state) => state.shopWishlist);
  const { cartItems } = useSelector((state) => state.shopCart);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchWishlist(user.id));
    }
  }, [dispatch, user]);

  const handleAddToCart = (productId, title) => {
    // Check if the product is already in the cart
    const existingItem = cartItems?.items?.find(item => item.productId === productId);
    
    dispatch(
      addToCart({
        userId: user?.id,
        productId: productId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: existingItem 
            ? `${title} quantity increased in cart` 
            : `${title} added to cart`,
        });
      }
    });
  };

  const handleRemoveFromWishlist = (productId, title) => {
    dispatch(
      removeFromWishlist({
        userId: user?.id,
        productId: productId,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: `${title} removed from wishlist`,
        });
      }
    });
  };

  const handleClearWishlist = () => {
    dispatch(clearWishlist(user?.id)).then((data) => {
      if (data?.payload?.success) {
        setConfirmClearOpen(false);
        toast({
          title: "Wishlist cleared successfully",
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-2" />
        <h3 className="text-lg font-medium">Unable to load wishlist</h3>
        <p className="text-muted-foreground">{error.message || "Please try again later"}</p>
      </div>
    );
  }

  if (!wishlist || wishlist.products?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 mb-4 text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-1">Your wishlist is empty</h3>
        <p className="text-muted-foreground max-w-sm">
          Browse our products and click the heart icon to add items to your wishlist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">My Wishlist ({wishlist.products.length} items)</h2>
        <Button 
          variant="outline" 
          onClick={() => setConfirmClearOpen(true)}
          disabled={!wishlist.products.length}
        >
          Clear Wishlist
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlist.products.map((item) => (
          <Card key={item.productId} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col h-full">
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                    onClick={() => handleRemoveFromWishlist(item.productId, item.title)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg mb-1 line-clamp-2">{item.title}</h3>
                    <div className="flex items-baseline gap-2 mb-2">
                      {item.salePrice > 0 && (
                        <span className="text-muted-foreground line-through text-sm">
                          ₹{item.price}
                        </span>
                      )}
                      <span className="text-lg font-bold text-primary">
                        ₹{item.salePrice > 0 ? item.salePrice : item.price}
                      </span>
                      {item.salePrice > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          Save {Math.round(((item.price - item.salePrice) / item.price) * 100)}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Added on {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => handleAddToCart(item.productId, item.title)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirm Clear Dialog */}
      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Wishlist</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove all items from your wishlist? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmClearOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearWishlist}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear Wishlist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ShoppingWishlist; 