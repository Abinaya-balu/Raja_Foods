import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { resetInvoice } from "../../store/shop/order-slice";
import { CheckCircle2, Loader2 } from 'lucide-react';

const OrderConfirmation = () => {
  const { invoice } = useSelector((state) => state.shopOrder);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If no invoice data, redirect to orders page
    if (!invoice) {
      navigate('/shop/orders');
    } else {
      setIsLoading(false);
    }

    // Clean up invoice data when leaving the page
    return () => {
      dispatch(resetInvoice());
    };
  }, [invoice, navigate, dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading order details...</span>
      </div>
    );
  }

  if (!invoice || !invoice.order) {
    return null;
  }

  const { order, invoiceNumber } = invoice;
  const orderDate = new Date(order.orderDate).toLocaleDateString();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container max-w-3xl p-4 mx-auto my-8">
      <div className="flex flex-col items-center justify-center mb-6 print:hidden">
        <CheckCircle2 className="w-16 h-16 mb-2 text-green-500" />
        <h1 className="text-2xl font-bold text-center">
          Thank you for your order!
        </h1>
        <p className="text-gray-600">
          Your order has been confirmed and will be processed shortly.
        </p>
      </div>

      <Card className="border-2 print:border-0 print:shadow-none">
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">INVOICE</h2>
              <p className="text-sm text-gray-500">#{invoiceNumber}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm font-medium">SRI RAJA FOOD PRODUCTS</p>
              <p className="text-sm text-gray-500">123 Main Street</p>
              <p className="text-sm text-gray-500">Coimbatore, Tamil Nadu</p>
              <p className="text-sm text-gray-500">India</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="mb-2 text-sm font-semibold">Bill To:</h3>
              <p className="text-sm">{user?.userName || user?.name}</p>
              <p className="text-sm">{order.addressInfo.address}</p>
              <p className="text-sm">{order.addressInfo.city}, {order.addressInfo.pincode}</p>
              <p className="text-sm">Phone: {order.addressInfo.phone}</p>
            </div>
            <div className="text-left md:text-right">
              <h3 className="mb-2 text-sm font-semibold">Invoice Details:</h3>
              <p className="text-sm">Invoice Date: {orderDate}</p>
              <p className="text-sm">Order ID: {order._id}</p>
              <p className="text-sm">Payment Method: {order.paymentMethod}</p>
              <p className="text-sm">Payment Status: {order.paymentStatus}</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.cartItems && order.cartItems.length > 0 ? (
                  order.cartItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.title} 
                              className="h-12 w-12 rounded object-cover" 
                            />
                          )}
                          <span>{item.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">₹{parseFloat(item.price).toFixed(2)}</TableCell>
                      <TableCell className="text-right">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">No items in this order</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end mt-6">
            <div className="w-full md:w-1/3">
              <div className="flex justify-between py-2">
                <span className="font-medium">Subtotal:</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium">Tax:</span>
                <span>₹0.00</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between py-2 text-lg font-bold">
                <span>Total:</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col md:flex-row md:justify-between border-t gap-4">
          <div className="text-sm text-gray-500">
            <p>Thank you for shopping with SRI RAJA FOOD PRODUCTS!</p>
            <p>For invoice payments, please complete within 30 days.</p>
          </div>
          <Button onClick={handlePrint} className="print:hidden">
            Print Invoice
          </Button>
        </CardFooter>
      </Card>

      <div className="flex flex-col md:flex-row justify-center gap-4 md:space-x-4 mt-8 print:hidden">
        <Button variant="outline" onClick={() => navigate('/shop')}>
          Continue Shopping
        </Button>
        <Button variant="outline" onClick={() => navigate('/shop/account')}>
          View My Orders
        </Button>
      </div>
    </div>
  );
};

export default OrderConfirmation; 