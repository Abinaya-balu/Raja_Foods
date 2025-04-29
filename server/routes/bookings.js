const express = require('express');
const router = express.Router();
const Booking = require('../models/GrindingBooking');
const User = require('../models/User');
const { sendBookingConfirmationEmail, sendBookingStatusUpdateEmail } = require('../helpers/email');

// GET all bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('customerId', 'userName email');
    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// GET bookings for a specific customer
router.get('/bookings/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const bookings = await Booking.find({ customerId }).sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer bookings'
    });
  }
});

// POST - Create a new booking
router.post('/bookings', async (req, res) => {
  try {
    console.log('Creating new booking with data:', req.body);
    const { customerId, date, timeSlot, notes } = req.body;

    // Input validation
    if (!customerId || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customerId, date, and timeSlot are required'
      });
    }

    // Check if the customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Create new booking
    const newBooking = new Booking({
      customerId,
      date,
      timeSlot,
      notes,
      status: 'Pending' // Default status
    });

    // Save the booking
    await newBooking.save();
    console.log('Booking saved successfully. ID:', newBooking._id);

    // Prepare the booking object with customer details for the email
    const bookingWithCustomerDetails = {
      ...newBooking.toObject(),
      name: customer.userName,
      email: customer.email
    };

    // Send confirmation email
    try {
      await sendBookingConfirmationEmail(bookingWithCustomerDetails);
      console.log('Booking confirmation email sent successfully');
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError);
      // We don't want to fail the booking creation if email fails
    }

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: newBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
});

// PUT - Update booking status
router.put('/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: Pending, Approved, Rejected'
      });
    }

    // Find the booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Store previous status for email notification
    const previousStatus = booking.status;

    // Update booking status
    booking.status = status;
    await booking.save();

    // Get customer details for email
    const customer = await User.findById(booking.customerId);
    if (customer && previousStatus !== status) {
      // Prepare the booking object with customer details for the email
      const bookingWithCustomerDetails = {
        ...booking.toObject(),
        name: customer.userName,
        email: customer.email
      };

      // Send status update email
      try {
        await sendBookingStatusUpdateEmail(bookingWithCustomerDetails, previousStatus);
        console.log('Booking status update email sent successfully');
      } catch (emailError) {
        console.error('Failed to send booking status update email:', emailError);
        // Continue even if email fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status'
    });
  }
});

// DELETE - Cancel a booking
router.delete('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
});

module.exports = router;
