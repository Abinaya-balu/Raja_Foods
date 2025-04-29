import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Get access token from localStorage
const getAccessToken = () => localStorage.getItem('accessToken');

// Create an authenticated API instance
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// Add authorization header to requests
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const initialState = {
  orderList: [],
  orderDetails: null,
  refundStatus: null,
  refundError: null,
  isRefunding: false,
  isUpdatingPayment: false
};

export const getAllOrdersForAdmin = createAsyncThunk(
  "/order/getAllOrdersForAdmin",
  async () => {
    const response = await api.get(`/admin/orders/get`);
    return response.data;
  }
);

export const getOrderDetailsForAdmin = createAsyncThunk(
  "/order/getOrderDetailsForAdmin",
  async (id) => {
    const response = await api.get(`/admin/orders/details/${id}`);
    return response.data;
  }
);

export const updateOrderStatus = createAsyncThunk(
  "/order/updateOrderStatus",
  async ({ id, orderStatus }) => {
    const response = await api.put(
      `/admin/orders/update/${id}`,
      {
        orderStatus,
      }
    );

    return response.data;
  }
);

export const processRefund = createAsyncThunk(
  "/order/processRefund",
  async ({ id, refundAmount, refundNotes }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/admin/orders/refund/${id}`,
        {
          refundAmount,
          refundNotes
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updatePaymentStatus = createAsyncThunk(
  "/order/updatePaymentStatus",
  async ({ id, paymentStatus }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/admin/orders/updatePaymentStatus/${id}`,
        {
          paymentStatus
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      console.log("resetOrderDetails");

      state.orderDetails = null;
    },
    resetRefundStatus: (state) => {
      state.refundStatus = null;
      state.refundError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllOrdersForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrdersForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })
      .addCase(getOrderDetailsForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetailsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetailsForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      })
      .addCase(processRefund.pending, (state) => {
        state.isRefunding = true;
        state.refundStatus = null;
        state.refundError = null;
      })
      .addCase(processRefund.fulfilled, (state, action) => {
        state.isRefunding = false;
        state.refundStatus = action.payload;
        state.refundError = null;
      })
      .addCase(processRefund.rejected, (state, action) => {
        state.isRefunding = false;
        state.refundStatus = null;
        state.refundError = action.payload;
      })
      .addCase(updatePaymentStatus.pending, (state) => {
        state.isUpdatingPayment = true;
      })
      .addCase(updatePaymentStatus.fulfilled, (state) => {
        state.isUpdatingPayment = false;
      })
      .addCase(updatePaymentStatus.rejected, (state) => {
        state.isUpdatingPayment = false;
      });
  },
});

export const { resetOrderDetails, resetRefundStatus } = adminOrderSlice.actions;

export default adminOrderSlice.reducer;
