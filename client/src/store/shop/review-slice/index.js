import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  reviews: [],
  error: null,
};

// Helper function to get the correct API URL
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? `http://${window.location.hostname}:5000/api` 
  : '/api';

export const addReview = createAsyncThunk(
  "/order/addReview",
  async (formdata, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/shop/review/add`,
        formdata
      );
      return response.data;
    } catch (error) {
      console.error("Error adding review:", error);
      return rejectWithValue(error.response?.data || { message: "Failed to add review" });
    }
  }
);

export const getReviews = createAsyncThunk(
  "/order/getReviews", 
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return { data: [] };
      }
      const response = await axios.get(
        `${API_BASE_URL}/shop/review/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return rejectWithValue(error.response?.data || { message: "Failed to fetch reviews" });
    }
  }
);

const reviewSlice = createSlice({
  name: "reviewSlice",
  initialState,
  reducers: {
    clearReviewErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.data || [];
        state.error = null;
      })
      .addCase(getReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.reviews = [];
        state.error = action.payload || { message: "Unknown error occurred" };
      })
      .addCase(addReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(addReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: "Unknown error occurred" };
      });
  },
});

export const { clearReviewErrors } = reviewSlice.actions;
export default reviewSlice.reducer;
