import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { ShoppingBag, Calendar, CreditCard, TruckIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);

  if (!orderDetails) {
    return (
      <DialogContent className="sm:max-w-[600px]">
        <div className="py-8 text-center">
          <p>Order details could not be loaded</p>
        </div>
      </DialogContent>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString.split('T')[0] || 'N/A';
    }
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogTitle className="flex items-center gap-2 text-xl font-bold mb-4">
        <ShoppingBag className="h-5 w-5" />
        Order Details
      </DialogTitle>
      
      <div className="grid gap-6">
        <div className="grid gap-2">
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Order ID
            </p>
            <Label className="text-sm font-medium">{orderDetails?._id}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Order Date
            </p>
            <Label>{formatDate(orderDetails?.orderDate)}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Total Amount
            </p>
            <Label>₹{orderDetails?.totalAmount?.toFixed(2) || '0.00'}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment Method</p>
            <Label className="capitalize">{orderDetails?.paymentMethod || 'N/A'}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment Status</p>
            <Label className="capitalize">{orderDetails?.paymentStatus || 'pending'}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium flex items-center gap-2">
              <TruckIcon className="h-4 w-4" /> Order Status
            </p>
            <Label>
              <Badge
                className={`py-1 px-3 ${
                  orderDetails?.orderStatus === "confirmed"
                    ? "bg-green-500"
                    : orderDetails?.orderStatus === "rejected"
                    ? "bg-red-600"
                    : orderDetails?.orderStatus === "pending"
                    ? "bg-yellow-500"
                    : "bg-black"
                }`}
              >
                {orderDetails?.orderStatus || 'Processing'}
              </Badge>
            </Label>
          </div>
        </div>
        
        <Separator />
        
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium mb-2">Order Items</div>
            {orderDetails?.cartItems && orderDetails?.cartItems.length > 0 ? (
              <div className="overflow-x-auto max-h-48">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderDetails.cartItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            {item.image && (
                              <img 
                                src={item.image} 
                                alt={item.title} 
                                className="h-8 w-8 rounded object-cover" 
                              />
                            )}
                            <span className="text-sm line-clamp-1">{item.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">₹{parseFloat(item.price).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No items in this order</p>
            )}
          </div>
        </div>
        
        <Separator />
        
        <div className="grid gap-2">
          <div className="font-medium mb-1">Shipping Information</div>
          <div className="grid gap-1 text-sm text-muted-foreground p-3 bg-gray-50 rounded-md">
            <span className="font-medium">{user?.userName || user?.name || 'Customer'}</span>
            <span>{orderDetails?.addressInfo?.address || 'N/A'}</span>
            <span>
              {orderDetails?.addressInfo?.city}
              {orderDetails?.addressInfo?.pincode ? `, ${orderDetails.addressInfo.pincode}` : ''}
            </span>
            <span>Phone: {orderDetails?.addressInfo?.phone || 'N/A'}</span>
            {orderDetails?.addressInfo?.notes && (
              <span className="italic mt-2">Notes: {orderDetails.addressInfo.notes}</span>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
