// Load environment variables
require('dotenv').config();

// Import the Razorpay helper
const razorpay = require('./helpers/razorpay');

console.log('Razorpay Integration Test');
console.log('========================');
console.log('Environment: ', process.env.NODE_ENV);
console.log('Razorpay Key ID: ', process.env.RAZORPAY_KEY_ID);
console.log('Razorpay Key Secret exists: ', !!process.env.RAZORPAY_KEY_SECRET);

// Test creating an order
async function testRazorpay() {
  try {
    console.log('Creating test order...');
    
    const orderOptions = {
      amount: 50000, // ₹500
      currency: 'INR',
      receipt: `test_receipt_${Date.now()}`,
      notes: {
        description: 'Test order for Razorpay integration'
      }
    };
    
    console.log('Order options:', orderOptions);
    
    const order = await razorpay.orders.create(orderOptions);
    console.log('Order created successfully!');
    console.log('Order details:', order);
    
    return order;
  } catch (error) {
    console.error('Error creating test order:', error);
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
  }
}

testRazorpay()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err)); 