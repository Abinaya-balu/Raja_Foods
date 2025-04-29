import Address from "../../components/shopping-view/address";
import img from "../../assets/banner.jpg";
import { useDispatch, useSelector } from "react-redux";
import OrderSummary from "../../components/shopping-view/order-summary";
import { Button } from "../../components/ui/button";
import { useState, useEffect } from "react";
import { createOrderWithoutPayment, createRazorpayOrder, verifyRazorpayPayment } from "../../store/shop/order-slice";
import { Navigate, useNavigate } from "react-router-dom";
import { useToast } from "../../components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Loader2 } from "lucide-react";
import { fetchCartItems } from "../../store/shop/cart-slice";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL, invoice, isLoading, razorpayOrder } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymemntStart] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isCartLoading, setIsCartLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id))
        .then(() => setIsCartLoading(false))
        .catch(() => setIsCartLoading(false));
    } else {
      setIsCartLoading(false);
    }
  }, [dispatch, user?.id]);

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  // Common validation for all payment methods
  const validateOrder = () => {
    if (!cartItems || !cartItems.items || cartItems.items.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return false;
    }
    
    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  // For Razorpay payment flow
  function handleInitiateRazorpayPayment() {
    if (!validateOrder()) return;

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      totalAmount: totalCartAmount,
    };

    console.log("Creating Razorpay order with data:", orderData);

    dispatch(createRazorpayOrder(orderData)).then((data) => {
      console.log("Razorpay order response:", data);
      
      if (data?.payload?.success) {
        // Open Razorpay payment form
        const options = {
          key: data.payload.data.key,
          amount: data.payload.data.razorpayOrder.amount,
          currency: data.payload.data.razorpayOrder.currency,
          name: "SRI RAJA FOOD PRODUCTS",
          description: "Payment for your order",
          order_id: data.payload.data.razorpayOrder.id,
          handler: function(response) {
            console.log("Razorpay payment success:", response);
            // Verify payment on backend
            const paymentData = {
              orderId: data.payload.data.order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            };
            
            dispatch(verifyRazorpayPayment(paymentData)).then((verifyData) => {
              console.log("Payment verification response:", verifyData);
              
              if (verifyData?.payload?.success) {
                setOrderComplete(true);
                toast({
                  title: "Payment successful!",
                  description: "Your order has been confirmed.",
                });
              } else {
                toast({
                  title: "Payment verification failed",
                  description: verifyData?.payload?.message || "Please contact support.",
                  variant: "destructive",
                });
              }
            });
          },
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: currentSelectedAddress?.phone || ""
          },
          theme: {
            color: "#F59E0B",
          },
          // Add error handling to expose any internal Razorpay errors
          modal: {
            ondismiss: function() {
              console.log("Razorpay checkout modal closed");
            }
          }
        };

        console.log("Configuring Razorpay with options:", {...options, key_secret: "***hidden***"});

        try {
          const razorpayInstance = new window.Razorpay(options);
          razorpayInstance.open();

          // Handle payment failure
          razorpayInstance.on('payment.failed', function(response) {
            console.error("Razorpay payment failed:", response);
            toast({
              title: "Payment failed",
              description: response.error.description,
              variant: "destructive",
            });
          });
        } catch (error) {
          console.error("Error initializing Razorpay:", error);
          toast({
            title: "Payment initialization failed",
            description: error.message || "Unable to initialize payment gateway",
            variant: "destructive",
          });
        }
      } else {
        console.error("Failed to create Razorpay order:", data);
        toast({
          title: "Failed to create order",
          description: data?.payload?.message || "There was an error initiating payment. Please try again.",
          variant: "destructive",
        });
      }
    }).catch(error => {
      console.error("Razorpay order creation error:", error);
      toast({
        title: "Payment service error",
        description: "Failed to connect to payment service. Please try again later.",
        variant: "destructive",
      });
    });
  }

  // For Cash on Delivery / Invoice payment
  function handleDirectCheckout() {
    if (!validateOrder()) return;

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      paymentMethod,
      totalAmount: totalCartAmount,
    };

    dispatch(createOrderWithoutPayment(orderData)).then((data) => {
      if (data?.payload?.success) {
        setOrderComplete(true);
        toast({
          title: "Order placed successfully!",
          description: `Your order has been confirmed. Invoice #${data.payload.data.invoiceNumber}`,
        });
      } else {
        toast({
          title: "Failed to place order",
          description: data?.payload?.message || "There was an error processing your order. Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  // If payment started, redirect to PayPal
  if (isPaymentStart && approvalURL) {
    window.location.href = approvalURL;
  }

  // If order complete with invoice, redirect to order confirmation
  if (orderComplete && invoice) {
    return <Navigate to="/shop/order-confirmation" />;
  }

  if (isCartLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading cart items...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-teal-800 mb-2">Checkout</h1>
        <p className="text-gray-600">Complete your order by providing shipping and payment details</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Address selection */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Card className="overflow-hidden border-teal-100 shadow-md">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 border-b border-teal-100">
              <CardTitle className="text-xl font-semibold text-teal-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10l8-8 8 8-8 8-8-8z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 21v-7h6v7" />
                </svg>
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="mb-4 relative h-40 overflow-hidden">
                <img
                  src={img}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <p className="text-white p-4 text-sm">Select a delivery address below</p>
                </div>
              </div>
              <div className="p-4">
                <Address setCurrentSelectedAddress={setCurrentSelectedAddress} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Order summary and payment */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <Card className="border-teal-100 shadow-md">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 border-b border-teal-100">
              <CardTitle className="text-xl font-semibold text-teal-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Cart items */}
              <div className="mb-6">
                <OrderSummary />
              </div>

              {cartItems && cartItems.items && cartItems.items.length > 0 && (
                <>
                  {/* Total amount */}
                  <div className="flex justify-between items-center p-4 border border-teal-100 rounded-lg bg-teal-50 my-6">
                    <span className="font-semibold text-lg text-teal-800">Total Amount:</span>
                    <span className="font-bold text-xl text-teal-800">₹{totalCartAmount.toFixed(2)}</span>
                  </div>
                  
                  {/* Payment method selection */}
                  <div className="mt-8 mb-6">
                    <h2 className="mb-4 text-lg font-semibold text-teal-800 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      Payment Method
                    </h2>
                    <RadioGroup
                      defaultValue="cod"
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="space-y-3"
                    >
                      <div className={`flex items-center space-x-2 p-4 rounded-md border hover:border-teal-200 transition-colors ${paymentMethod === 'cod' ? 'border-teal-300 bg-teal-50' : 'border-gray-200'}`}>
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="cursor-pointer flex-1 font-medium">Cash on Delivery</Label>
                      </div>
                      <div className={`flex items-center space-x-2 p-4 rounded-md border hover:border-teal-200 transition-colors ${paymentMethod === 'razorpay' ? 'border-teal-300 bg-teal-50' : 'border-gray-200'}`}>
                        <RadioGroupItem value="razorpay" id="razorpay" />
                        <Label htmlFor="razorpay" className="cursor-pointer flex-1">
                          <div className="font-medium">Razorpay</div>
                          <div className="text-sm text-gray-500">Credit/Debit Card, UPI, Net Banking</div>
                        </Label>
                        <div className="flex gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-teal-700">
                            <path d="M10.5 20.5a.5.5 0 01-.5-.5v-5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v5a.5.5 0 01-.5.5h-3zm0-12a.5.5 0 01-.5-.5V3a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v5a.5.5 0 01-.5.5h-3zM4 15.5a.5.5 0 01-.5-.5v-5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v5a.5.5 0 01-.5.5H4zm0-6a.5.5 0 01-.5-.5V4a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v5a.5.5 0 01-.5.5H4zm13 6a.5.5 0 01-.5-.5v-5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v5a.5.5 0 01-.5.5h-3z"/>
                          </svg>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-8">
                    {paymentMethod === 'razorpay' ? (
                      <Button
                        onClick={handleInitiateRazorpayPayment}
                        disabled={isLoading}
                        className="w-full py-6 text-lg bg-teal-600 hover:bg-teal-700 transition-colors shadow-md"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Pay ₹{totalCartAmount.toFixed(2)} with Razorpay
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleDirectCheckout}
                        disabled={isLoading}
                        className="w-full py-6 text-lg bg-teal-600 hover:bg-teal-700 transition-colors shadow-md"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Complete Order (₹{totalCartAmount.toFixed(2)})
                          </>
                        )}
                      </Button>
                    )}
                    <p className="text-center text-gray-500 text-sm mt-4">
                      By placing your order, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
