import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ShoppingCart } from "lucide-react";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();

  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  const handleCheckout = () => {
    navigate("/shop/checkout");
    setOpenCartSheet(false);
  };

  return (
    <SheetContent className="sm:max-w-md border-l border-teal-100 shadow-xl">
      <SheetHeader className="border-b border-teal-100 pb-4 mb-6">
        <SheetTitle className="flex items-center gap-2 text-teal-800">
          <ShoppingBag className="h-5 w-5" />
          <span>Your Cart</span>
        </SheetTitle>
      </SheetHeader>
      
      {cartItems && cartItems.length > 0 ? (
        <>
          <div className="overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
            <AnimatePresence>
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="mb-4"
                >
                  <UserCartItemsContent cartItem={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-teal-100 p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="font-bold text-teal-800 text-lg">₹{totalCartAmount.toFixed(2)}</span>
      </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => setOpenCartSheet(false)}
                className="border-teal-600 text-teal-600 hover:bg-teal-50"
              >
                Continue Shopping
              </Button>
              <Button
                onClick={handleCheckout}
                className="bg-teal-600 hover:bg-teal-700 gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Checkout</span>
              </Button>
        </div>
      </div>
        </>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-[70vh] text-center"
        >
          <ShoppingCart className="h-16 w-16 text-teal-200 mb-4" />
          <h3 className="text-lg font-medium text-teal-800 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-6">Add items to your cart to see them here</p>
      <Button
        onClick={() => {
              navigate("/shop/listing");
          setOpenCartSheet(false);
        }}
            className="bg-teal-600 hover:bg-teal-700"
      >
            Browse Products
      </Button>
        </motion.div>
      )}
    </SheetContent>
  );
}

export default UserCartWrapper;
