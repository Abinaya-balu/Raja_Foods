import { makeAuthenticatedRequest } from "./api-helper";

const API_ENDPOINT = "/bookings";

// Debug function to test authentication
export const checkBookingAuth = async () => {
  try {
    return await makeAuthenticatedRequest(`${API_ENDPOINT}/check-auth`);
  } catch (error) {
    console.error("Auth check failed:", error);
    throw new Error(error.response?.data?.message || "Authentication check failed");
  }
};

// Function to get available slots for a specific date
export const getAvailableSlots = async (date) => {
  try {
    return await makeAuthenticatedRequest(`${API_ENDPOINT}/availability?date=${date}`);
  } catch (error) {
    console.error("Error fetching available slots:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch available slots");
  }
};

// Function to create a new booking
export const createBooking = async (bookingData) => {
  try {
    return await makeAuthenticatedRequest(API_ENDPOINT, "POST", bookingData);
  } catch (error) {
    console.error("Error creating booking:", error);
    throw new Error(error.response?.data?.message || "Failed to create booking");
  }
};

// Function to get user's bookings
export const getMyBookings = async () => {
  try {
    return await makeAuthenticatedRequest(`${API_ENDPOINT}/my`);
  } catch (error) {
    console.error("Error fetching my bookings:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch bookings");
  }
};

// Function to get all bookings (admin only)
export const getAllBookings = async () => {
  try {
    return await makeAuthenticatedRequest(API_ENDPOINT);
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch all bookings");
  }
};

// Function to update booking status (admin only)
export const updateBookingStatus = async (bookingId, status) => {
  try {
    return await makeAuthenticatedRequest(`${API_ENDPOINT}/${bookingId}`, "PUT", { status });
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw new Error(error.response?.data?.message || "Failed to update booking status");
  }
}; 