import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Token management helpers
const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

const getAccessToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');
const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

const initialState = {
  isAuthenticated: !!getAccessToken(),
  isLoading: true,
  user: null,
  refreshing: false,
};

// Axios instance with interceptors for token refresh
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

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response, // Return successful responses as-is
  async (error) => {
    const originalRequest = error.config;
    
    // Check if the error is due to an expired token (401) and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Token expired, attempting to refresh...');
      
      try {
        // Call the refresh token endpoint with refresh token in header
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          console.log('No refresh token available');
          clearTokens();
          return Promise.reject(error);
        }
        
        // Log the token being used for refresh
        console.log('Using refresh token:', refreshToken.substring(0, 10) + '...');
        
        const refreshResponse = await axios.post(
          "http://localhost:5000/api/auth/refresh",
          {},
          { 
            headers: {
              'Authorization': `Bearer ${refreshToken}`
            }
          }
        );
        
        console.log('Refresh response:', refreshResponse.data);
        
        if (refreshResponse.data.success) {
          console.log('Token refreshed successfully, retrying original request');
          // Save new token
          setTokens(refreshResponse.data.accessToken, refreshToken);
          
          // Add the new token to the original request
          originalRequest.headers = {
            ...originalRequest.headers,
            'Authorization': `Bearer ${refreshResponse.data.accessToken}`
          };
          
          // Retry the original request that failed
          return api(originalRequest);
        } else {
          console.error('Token refresh response was not successful:', refreshResponse.data);
          clearTokens();
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        clearTokens();
        // If the refresh token is invalid/expired, clear the auth state
        if (refreshError.response?.status === 401) {
          console.log('Refresh token invalid or expired, logging out');
        }
      }
    }
    
    // If token refresh failed or wasn't attempted, return the original error
    return Promise.reject(error);
  }
);

export const registerUser = createAsyncThunk(
  "/auth/register",
  async (formData) => {
    const response = await api.post("/auth/register", formData);
    return response.data;
  }
);

export const loginUser = createAsyncThunk(
  "/auth/login",
  async (formData) => {
    const response = await api.post("/auth/login", formData);
    
    // Save tokens if login successful
    if (response.data.success) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }
    
    return response.data;
  }
);

export const logoutUser = createAsyncThunk(
  "/auth/logout",
  async () => {
    const response = await api.post("/auth/logout");
    clearTokens();
    return response.data;
  }
);

export const refreshAuthToken = createAsyncThunk(
  "/auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        return rejectWithValue({ success: false, message: "No refresh token available" });
      }
      
      const response = await axios.post(
        "http://localhost:5000/api/auth/refresh",
        {},
        { 
          headers: {
            'Authorization': `Bearer ${refreshToken}`
          }
        }
      );
      
      if (response.data.success) {
        setTokens(response.data.accessToken, refreshToken);
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { success: false });
    }
  }
);

export const checkAuth = createAsyncThunk(
  "/auth/checkauth",
  async (_, { dispatch, rejectWithValue }) => {
    const token = getAccessToken();
    if (!token) {
      return rejectWithValue({ success: false });
    }
    
    try {
      const response = await api.get("/auth/check-auth", {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      });
      return response.data;
    } catch (error) {
      // If we get a 401, try refreshing the token
      if (error.response?.status === 401) {
        try {
          const refreshResult = await dispatch(refreshAuthToken()).unwrap();
          if (refreshResult.success) {
            // Retry the check-auth call after successful refresh
            const retryResponse = await api.get("/auth/check-auth");
            return retryResponse.data;
          }
        } catch (refreshError) {
          clearTokens();
          // Refresh failed, continue to return the original error
        }
      }
      return rejectWithValue(error.response?.data || { success: false });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(refreshAuthToken.pending, (state) => {
        state.refreshing = true;
      })
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        state.refreshing = false;
        if (action.payload.success) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      })
      .addCase(refreshAuthToken.rejected, (state) => {
        state.refreshing = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;

// Export the API instance for use in other services
export { api };
