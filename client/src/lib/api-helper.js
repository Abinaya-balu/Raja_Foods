import { api } from "../store/auth-slice";

// Function to get the auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

// Function to check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Get the expiration from the token (JWT tokens have the payload in the middle segment)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

// Function to make an authenticated API request with token refresh
export const makeAuthenticatedRequest = async (url, method = 'GET', data = null) => {
  try {
    const token = getAuthToken();
    
    const config = {
      method,
      url,
      headers: {
        'Authorization': token ? `Bearer ${token}` : undefined
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    // Log request details for debugging
    console.log(`Making ${method} request to ${url}`, {
      url,
      method,
      hasToken: !!token,
      tokenHeader: token ? `Bearer ${token.substring(0, 10)}...` : 'none',
      data: data ? JSON.stringify(data).substring(0, 100) : 'none'
    });
    
    // Use the axios instance with refresh token interceptor
    const response = await api(config);
    return response.data;
  } catch (error) {
    console.error('API request failed:', error.message);
    
    // Add more detailed error information
    const errorDetails = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url,
      method
    };
    
    console.error('Error details:', errorDetails);
    
    throw error;
  }
};

// Function to format date to YYYY-MM-DD
export const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format date to human-readable format
export const formatHumanReadableDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Fetches all reviews for admin reporting
 * @param {Object} filters - Optional filter parameters (minRating, maxRating)
 * @returns {Promise} Promise that resolves to the reviews data
 */
export const fetchAllReviewsForAdmin = async (filters = {}) => {
  try {
    // Construct query string from filters
    const queryParams = new URLSearchParams();
    if (filters.minRating !== undefined) {
      queryParams.append('minRating', filters.minRating);
    }
    if (filters.maxRating !== undefined) {
      queryParams.append('maxRating', filters.maxRating);
    }
    
    const queryString = queryParams.toString();
    const url = `http://localhost:5000/api/shop/review/admin/all${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
}; 