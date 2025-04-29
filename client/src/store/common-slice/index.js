import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  featureImageList: [],
  error: null,
};

// Helper function to get the correct API URL
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? `http://${window.location.hostname}:5000/api` 
  : '/api';

export const getFeatureImages = createAsyncThunk(
  "/order/getFeatureImages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/common/feature/get`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching feature images:", error);
      return rejectWithValue(error.response?.data || { message: "Failed to fetch feature images" });
    }
  }
);

export const addFeatureImage = createAsyncThunk(
  "/order/addFeatureImage",
  async (image, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/common/feature/add`,
        { image }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding feature image:", error);
      return rejectWithValue(error.response?.data || { message: "Failed to add feature image" });
    }
  }
);

const commonSlice = createSlice({
  name: "commonSlice",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFeatureImages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFeatureImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageList = action.payload.data || [];
        state.error = null;
      })
      .addCase(getFeatureImages.rejected, (state, action) => {
        state.isLoading = false;
        state.featureImageList = [];
        state.error = action.payload || { message: "Unknown error occurred" };
      })
      .addCase(addFeatureImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addFeatureImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(addFeatureImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: "Unknown error occurred" };
      });
  },
});

export const { clearErrors } = commonSlice.actions;
export default commonSlice.reducer;
