import React, { useState } from 'react';
import { checkBookingAuth, createBooking } from '../../lib/grinding-bookings-api';
import { refreshAuthToken, api } from '../../store/auth-slice';
import { useDispatch } from 'react-redux';

const AuthTestComponent = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const testAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await checkBookingAuth();
      setResult(response);
      console.log('Auth check successful:', response);
    } catch (err) {
      setError(err.message);
      console.error('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const testManualRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dispatch(refreshAuthToken()).unwrap();
      setResult(result);
      console.log('Token refresh result:', result);
    } catch (err) {
      setError(err.message || 'Refresh failed');
      console.error('Token refresh failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkTokens = () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    setResult({
      accessToken: accessToken ? 'exists' : 'missing',
      refreshToken: refreshToken ? 'exists' : 'missing',
      accessTokenHeader: accessToken ? accessToken.substring(0, 20) + '...' : null,
      refreshTokenHeader: refreshToken ? refreshToken.substring(0, 20) + '...' : null
    });
  };

  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setResult({ message: 'Tokens cleared' });
  };

  const testCreateBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const testBookingData = {
        date: tomorrow.toISOString().split('T')[0],
        timeSlot: "09:00 AM - 10:00 AM",
        notes: "Test booking from debug component"
      };
      
      console.log('Attempting to create test booking:', testBookingData);
      
      const response = await createBooking(testBookingData);
      setResult(response);
      console.log('Booking created successfully:', response);
    } catch (err) {
      setError(err.message);
      console.error('Test booking failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Authentication Test</h2>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <button 
          onClick={testAuth}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Auth'}
        </button>
        
        <button 
          onClick={testManualRefresh}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Manual Token Refresh'}
        </button>
        
        <button 
          onClick={checkTokens}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Check Tokens
        </button>
        
        <button 
          onClick={clearTokens}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear Tokens
        </button>
        
        <button 
          onClick={testCreateBooking}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Test Create Booking'}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="p-3 bg-gray-100 border rounded">
          <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default AuthTestComponent; 