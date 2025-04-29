const GrindingBooking = require("../../models/GrindingBooking");
const User = require("../../models/User");
const nodemailer = require("nodemailer");

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Get available time slots for a specific date
const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Define all available time slots (configurable)
    const allTimeSlots = [
      "09:00 AM - 10:00 AM",
      "10:00 AM - 11:00 AM",
      "11:00 AM - 12:00 PM",
      "01:00 PM - 02:00 PM",
      "02:00 PM - 03:00 PM",
      "03:00 PM - 04:00 PM",
      "04:00 PM - 05:00 PM",
    ];

    // Find booked slots for the date
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const bookedSlots = await GrindingBooking.find({
      date: { $gte: startDate, $lte: endDate },
      status: { $ne: "Rejected" }, // Exclude rejected bookings
    }).select("timeSlot");

    const bookedTimeSlotsSet = new Set(bookedSlots.map(slot => slot.timeSlot));
    const availableTimeSlots = allTimeSlots.filter(slot => !bookedTimeSlotsSet.has(slot));

    return res.status(200).json({
      date: date,
      availableSlots: availableTimeSlots,
      bookedSlots: Array.from(bookedTimeSlotsSet)
    });
  } catch (error) {
    console.error("Error getting available slots:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Create a new grinding booking
const createBooking = async (req, res) => {
  try {
    const { date, timeSlot, notes } = req.body;
    // Handle both possible formats of req.user (id property or _id property)
    const customerId = req.user.id || req.user._id;
    
    console.log('Creating booking. User data:', req.user);
    console.log('Customer ID extracted:', customerId);
    console.log('Booking data:', { date, timeSlot, notes });
    
    // Validate inputs
    if (!date || !timeSlot) {
      return res.status(400).json({ message: "Date and time slot are required" });
    }

    // Check if the slot is already booked
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const existingBooking = await GrindingBooking.findOne({
      date: { $gte: bookingDate, $lte: endDate },
      timeSlot,
      status: { $ne: "Rejected" }, // Exclude rejected bookings
    });

    if (existingBooking) {
      return res.status(400).json({ message: "This time slot is already booked" });
    }

    // Get user details if available
    const userName = req.user.userName || "";
    const userEmail = req.user.email || "";

    // Create new booking
    const newBooking = new GrindingBooking({
      customerId,
      name: userName,
      email: userEmail,
      date: bookingDate,
      timeSlot,
      notes,
      status: "Pending",
    });

    await newBooking.save();
    console.log('Booking created successfully:', newBooking._id);

    return res.status(201).json({ 
      message: "Booking created successfully", 
      booking: newBooking 
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get customer's bookings
const getMyBookings = async (req, res) => {
  try {
    // Handle both possible formats of req.user
    const customerId = req.user.id || req.user._id;
    console.log('Fetching bookings for user:', customerId);
    
    const bookings = await GrindingBooking.find({ customerId })
      .sort({ date: -1 })
      .lean();
    
    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Error getting customer bookings:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all bookings (admin only)
const getAllBookings = async (req, res) => {
  try {
    console.log('Admin fetching all grinding bookings');
    
    // First try to get bookings with populated User data
    let bookings = await GrindingBooking.find()
      .sort({ date: -1 })
      .populate("customerId", "userName email")
      .lean();
    
    // If we don't have populated data, try to populate it ourselves
    const processedBookings = await Promise.all(bookings.map(async (booking) => {
      try {
        // If customerId exists but no userName/email, try to find the user
        if (booking.customerId && 
            (!booking.name || !booking.email || booking.name === "Unknown")) {
          const User = require("../../models/User");
          const userId = booking.customerId._id || booking.customerId;
          const user = await User.findById(userId).select("userName email").lean();
          
          if (user) {
            return {
              ...booking,
              name: user.userName,
              email: user.email,
              customerId: {
                _id: userId,
                userName: user.userName,
                email: user.email
              }
            };
          }
        }
        
        // If we still don't have a name, use whatever data we have
        if (!booking.name && booking.customerId && typeof booking.customerId === 'object') {
          booking.name = booking.customerId.userName || "Unknown";
        }
        
        if (!booking.email && booking.customerId && typeof booking.customerId === 'object') {
          booking.email = booking.customerId.email || "Unknown";
        }
        
        return booking;
      } catch (err) {
        console.error("Error processing booking customer info:", err);
        return booking;
      }
    }));
    
    console.log(`Returning ${processedBookings.length} bookings to admin`);
    return res.status(200).json(processedBookings);
  } catch (error) {
    console.error("Error getting all bookings:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update booking status (admin only)
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const booking = await GrindingBooking.findById(id).populate("customerId", "email userName");
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    booking.status = status;
    await booking.save();
    
    // Send email notification
    if (booking.customerId && booking.customerId.email) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: booking.customerId.email,
        subject: `Grinding Service Booking ${status}`,
        text: `Dear ${booking.customerId.userName},\n\nYour grinding service booking for ${booking.date.toDateString()} at ${booking.timeSlot} has been ${status.toLowerCase()}.\n\n${status === "Rejected" ? "We apologize for any inconvenience caused." : "We look forward to serving you."}\n\nThank you,\nThe Raja Oils Team`,
      };
      
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });
    }
    
    return res.status(200).json({ 
      message: `Booking status updated to ${status}`,
      booking 
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add the module.exports at the end of the file
module.exports = {
  getAvailableSlots,
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus
};
