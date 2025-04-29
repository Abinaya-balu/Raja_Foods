const mongoose = require("mongoose");

const GrindingBookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Direct customer info fields for redundancy
  name: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    default: ""
  },
  date: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
}, {
  timestamps: true
});

const GrindingBooking = mongoose.model("GrindingBooking", GrindingBookingSchema);
module.exports = GrindingBooking; 