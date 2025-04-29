import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../auth-slice";

// Get user's wishlist
export const fetchWishlist = createAsyncThunk(
  "/wishlist/fetchWishlist",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/shop/wishlist/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Add product to wishlist
export const addToWishlist = createAsyncThunk(
  "/wishlist/addToWishlist",
  async ({ userId, productId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/shop/wishlist/add`, {
        userId,
        productId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Remove product from wishlist
export const removeFromWishlist = createAsyncThunk(
  "/wishlist/removeFromWishlist",
  async ({ userId, productId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/shop/wishlist/${userId}/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Clear entire wishlist
export const clearWishlist = createAsyncThunk(
  "/wishlist/clearWishlist",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/shop/wishlist/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const initialState = {
  wishlist: null,
  isLoading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    resetWishlistError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlist = action.payload.data;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: "Failed to fetch wishlist" };
      })
      
      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlist = action.payload.data;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: "Failed to add to wishlist" };
      })
      
      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlist = action.payload.data;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: "Failed to remove from wishlist" };
      })
      
      // Clear wishlist
      .addCase(clearWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlist = action.payload.data;
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: "Failed to clear wishlist" };
      });
  },
});

export const { resetWishlistError } = wishlistSlice.actions;
export default wishlistSlice.reducer; 