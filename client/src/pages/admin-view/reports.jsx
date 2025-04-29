import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateOrderReport, generateBookingReport, generateUserReport, generateReviewReport, generateProductReport } from "@/lib/csv-export";
import { useToast } from "@/hooks/useToast";
import { getAllBookings } from "@/lib/grinding-bookings-api";
import { fetchAllReviewsForAdmin } from "@/lib/api-helper";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersForAdmin } from "@/store/admin/order-slice";
import { fetchAllProducts } from "@/store/admin/products-slice";

const ReportsPage = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [timeFrame, setTimeFrame] = useState("all");
  const [reviewFilterType, setReviewFilterType] = useState("all");
  const [productReportType, setProductReportType] = useState("inventory");
  const { orderList } = useSelector((state) => state.adminOrder);
  const { productList } = useSelector((state) => state.adminProducts);

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch bookings",
        variant: "destructive",
      });
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      // Define filters based on the selected review filter type
      let filters = {};
      
      if (reviewFilterType === "positive") {
        filters = { minRating: 4 }; // 4 and 5 stars are positive
      } else if (reviewFilterType === "negative") {
        filters = { maxRating: 3 }; // 1, 2, and 3 stars are negative/neutral
      }
      
      const data = await fetchAllReviewsForAdmin(filters);
      setReviews(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch reviews",
        variant: "destructive",
      });
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    dispatch(getAllOrdersForAdmin());
    dispatch(fetchAllProducts());
  }, [dispatch]);

  useEffect(() => {
    // Fetch reviews when the filter type changes
    fetchReviews();
  }, [reviewFilterType]);

  const filterDataByTimeFrame = (data, dateField) => {
    if (timeFrame === "all") return data;

    const now = new Date();
    let startDate;

    switch (timeFrame) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        return data;
    }

    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= startDate;
    });
  };

  const handleOrderReport = () => {
    try {
      const filteredOrders = filterDataByTimeFrame(orderList || [], "orderDate");
      generateOrderReport(filteredOrders);
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

  const handleBookingReport = () => {
    try {
      const filteredBookings = filterDataByTimeFrame(bookings, "date");
      generateBookingReport(filteredBookings);
      toast({
        title: "Success",
        description: "Booking report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive",
      });
    }
  };

  const handleReviewReport = () => {
    try {
      const filteredReviews = filterDataByTimeFrame(reviews, "createdAt");
      generateReviewReport(filteredReviews, reviewFilterType);
      toast({
        title: "Success",
        description: `${reviewFilterType.charAt(0).toUpperCase() + reviewFilterType.slice(1)} review report downloaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive",
      });
    }
  };

  const handleProductReport = () => {
    try {
      generateProductReport(productList, orderList, productReportType, timeFrame);
      toast({
        title: "Success",
        description: `Product ${productReportType} report downloaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download product report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Reports Management</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>
            Download CSV reports for different aspects of your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Time Frame</label>
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select time frame" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Tabs defaultValue="orders">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="bookings">Grinding Bookings</TabsTrigger>
              <TabsTrigger value="reviews">Customer Reviews</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="p-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Orders Report</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Download a CSV report of all orders with customer details, order status, and amounts.
                </p>
                <Button 
                  onClick={handleOrderReport}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                  disabled={!orderList || orderList.length === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Orders Report
                </Button>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                {orderList && orderList.length > 0 ? (
                  <p>Total Orders: {orderList.length}</p>
                ) : (
                  <p>No orders available</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="bookings" className="p-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Grinding Bookings Report</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Download a CSV report of all grinding service bookings with customer details, date, time slot and status.
                </p>
                <Button 
                  onClick={handleBookingReport}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                  disabled={bookingsLoading || bookings.length === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Bookings Report
                </Button>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                {bookingsLoading ? (
                  <p>Loading bookings...</p>
                ) : bookings.length > 0 ? (
                  <p>Total Bookings: {bookings.length}</p>
                ) : (
                  <p>No bookings available</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="p-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Customer Reviews Report</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Download a CSV report of customer reviews with ratings, feedback, and product details.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Review Type</label>
                  <Select value={reviewFilterType} onValueChange={setReviewFilterType}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select review type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reviews</SelectItem>
                      <SelectItem value="positive">Positive Reviews (4-5 ★)</SelectItem>
                      <SelectItem value="negative">Negative Reviews (1-3 ★)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleReviewReport}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                  disabled={reviewsLoading || reviews.length === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Reviews Report
                </Button>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                {reviewsLoading ? (
                  <p>Loading reviews...</p>
                ) : reviews.length > 0 ? (
                  <p>Total Reviews: {reviews.length}</p>
                ) : (
                  <p>No reviews available</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="products" className="p-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Product Reports</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Download reports about your products including inventory, sales performance, and popularity analytics.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Report Type</label>
                  <Select value={productReportType} onValueChange={setProductReportType}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inventory">Inventory Report</SelectItem>
                      <SelectItem value="sales">Sales Performance Report</SelectItem>
                      <SelectItem value="analytics">Product Analytics Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleProductReport}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                  disabled={!productList || productList.length === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Product Report
                </Button>
              </div>
              
              <div className="mt-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium mb-2">Available Reports</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                    <li><strong>Inventory Report:</strong> Complete list of all products with stock levels and pricing details</li>
                    <li><strong>Sales Performance Report:</strong> Sales statistics for each product including quantity sold and revenue</li>
                    <li><strong>Product Analytics Report:</strong> Popularity analysis showing most purchased products for the selected time period</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                {productList && productList.length > 0 ? (
                  <p>Total Products: {productList.length}</p>
                ) : (
                  <p>No products available</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage; 