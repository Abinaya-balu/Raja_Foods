import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "../../store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { motion } from "framer-motion";

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction == "plus") {
      let getCartItems = cartItems.items || [];

      if (getCartItems.length) {
        const indexOfCurrentCartItem = getCartItems.findIndex(
          (item) => item.productId === getCartItem?.productId
        );

        const getCurrentProductIndex = productList.findIndex(
          (product) => product._id === getCartItem?.productId
        );
        
        if (getCurrentProductIndex === -1) {
          toast({
            title: "Product not found in inventory",
            variant: "destructive",
          });
          return;
        }
        
        const getTotalStock = productList[getCurrentProductIndex].totalStock;

        if (indexOfCurrentCartItem > -1) {
          const getQuantity = getCartItems[indexOfCurrentCartItem].quantity;
          if (getQuantity + 1 > getTotalStock) {
            toast({
              title: `Only ${getQuantity} quantity can be added for this item`,
              variant: "destructive",
            });

            return;
          }
        }
      }
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.productId,
        quantity:
          typeOfAction === "plus"
            ? getCartItem?.quantity + 1
            : getCartItem?.quantity - 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item updated successfully",
        });
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({ userId: user?.id, productId: getCartItem?.productId })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Item removed from cart",
        });
      }
    });
  }

  // Calculate the price
  const itemPrice = cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price;
  const totalPrice = itemPrice * cartItem?.quantity;

  return (
    <div className="p-3 rounded-lg border border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
      <div className="flex gap-3">
        {/* Product image */}
        <div className="relative w-20 h-20 overflow-hidden rounded-md">
      <img
        src={cartItem?.image}
        alt={cartItem?.title}
            className="w-full h-full object-cover"
      />
          {cartItem?.salePrice > 0 && (
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs px-1 py-0.5 rounded-bl">
              Sale
            </div>
          )}
        </div>
        
        {/* Product info */}
      <div className="flex-1">
          <div className="flex justify-between">
            <h3 className="font-semibold text-gray-800 line-clamp-1">{cartItem?.title}</h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleCartItemDelete(cartItem)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash className="w-4 h-4" />
            </motion.button>
          </div>
          
          {/* Price and sale price */}
        <div className="flex items-center gap-2 mt-1">
            <span className="font-medium text-teal-700">
              ₹{itemPrice.toFixed(2)}
            </span>
            {cartItem?.salePrice > 0 && cartItem?.price > cartItem?.salePrice && (
              <span className="text-xs text-gray-500 line-through">
                ₹{cartItem?.price.toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Quantity controls and total */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
              <motion.button
                whileTap={{ scale: 0.9 }}
            disabled={cartItem?.quantity === 1}
            onClick={() => handleUpdateQuantity(cartItem, "minus")}
                className={`px-2 py-1 ${cartItem?.quantity === 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
          >
                <Minus className="w-3 h-3" />
              </motion.button>
              <span className="px-3 font-medium text-sm">{cartItem?.quantity}</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
            onClick={() => handleUpdateQuantity(cartItem, "plus")}
                className="px-2 py-1 text-gray-600 hover:bg-gray-100"
          >
                <Plus className="w-3 h-3" />
              </motion.button>
            </div>
            
            <span className="font-bold text-teal-800">
              ₹{totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserCartItemsContent;
