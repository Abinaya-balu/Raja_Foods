import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  approvalURL: null,
  isLoading: false,
  orderId: null,
  orderList: [],
  orderDetails: null,
  invoice: null,
  razorpayOrder: null,
};

export const createNewOrder = createAsyncThunk(
  "/order/createNewOrder",
  async (orderData) => {
    const response = await axios.post(
      "http://localhost:5000/api/shop/order/create",
      orderData
    );

    return response.data;
  }
);

export const capturePayment = createAsyncThunk(
  "/order/capturePayment",
  async ({ paymentId, payerId, orderId }) => {
    const response = await axios.post(
      "http://localhost:5000/api/shop/order/capture",
      {
        paymentId,
        payerId,
        orderId,
      }
    );

    return response.data;
  }
);

export const getAllOrdersByUserId = createAsyncThunk(
  "/order/getAllOrdersByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      console.log("Fetching orders for user:", userId);
      if (!userId) {
        console.error("No user ID provided for order fetch");
        return rejectWithValue({ success: false, message: "No user ID provided" });
      }
      
      const response = await axios.get(
        `http://localhost:5000/api/shop/order/user/${userId}`
      );

      console.log("Orders response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Failed to fetch orders. Please try again."
        }
      );
    }
  }
);

export const getOrderDetails = createAsyncThunk(
  "/order/getOrderDetails",
  async (id) => {
    const response = await axios.get(
      `http://localhost:5000/api/shop/order/details/${id}`
    );

    return response.data;
  }
);

export const createOrderWithoutPayment = createAsyncThunk(
  "/order/createOrderWithoutPayment",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/shop/order/create-without-payment",
        orderData
      );
      return response.data;
    } catch (error) {
      console.error("Order creation error:", error);
      return rejectWithValue(
        error.response?.data || { 
          success: false, 
          message: "Failed to create order. Please try again." 
        }
      );
    }
  }
);

export const createRazorpayOrder = createAsyncThunk(
  "/order/createRazorpayOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/shop/order/create-razorpay",
        orderData
      );
      return response.data;
    } catch (error) {
      console.error("Razorpay order creation error:", error);
      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Failed to create Razorpay order. Please try again."
        }
      );
    }
  }
);

export const verifyRazorpayPayment = createAsyncThunk(
  "/order/verifyRazorpayPayment",
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/shop/order/verify-razorpay",
        paymentData
      );
      return response.data;
    } catch (error) {
      console.error("Razorpay payment verification error:", error);
      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Failed to verify payment. Please contact support."
        }
      );
    }
  }
);

const shoppingOrderSlice = createSlice({
  name: "shoppingOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
    resetInvoice: (state) => {
      state.invoice = null;
    },
    resetRazorpayOrder: (state) => {
      state.razorpayOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.approvalURL = action.payload.approvalURL;
        state.orderId = action.payload.orderId;
        sessionStorage.setItem(
          "currentOrderId",
          JSON.stringify(action.payload.orderId)
        );
      })
      .addCase(createNewOrder.rejected, (state) => {
        state.isLoading = false;
        state.approvalURL = null;
        state.orderId = null;
      })
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrdersByUserId.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetails.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      })
      .addCase(createOrderWithoutPayment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createOrderWithoutPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderId = action.payload.data.order._id;
        state.invoice = action.payload.data;
        sessionStorage.setItem(
          "currentOrderId",
          JSON.stringify(action.payload.data.order._id)
        );
      })
      .addCase(createOrderWithoutPayment.rejected, (state) => {
        state.isLoading = false;
        state.orderId = null;
        state.invoice = null;
      })
      .addCase(createRazorpayOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createRazorpayOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderId = action.payload.data.order._id;
        state.razorpayOrder = action.payload.data;
      })
      .addCase(createRazorpayOrder.rejected, (state) => {
        state.isLoading = false;
        state.orderId = null;
        state.razorpayOrder = null;
      })
      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoice = action.payload.data;
        state.razorpayOrder = null;
      })
      .addCase(verifyRazorpayPayment.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { resetOrderDetails, resetInvoice, resetRazorpayOrder } = shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;
