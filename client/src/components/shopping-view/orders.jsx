import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import ShoppingOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "../../store/shop/order-slice";
import { Badge } from "../ui/badge";
import { AlertTriangle, Loader2, ShoppingBag } from "lucide-react";
import { useToast } from "../../components/ui/use-toast";
import { LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails, isLoading } = useSelector((state) => state.shopOrder);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Debug user information
  useEffect(() => {
    console.log("Current user data:", user);
    console.log("User ID type:", typeof user?.id);
    console.log("User ID value:", user?.id);
  }, [user]);

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetails(getId));
  }

  function handleManualRefresh() {
    if (user?.id) {
      setFetchError(null);
      console.log("Manually refreshing orders for user ID:", user.id);
      dispatch(getAllOrdersByUserId(user.id))
        .then(result => {
          console.log("Order refresh result:", result);
          if (result.error) {
            setFetchError(result.error.message || "Failed to load orders");
            toast({
              title: "Failed to refresh orders",
              description: result.error.message || "Unable to load your orders. Please try again.",
              variant: "destructive",
            });
          } else if (!result.payload?.data?.length) {
            console.log("No orders found in refresh");
          } else {
            console.log(`Found ${result.payload.data.length} orders`);
            toast({
              title: "Orders refreshed",
              description: `Found ${result.payload.data.length} orders in your history.`
            });
          }
        })
        .catch(error => {
          console.error("Error in order refresh:", error);
          setFetchError(error.message || "Failed to load orders");
          toast({
            title: "Error refreshing orders",
            description: error.message || "An error occurred. Please try again.",
            variant: "destructive",
          });
        });
    }
  }

  useEffect(() => {
    // Only attempt to fetch orders when we have a valid user ID
    if (user?.id) {
      console.log("Attempting to fetch orders for user ID:", user.id);
      dispatch(getAllOrdersByUserId(user.id))
        .then(result => {
          console.log("Order fetch result:", result);
          setFetchAttempted(true);
          if (result.error) {
            console.error("Error in order fetch result:", result.error);
            setFetchError(result.error.message || "Failed to load orders");
          } else if (!result.payload?.data?.length) {
            console.log("No orders found in initial load");
          } else {
            console.log(`Found ${result.payload.data.length} orders`);
          }
        })
        .catch(error => {
          console.error("Error in order fetch:", error);
          setFetchAttempted(true);
          setFetchError(error.message || "Failed to load orders");
        });
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  // Debug output
  useEffect(() => {
    if (fetchAttempted) {
      console.log("Orders fetch completed. Results:", { 
        orderListLength: orderList?.length || 0, 
        orders: orderList,
        error: fetchError
      });
    }
  }, [fetchAttempted, orderList, fetchError]);

  // Filter orders to ensure they belong to the current user
  const filteredOrderList = orderList && orderList.length > 0 
    ? orderList.filter(order => order.userId === user?.id)
    : [];

  // Log filtering results for debugging
  useEffect(() => {
    if (orderList && orderList.length > 0) {
      console.log("Orders before filtering:", orderList.length);
      console.log("Orders after filtering for current user:", filteredOrderList.length);
      
      if (orderList.length !== filteredOrderList.length) {
        console.warn("Some orders don't match the current user ID!");
        console.log("First non-matching order:", 
          orderList.find(order => order.userId !== user?.id));
      }
    }
  }, [orderList, filteredOrderList, user?.id]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Order History
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleManualRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Refreshing...
            </>
          ) : "Refresh Orders"}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <p>Loading your orders...</p>
          </div>
        ) : fetchError ? (
          <div className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-3" />
            <p className="text-lg text-red-500">Failed to load orders</p>
            <p className="text-sm text-gray-500 mt-1">{fetchError}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleManualRefresh}
            >
              Try Again
            </Button>
          </div>
        ) : filteredOrderList.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrderList.map((orderItem) => (
                  <TableRow key={orderItem?._id}>
                    <TableCell className="font-medium">{orderItem?._id?.substring(0, 8)}...</TableCell>
                    <TableCell>{orderItem?.orderDate ? new Date(orderItem.orderDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <span
                        className={`py-1 px-3 ${
                          orderItem?.orderStatus === "delivered"
                            ? "bg-green-100 text-green-800"
                            : orderItem?.orderStatus === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : orderItem?.orderStatus === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        } rounded-full text-xs`}
                      >
                        {orderItem?.orderStatus?.charAt(0).toUpperCase() +
                          orderItem?.orderStatus?.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`py-1 px-3 ${
                          orderItem?.paymentStatus === "completed"
                            ? "bg-green-100 text-green-800"
                            : orderItem?.paymentStatus === "failed"
                            ? "bg-red-100 text-red-800"
                            : orderItem?.paymentStatus === "refunded"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-amber-100 text-amber-800"
                        } rounded-full text-xs`}
                      >
                        {orderItem?.paymentStatus?.charAt(0).toUpperCase() +
                          orderItem?.paymentStatus?.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">₹{orderItem?.totalAmount ? orderItem.totalAmount.toFixed(2) : '0.00'}</TableCell>
                    <TableCell className="flex gap-2">
                      <LinkIcon
                        className="h-4 w-4 cursor-pointer"
                        onClick={() => navigate(`/shop/orders/${orderItem._id}`)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-lg text-gray-500">You have no orders yet</p>
            <p className="text-sm text-gray-400 mt-1">
              {fetchAttempted ? 
                "Your order history is empty. Start shopping to place an order." :
                user?.id ? 
                  "Loading your order history..." :
                  "Please log in to view your orders."
              }
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.href = '/shop'}
            >
              Continue Shopping
            </Button>
          </div>
        )}

        <Dialog
          open={openDetailsDialog}
          onOpenChange={(open) => {
            setOpenDetailsDialog(open);
            if (!open) dispatch(resetOrderDetails());
          }}
        >
          <ShoppingOrderDetailsView orderDetails={orderDetails} />
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default ShoppingOrders;
