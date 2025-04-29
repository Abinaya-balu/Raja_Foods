import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshAuthToken } from '../../store/auth-slice';
import { getAuthToken, isTokenExpired } from '../../lib/api-helper';

// How many minutes before token expiry to attempt refresh
const REFRESH_THRESHOLD_MINUTES = 5;

const TokenRefresher = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, refreshing } = useSelector(state => state.auth);
  const [refreshTimer, setRefreshTimer] = useState(null);

  // Function to check and refresh token if needed
  const checkAndRefreshToken = () => {
    const token = getAuthToken();
    
    if (!token || !isAuthenticated) {
      console.log('No token found or user not authenticated, skipping refresh check');
      return;
    }
    
    try {
      // Get the expiration from the token (JWT tokens have the payload in the middle segment)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      // Calculate time until expiry in minutes
      const minutesToExpiry = Math.floor((expiryTime - currentTime) / (1000 * 60));
      
      console.log(`Token check: expires in ${minutesToExpiry} minutes`);
      
      // If token will expire within the threshold, refresh it
      if (minutesToExpiry <= REFRESH_THRESHOLD_MINUTES) {
        console.log(`Token expires in ${minutesToExpiry} minutes, refreshing...`);
        dispatch(refreshAuthToken())
          .unwrap()
          .then(result => {
            console.log('Token refresh result:', result);
          })
          .catch(error => {
            console.error('Token refresh failed:', error);
          });
      } else {
        console.log(`Token valid for ${minutesToExpiry} more minutes`);
        
        // Schedule next check just before the threshold
        const timeUntilNextCheck = (minutesToExpiry - REFRESH_THRESHOLD_MINUTES) * 60 * 1000;
        
        // Set a timer to check again
        const timer = setTimeout(() => {
          checkAndRefreshToken();
        }, Math.min(timeUntilNextCheck, 30 * 60 * 1000)); // Check at most every 30 minutes
        
        console.log(`Next token check scheduled in ${Math.min(timeUntilNextCheck, 30 * 60 * 1000) / 1000 / 60} minutes`);
        
        setRefreshTimer(timer);
      }
    } catch (error) {
      console.error('Error checking token expiration:', error);
    }
  };

  // Set up token refresh checking when component mounts or auth state changes
  useEffect(() => {
    if (isAuthenticated && !refreshing) {
      checkAndRefreshToken();
      
      // Check token health every 5 minutes
      const intervalId = setInterval(() => {
        checkAndRefreshToken();
      }, 5 * 60 * 1000);
      
      return () => {
        clearInterval(intervalId);
        if (refreshTimer) {
          clearTimeout(refreshTimer);
        }
      };
    }
    
    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, [isAuthenticated, refreshing]);

  // No UI - this is just a background process
  return null;
};

export default TokenRefresher; 