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
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";
import { generateOrderReport } from "@/lib/csv-export";
import { useToast } from "@/hooks/useToast";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [filterCodInvoice, setFilterCodInvoice] = useState(false);
  const { orderList, orderDetails } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetailsForAdmin(getId));
  }

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  console.log(orderDetails, "orderList");

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  // Function to download orders report
  const handleDownloadReport = () => {
    try {
      const ordersToExport = filterCodInvoice 
        ? orderList.filter(order => order.paymentMethod === "cod" || order.paymentMethod === "invoice")
        : orderList;
      
      generateOrderReport(ordersToExport);
      toast({
        title: "Success",
        description: "Order report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive",
      });
    }
  };

  // Filter orders based on payment method
  const filteredOrders = filterCodInvoice
    ? orderList.filter(order => order.paymentMethod === "cod" || order.paymentMethod === "invoice")
    : orderList;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          <div className="flex flex-col">
            <span className="text-xl font-bold">SRI RAJA FOOD PRODUCTS</span>
            <span className="text-sm font-normal text-gray-500">Order Management</span>
          </div>
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="filterCodInvoice" 
              checked={filterCodInvoice} 
              onCheckedChange={setFilterCodInvoice}
            />
            <Label htmlFor="filterCodInvoice" className="text-sm cursor-pointer">
              Show only COD/Invoice orders
            </Label>
          </div>
          <Button 
            onClick={handleDownloadReport}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Payment/Refund</TableHead>
              <TableHead>Order Price</TableHead>
              <TableHead>
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders && filteredOrders.length > 0
              ? filteredOrders.map((orderItem) => (
                  <TableRow key={orderItem?._id}>
                    <TableCell>{orderItem?._id}</TableCell>
                    <TableCell>{orderItem?.orderDate.split("T")[0]}</TableCell>
                    <TableCell>
                      <Badge
                        className={`py-1 px-3 ${
                          orderItem?.orderStatus === "confirmed"
                            ? "bg-green-500"
                            : orderItem?.orderStatus === "rejected"
                            ? "bg-red-600"
                            : "bg-black"
                        }`}
                      >
                        {orderItem?.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {orderItem?.refundStatus === "completed" ? (
                        <Badge className="py-1 px-3 bg-green-500">
                          Refunded
                        </Badge>
                      ) : orderItem?.paymentStatus === "paid" ? (
                        <Badge className="py-1 px-3 bg-blue-500">
                          Paid
                        </Badge>
                      ) : (
                        <Badge className="py-1 px-3 bg-yellow-500">
                          {orderItem?.paymentStatus || "Pending"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>₹{orderItem?.totalAmount}</TableCell>
                    <TableCell>
                      <Dialog
                        open={openDetailsDialog}
                        onOpenChange={() => {
                          setOpenDetailsDialog(false);
                          dispatch(resetOrderDetails());
                        }}
                      >
                        <Button
                          onClick={() =>
                            handleFetchOrderDetails(orderItem?._id)
                          }
                        >
                          View Details
                        </Button>
                        <AdminOrderDetailsView orderDetails={orderDetails} />
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              : <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                    {filterCodInvoice 
                      ? "No Cash on Delivery or Invoice orders found."
                      : "No orders found."}
                  </TableCell>
                </TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default AdminOrdersView;
