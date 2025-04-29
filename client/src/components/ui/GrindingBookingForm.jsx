import { useState, useEffect } from "react";
import { getAvailableSlots, createBooking } from "../../lib/grinding-bookings-api";
import { formatDate } from "../../lib/api-helper";
import { useToast } from "../../hooks/useToast";

const GrindingBookingForm = () => {
  const [date, setDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotLoading, setSlotLoading] = useState(false);
  const { toast } = useToast();

  // Set minimum date to today
  const today = new Date();
  const minDate = formatDate(today);

  // Handle date change
  const handleDateChange = async (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    
    if (selectedDate) {
      setSlotLoading(true);
      try {
        const data = await getAvailableSlots(selectedDate);
        setAvailableSlots(data.availableSlots);
        setBookedSlots(data.bookedSlots);
        setSelectedSlot(""); // Reset selected slot
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch available slots",
          variant: "destructive",
        });
      } finally {
        setSlotLoading(false);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!date || !selectedSlot) {
      toast({
        title: "Error",
        description: "Please select a date and time slot",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const bookingData = {
        date,
        timeSlot: selectedSlot,
        notes,
      };
      
      const response = await createBooking(bookingData);
      
      toast({
        title: "Success",
        description: "Grinding service booking created successfully!",
      });
      
      // Reset form
      setDate("");
      setSelectedSlot("");
      setNotes("");
      setAvailableSlots([]);
      setBookedSlots([]);
      
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Book Grinding Service
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label 
            htmlFor="date" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Date
          </label>
          <input
            type="date"
            id="date"
            min={minDate}
            value={date}
            onChange={handleDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        {date && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Time Slot
            </label>
            
            {slotLoading ? (
              <div className="text-center py-4">Loading available slots...</div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-4 text-red-500">
                No available slots for this date
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 mt-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-4 rounded-md text-sm ${
                      selectedSlot === slot
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
            
            {bookedSlots.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Booked Slots:</p>
                <div className="grid grid-cols-1 gap-2">
                  {bookedSlots.map((slot) => (
                    <div
                      key={slot}
                      className="py-2 px-4 rounded-md text-sm bg-gray-200 text-gray-500 opacity-60 cursor-not-allowed"
                    >
                      {slot} (Booked)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mb-6">
          <label 
            htmlFor="notes" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Any special instructions or requirements..."
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !date || !selectedSlot}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading || !date || !selectedSlot
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Booking..." : "Book Now"}
        </button>
      </form>
    </div>
  );
};

export default GrindingBookingForm; 