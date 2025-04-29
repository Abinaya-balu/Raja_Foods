import { useState, useEffect } from "react";
import { getAllBookings, updateBookingStatus } from "../../lib/grinding-bookings-api";
import { formatHumanReadableDate } from "../../lib/api-helper";
import { useToast } from "@/components/ui/use-toast";
import { generateBookingReport } from "../../lib/csv-export";

const AdminBookingManager = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const { toast } = useToast();

  // Function to fetch all bookings
  const fetchBookings = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Function to update booking status
  const handleStatusUpdate = async (bookingId, newStatus) => {
    setProcessingId(bookingId);
    try {
      await updateBookingStatus(bookingId, newStatus);
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: newStatus } 
            : booking
        )
      );
      
      toast({
        title: "Success",
        description: `Booking ${newStatus.toLowerCase()} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking status",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Function to download bookings report
  const handleDownloadReport = () => {
    try {
      if (bookings.length === 0) {
        toast({
          title: "Info",
          description: "No bookings available to download",
        });
        return;
      }
      
      generateBookingReport(bookings);
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

  // Helper function to get customer name and email
  const getCustomerInfo = (booking) => {
    // First check for direct name/email fields (our new approach)
    if (booking.name && booking.email) {
      return {
        name: booking.name,
        email: booking.email
      };
    }
    
    // Then check if customerId is populated and has userName/email properties
    if (booking.customerId && typeof booking.customerId === 'object') {
      return {
        name: booking.customerId.userName || "Unknown",
        email: booking.customerId.email || "Unknown"
      };
    }
    
    // If customerId is not populated properly or booking has direct name/email fields
    return {
      name: booking.customerName || "Unknown",
      email: booking.customerEmail || "Unknown"
    };
  };

  if (loading) {
    return (
      <div className="w-full bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-8 text-gray-500">
          <svg className="animate-spin h-8 w-8 mx-auto text-teal-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Loading grinding service bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Grinding Service Bookings</h2>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium flex items-center"
            disabled={bookings.length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download CSV
          </button>
          <button
            onClick={fetchBookings}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No grinding service bookings</h3>
          <p className="mt-1 text-sm text-gray-500">
            There are no grinding service bookings to manage at this time.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Slot
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => {
                const customerInfo = getCustomerInfo(booking);
                return (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.name || 
                         (booking.customerId && booking.customerId.userName) || 
                         "Unknown Customer"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.email || 
                         (booking.customerId && booking.customerId.email) || 
                         "Unknown Email"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatHumanReadableDate(booking.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.timeSlot}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {booking.notes || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {booking.status === "Pending" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusUpdate(booking._id, "Approved")}
                            disabled={processingId === booking._id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            {processingId === booking._id ? "Processing..." : "Approve"}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking._id, "Rejected")}
                            disabled={processingId === booking._id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {processingId === booking._id ? "Processing..." : "Reject"}
                          </button>
                        </div>
                      )}
                      {booking.status !== "Pending" && (
                        <span className="text-gray-400">Already processed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBookingManager; 