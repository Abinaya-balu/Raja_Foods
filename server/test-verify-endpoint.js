require('dotenv').config();
const axios = require('axios');

// Test verification token (replace with an actual token from your database)
const TEST_TOKEN = '9ec4f1a77bee7af399bb992faf29ab1d5928debff06b476ec21a472c549bb4de';

// Server URL
const API_URL = process.env.API_URL || 'http://localhost:5000/api';

async function testVerifyEndpoint() {
  try {
    console.log('=== Testing Verification Endpoint ===');
    console.log(`Testing with token: ${TEST_TOKEN.substring(0, 10)}...`);
    
    try {
      const verifyUrl = `${API_URL}/auth/verify-email/${TEST_TOKEN}`;
      console.log(`Making GET request to: ${verifyUrl}`);
      
      const response = await axios.get(verifyUrl);
      
      console.log(`Status code: ${response.status}`);
      console.log('Response data:', response.data);
      
      if (response.data.success) {
        console.log('✅ Verification endpoint working correctly!');
      } else {
        console.log('❌ Verification failed but endpoint is responding');
      }
    } catch (error) {
      console.error('❌ Error testing verification endpoint:', error.message);
      
      if (error.response) {
        console.log(`Status code: ${error.response.status}`);
        console.log('Response data:', error.response.data);
      }
    }
  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run the test
testVerifyEndpoint(); 