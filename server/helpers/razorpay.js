const Razorpay = require('razorpay');
const fs = require('fs');
const path = require('path');

// Custom function to read values directly from .env file
function getEnvValue(key, defaultValue = '') {
  try {
    const envPath = path.join(__dirname, '..', '..', '.env');
    if (!fs.existsSync(envPath)) {
      console.error('ERROR: .env file not found at', envPath);
      return defaultValue;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      if (line.trim().startsWith(`${key}=`)) {
        return line.substring(key.length + 1).trim();
      }
    }
    
    return defaultValue;
  } catch (error) {
    console.error('ERROR reading .env file:', error.message);
    return defaultValue;
  }
}

// Get keys with more reliable method to read from .env file
const key_id = getEnvValue('RAZORPAY_KEY_ID', 'rzp_test_eWp4sZ6kX2ButP');
const key_secret = getEnvValue('RAZORPAY_KEY_SECRET', 'RMbi0aO8WtcIJEBQCqcpfT1Q');

console.log('Razorpay Configuration:');
console.log('Key ID:', key_id.substring(0, 6) + '...');  // Show only first few characters
console.log('Key Secret: [Masked for security]');

// Wrap Razorpay initialization in a more robust error handler
try {
  // Validate keys before creating instance
  if (!key_id || key_id.length < 10) {
    throw new Error('Invalid or missing Razorpay Key ID');
  }
  
  if (!key_secret || key_secret.length < 10) {
    throw new Error('Invalid or missing Razorpay Key Secret');
  }
  
  console.log('Initializing Razorpay with key ID:', key_id);
  
  const razorpay = new Razorpay({
    key_id: key_id,
    key_secret: key_secret
  });
  
  // Test the configuration by making a simple API call
  console.log('Testing Razorpay connection...');
  razorpay.payments.all({count: 1})
    .then((result) => {
      console.log('✅ Razorpay connection successfully verified');
      console.log(`Connected to Razorpay with key ID: ${key_id}`);
    })
    .catch(err => {
      console.error('⚠️ Razorpay connection test failed:', err.message);
      console.error('Please check your Razorpay API keys and network connectivity');
      // Don't throw error here - allow the application to continue with the warning
    });
  
  // Add the verify method explicitly for testing the connection
  razorpay.verifyConnection = async () => {
    try {
      const result = await razorpay.payments.all({count: 1});
      return {
        success: true,
        message: 'Razorpay connection successful'
      };
    } catch (error) {
      return {
        success: false,
        message: `Razorpay connection failed: ${error.message}`
      };
    }
  };
  
  module.exports = razorpay;
} catch (error) {
  console.error('❌ Razorpay initialization error:', error.message);
  
  // Provide a complete mock implementation for development/testing
  console.warn('⚠️ Using MOCK Razorpay - no actual payments will be processed!');
  
  const mockRazorpay = {
    orders: {
      create: async (options) => {
        console.log('Using MOCK Razorpay - no actual payment will be processed');
        return {
          id: 'order_mock_' + Date.now(),
          amount: options.amount,
          currency: options.currency,
          receipt: options.receipt,
          status: 'created'
        };
      }
    },
    payments: {
      all: async () => [],
      fetch: async () => ({}),
      capture: async () => ({}),
      refund: async () => ({
        id: 'rfnd_mock_' + Date.now(),
        payment_id: 'pay_mock_123',
        amount: 100,
        currency: 'INR',
        status: 'processed'
      })
    },
    refunds: {
      fetch: async () => ({
        id: 'rfnd_mock_' + Date.now(),
        payment_id: 'pay_mock_123',
        amount: 100,
        currency: 'INR',
        status: 'processed'
      })
    },
    verifyConnection: async () => ({
      success: false,
      message: 'Using mock Razorpay instance'
    })
  };
  
  module.exports = mockRazorpay;
} 