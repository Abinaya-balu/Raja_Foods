import { useSelector } from "react-redux";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

function OrderSummary() {
  const { cartItems } = useSelector((state) => state.shopCart);

  if (!cartItems || !cartItems.items || cartItems.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg border border-gray-100">
        <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-xl font-medium text-gray-600 mb-2">Your cart is empty</p>
        <p className="text-sm text-gray-500 text-center">
          Add some products to proceed with checkout
        </p>
      </div>
    );
  }

  const tableItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      }
    })
  };

  return (
    <div className="w-full overflow-hidden border border-gray-100 rounded-lg shadow-sm">
      <Table>
        <TableHeader className="bg-teal-50">
          <TableRow className="hover:bg-teal-50">
            <TableHead className="font-medium text-teal-700">Product</TableHead>
            <TableHead className="text-right font-medium text-teal-700">Quantity</TableHead>
            <TableHead className="text-right font-medium text-teal-700">Price</TableHead>
            <TableHead className="text-right font-medium text-teal-700">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cartItems.items.map((item, index) => (
            <motion.tr
              key={item.productId}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={tableItemVariants}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <TableCell className="font-medium py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 rounded overflow-hidden bg-gray-100 shrink-0">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                      className="h-full w-full object-cover"
                  />
                  </div>
                  <span className="text-sm md:text-base line-clamp-2 text-gray-800">{item.title}</span>
                </div>
              </TableCell>
              <TableCell className="text-right text-gray-700">{item.quantity}</TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end">
                  <span className="font-medium text-gray-900">
                ₹{(item.salePrice > 0 ? item.salePrice : item.price).toFixed(2)}
                  </span>
                  {item.salePrice > 0 && (
                    <span className="text-xs text-gray-500 line-through">
                      ₹{item.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right font-bold text-teal-700">
                ₹{((item.salePrice > 0 ? item.salePrice : item.price) * item.quantity).toFixed(2)}
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default OrderSummary; 