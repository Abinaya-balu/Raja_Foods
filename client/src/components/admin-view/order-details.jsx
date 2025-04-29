import { useEffect, useState } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  processRefund,
  resetRefundStatus,
  updatePaymentStatus
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";

const initialFormData = {
  status: "",
};

const initialPaymentFormData = {
  paymentStatus: "",
};

const initialRefundForm = {
  amount: "",
  notes: ""
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const [paymentFormData, setPaymentFormData] = useState(initialPaymentFormData);
  const [refundForm, setRefundForm] = useState(initialRefundForm);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { refundStatus, refundError, isRefunding, isUpdatingPayment } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();
  const { toast } = useToast();

  console.log(orderDetails, "orderDetailsorderDetails");

  // Check if order is eligible for refund
  const isRefundEligible = () => {
    if (!orderDetails) return false;
    
    // Only canceled/rejected orders can be refunded
    if (orderDetails.orderStatus !== 'rejected') return false;
    
    // Only orders with paid status can be refunded
    if (orderDetails.paymentStatus !== 'paid') return false;
    
    // Check if already refunded
    if (orderDetails.refundStatus === 'completed') return false;
    
    return true;
  };

  // Determine if order has a refund method
  const getRefundMethod = () => {
    if (!orderDetails) return null;
    
    if (orderDetails.paymentMethod === 'razorpay' && orderDetails.razorpayPaymentId) {
      return 'automatic'; // Automatic refund via Razorpay
    } else if (orderDetails.paymentMethod === 'paypal' && orderDetails.paymentId) {
      return 'automatic'; // Automatic refund via PayPal
    } else if (orderDetails.paymentMethod === 'cod' || orderDetails.paymentMethod === 'invoice') {
      return 'manual'; // Manual refund for COD/invoice
    }
    
    return null; // No refund method available
  };

  // Handle refund status updates
  useEffect(() => {
    if (refundStatus) {
      toast({
        title: refundStatus.message,
        description: refundStatus.refundId ? `Refund ID: ${refundStatus.refundId}` : "",
      });
      
      // Notify admin that customer has been notified
      if (refundStatus.success) {
        toast({
          title: "Customer Notification Sent",
          description: "An email notification about the refund has been sent to the customer.",
          duration: 5000,
        });
        
        // Refresh order details to show updated refund status
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setShowRefundForm(false);
        setRefundForm(initialRefundForm);
      }
      
      dispatch(resetRefundStatus());
    }
    
    if (refundError) {
      toast({
        title: "Refund Failed",
        description: refundError.message,
        variant: "destructive",
      });
      dispatch(resetRefundStatus());
    }
  }, [refundStatus, refundError, dispatch, toast, orderDetails?._id]);

  // Initialize forms with current values when orderDetails changes
  useEffect(() => {
    if (orderDetails) {
      // Set payment status form to current value
      setPaymentFormData({
        paymentStatus: orderDetails.paymentStatus || ""
      });
    }
  }, [orderDetails]);

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: status })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message,
        });
      }
    });
  }

  function handleUpdatePaymentStatus(event) {
    event.preventDefault();
    const { paymentStatus } = paymentFormData;
    
    // Prevent unnecessary API calls if status hasn't changed
    if (paymentStatus === orderDetails?.paymentStatus) {
      toast({
        title: "No change in payment status",
        description: "Please select a different status to update"
      });
      return;
    }

    dispatch(
      updatePaymentStatus({ id: orderDetails?._id, paymentStatus })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        toast({
          title: data?.payload?.message,
        });
      } else {
        toast({
          title: "Failed to update payment status",
          description: data?.error?.message || "An error occurred",
          variant: "destructive",
        });
      }
    });
  }

  function handleProcessRefund(event) {
    event.preventDefault();
    
    // Validate refund amount
    const amount = parseFloat(refundForm.amount);
    if (refundForm.amount && (isNaN(amount) || amount <= 0 || amount > orderDetails.totalAmount)) {
      toast({
        title: "Invalid refund amount",
        description: `Refund amount must be between 0 and ${orderDetails.totalAmount}`,
        variant: "destructive",
      });
      return;
    }
    
    // For manual refunds, provide additional context to the admin
    if (getRefundMethod() === 'manual') {
      toast({
        title: "Manual Refund Process",
        description: `This will record a manual refund in the system. Please ensure you've processed the actual refund through your payment process.`,
        duration: 5000,
      });
    }
    
    dispatch(
      processRefund({
        id: orderDetails?._id,
        refundAmount: amount || orderDetails.totalAmount,
        refundNotes: refundForm.notes || (getRefundMethod() === 'manual' ? `Manual ${orderDetails.paymentMethod} refund` : "")
      })
    );
  }

  return (
    <DialogContent className="sm:max-w-[650px] md:max-w-[700px] max-h-[85vh] overflow-y-auto p-4">
      <div className="grid gap-4">
        {/* Order Information Section */}
        <div className="overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2">Order Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="font-medium">Order ID:</p>
              <p className="text-gray-700 truncate">{orderDetails?._id}</p>
            </div>
            <div>
              <p className="font-medium">Order Date:</p>
              <p className="text-gray-700">{orderDetails?.orderDate ? new Date(orderDetails.orderDate).toLocaleString() : 'N/A'}</p>
            </div>
            <div>
              <p className="font-medium">Total Amount:</p>
              <p className="text-gray-700">₹{orderDetails?.totalAmount}</p>
            </div>
            <div>
              <p className="font-medium">Payment Method:</p>
              <p className="text-gray-700">{orderDetails?.paymentMethod}</p>
            </div>
            <div>
              <p className="font-medium">Payment Status:</p>
              <Badge
                className={`py-1 px-2 text-xs ${
                  orderDetails?.paymentStatus === "paid"
                    ? "bg-green-500"
                    : orderDetails?.paymentStatus === "failed"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              >
                {orderDetails?.paymentStatus}
              </Badge>
            </div>
            <div>
              <p className="font-medium">Order Status:</p>
              <Badge
                className={`py-1 px-2 text-xs ${
                  orderDetails?.orderStatus === "confirmed"
                    ? "bg-green-500"
                    : orderDetails?.orderStatus === "rejected"
                    ? "bg-red-600"
                    : "bg-black"
                }`}
              >
                {orderDetails?.orderStatus}
              </Badge>
            </div>
            
            {/* Refund Status (if applicable) */}
            {orderDetails?.refundStatus && orderDetails.refundStatus !== 'none' && (
              <>
                <div>
                  <p className="font-medium">Refund Status:</p>
                  <Badge
                    className={`py-1 px-2 text-xs ${
                      orderDetails?.refundStatus === "completed"
                        ? "bg-green-500"
                        : orderDetails?.refundStatus === "failed"
                        ? "bg-red-600"
                        : "bg-orange-500"
                    }`}
                  >
                    {orderDetails?.refundStatus}
                  </Badge>
                </div>
                
                {orderDetails?.refundStatus === 'completed' && (
                  <div>
                    <p className="font-medium">Refund Amount:</p>
                    <p className="text-gray-700">₹{orderDetails?.refundAmount || orderDetails?.totalAmount}</p>
                  </div>
                )}
                
                {orderDetails?.refundDate && (
                  <div className="col-span-2">
                    <p className="font-medium">Refund Date:</p>
                    <p className="text-gray-700">{new Date(orderDetails.refundDate).toLocaleString()}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* Order Items Section */}
        <div className="overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2">Order Items</h3>
          <div className="max-h-[30vh] overflow-y-auto border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left p-2">Image</th>
                  <th className="text-left p-2">Product</th>
                  <th className="text-left p-2">Product ID</th>
                  <th className="text-center p-2">Qty</th>
                  <th className="text-right p-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
                  ? orderDetails?.cartItems.map((item) => (
                      <tr key={item.productId} className="border-t hover:bg-gray-50">
                        <td className="p-2 w-16">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.title} 
                              className="w-14 h-14 object-cover rounded-md border"
                              onError={(e) => {
                                e.target.src = "https://res.cloudinary.com/darqhyvoy/image/upload/v1695835548/raja_oils/placeholder.png";
                                e.target.onerror = null;
                              }}
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                              <span className="text-xs">No image</span>
                            </div>
                          )}
                        </td>
                        <td className="p-2">
                          <div className="font-medium" style={{maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis"}} title={item.title}>
                            {item.title}
                          </div>
                        </td>
                        <td className="p-2">
                          <div 
                            className="text-xs text-gray-500" 
                            style={{maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis"}}
                            title={`Full ID: ${item.productId}`}
                          >
                            {item.productId}
                          </div>
                        </td>
                        <td className="text-center p-2">{item.quantity}</td>
                        <td className="text-right p-2">₹{item.price}</td>
                      </tr>
                    ))
                  : <tr><td colSpan="5" className="text-center p-4 text-gray-500">No items found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shipping Info Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Shipping Information</h3>
          <div className="border rounded-md p-3 bg-gray-50 text-sm">
            <p><span className="font-medium">Name:</span> {user.userName}</p>
            <p><span className="font-medium">Address:</span> {orderDetails?.addressInfo?.address}</p>
            <p><span className="font-medium">City:</span> {orderDetails?.addressInfo?.city}</p>
            <p><span className="font-medium">Pincode:</span> {orderDetails?.addressInfo?.pincode}</p>
            <p><span className="font-medium">Phone:</span> {orderDetails?.addressInfo?.phone}</p>
            {orderDetails?.addressInfo?.notes && (
              <p><span className="font-medium">Notes:</span> {orderDetails?.addressInfo?.notes}</p>
            )}
          </div>
        </div>

        {/* Order Status Update Form */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Update Order Status</h3>
          <CommonForm
            formControls={[
              {
                label: "Order Status",
                name: "status",
                componentType: "select",
                options: [
                  { id: "pending", label: "Pending" },
                  { id: "inProcess", label: "In Process" },
                  { id: "inShipping", label: "In Shipping" },
                  { id: "delivered", label: "Delivered" },
                  { id: "rejected", label: "Rejected" },
                ],
              },
            ]}
            formData={formData}
            setFormData={setFormData}
            buttonText={"Update Status"}
            onSubmit={handleUpdateStatus}
          />
        </div>
        
        {/* Payment Status Update Form */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Update Payment Status</h3>
          
          {/* Only show for COD and invoice orders */}
          {(orderDetails?.paymentMethod === "cod" || orderDetails?.paymentMethod === "invoice") ? (
            orderDetails?.refundStatus === "completed" ? (
              <div className="bg-gray-100 p-3 rounded-md text-sm">
                <p className="text-gray-700">Payment status cannot be modified for refunded orders.</p>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 p-3 rounded-md mb-3 text-sm">
                  <p className="font-medium text-gray-700">SRI RAJA FOOD PRODUCTS</p>
                  <p className="text-gray-500 mb-2">Invoice #{orderDetails?._id.substring(0, 8)}</p>
                </div>
                
                <CommonForm
                  formControls={[
                    {
                      label: "Payment Status",
                      name: "paymentStatus",
                      componentType: "select",
                      options: [
                        { id: "pending", label: "Pending" },
                        { id: "paid", label: "Paid" },
                        { id: "failed", label: "Failed" },
                      ],
                    },
                  ]}
                  formData={paymentFormData}
                  setFormData={setPaymentFormData}
                  buttonText={"Update Payment Status"}
                  isLoading={isUpdatingPayment}
                  onSubmit={handleUpdatePaymentStatus}
                  // Disable button for COD orders that are not yet delivered
                  isBtnDisabled={
                    orderDetails?.paymentMethod === "cod" &&
                    orderDetails?.orderStatus !== "delivered" &&
                    orderDetails?.paymentStatus !== "paid"
                  }
                />
                
                {/* Show helper text for COD orders */}
                {orderDetails?.paymentMethod === "cod" &&
                 orderDetails?.orderStatus !== "delivered" &&
                 orderDetails?.paymentStatus !== "paid" && (
                  <div className="mt-2 text-sm text-amber-600">
                    <p>For Cash on Delivery orders, payment status should only be changed to "Paid" after delivery.</p>
                  </div>
                )}
              </>
            )
          ) : (
            <div className="bg-gray-100 p-3 rounded-md text-sm">
              <p className="text-gray-700">
                Payment status is automatically updated for online payments.
              </p>
            </div>
          )}
        </div>
        
        {/* Refund Section */}
        {isRefundEligible() && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Refund Options</h3>
            <div className="bg-blue-50 p-3 rounded-md mb-3 text-sm">
              <p className="text-blue-800 font-medium">SRI RAJA FOOD PRODUCTS - Refund</p>
              <p className="text-blue-600">
                This order has been rejected and is eligible for a 
                {getRefundMethod() === 'automatic' ? ' gateway ' : ' manual '}
                refund.
              </p>
              {getRefundMethod() === 'manual' && (
                <p className="text-blue-600 mt-1">
                  <span className="font-medium">Note:</span> For {orderDetails.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Invoice'} orders, 
                  please ensure you have a refund process in place outside the system.
                </p>
              )}
            </div>
            
            {!showRefundForm ? (
              <Button 
                onClick={() => setShowRefundForm(true)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Process Refund
              </Button>
            ) : (
              <div className="border p-3 rounded-md">
                <h4 className="font-medium mb-2">
                  {getRefundMethod() === 'automatic' ? 'Process Gateway Refund' : 'Record Manual Refund'}
                </h4>
                <form onSubmit={handleProcessRefund}>
                  <div className="grid gap-3">
                    <div>
                      <Label htmlFor="refundAmount" className="text-sm">Refund Amount (optional)</Label>
                      <Input
                        id="refundAmount"
                        placeholder={`Max: ₹${orderDetails?.totalAmount}`}
                        value={refundForm.amount}
                        onChange={(e) => setRefundForm(prev => ({ ...prev, amount: e.target.value }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty to refund full amount</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="refundNotes" className="text-sm">Refund Notes (optional)</Label>
                      <Input
                        id="refundNotes"
                        placeholder="Reason for refund"
                        value={refundForm.notes}
                        onChange={(e) => setRefundForm(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowRefundForm(false);
                          setRefundForm(initialRefundForm);
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={isRefunding}
                      >
                        {isRefunding ? "Processing..." : getRefundMethod() === 'automatic' ? "Process Refund" : "Record Refund"}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
        
        {/* Order status update but not eligible for refund */}
        {orderDetails?.orderStatus === 'rejected' && 
         orderDetails?.paymentStatus === 'paid' && 
         orderDetails?.refundStatus === 'completed' && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Refund Information</h3>
            <div className="bg-green-50 p-3 rounded-md mb-3 text-sm">
              <p className="text-green-800 font-medium">SRI RAJA FOOD PRODUCTS - Refund Completed</p>
              <p className="text-green-600">
                A refund of ₹{orderDetails?.refundAmount || orderDetails?.totalAmount} was processed on 
                {' '}{orderDetails?.refundDate ? new Date(orderDetails.refundDate).toLocaleString() : 'N/A'}.
              </p>
              {orderDetails?.refundNotes && (
                <p className="text-green-600 mt-1">
                  <span className="font-medium">Note:</span> {orderDetails.refundNotes}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;

