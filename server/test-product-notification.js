// This script tests sending a product notification email without needing to use the API
const { sendNewProductNotification } = require('./helpers/email');

// Test user
const testUser = {
  userName: 'Test User',
  email: 'abinayabt.22msc@kongu.edu', // Replace with your email for testing
};

// Test product
const testProduct = {
  title: 'Test Product',
  description: 'This is a test product to check email notifications',
  price: 99.99,
  salePrice: 79.99,
  category: 'Test Category',
  brand: 'Test Brand',
};

async function testNotification() {
  console.log('=== Testing Product Notification Email ===');
  console.log(`Sending test email to: ${testUser.email}`);
  
  try {
    const result = await sendNewProductNotification([testUser], testProduct);
    
    if (result) {
      console.log('✅ Test notification sent successfully!');
    } else {
      console.log('❌ Failed to send test notification');
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
  }
}

// Run the test
testNotification(); 