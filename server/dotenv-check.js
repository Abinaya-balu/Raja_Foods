// Load dotenv to ensure environment variables are properly loaded
require('dotenv').config();

console.log('Environment Variables Check:');
console.log('============================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET exists:', !!process.env.RAZORPAY_KEY_SECRET);

// Get Razorpay keys with fallbacks
const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_eWp4sZ6kX2ButP';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'RMbi0aO8WtcIJEBQCqcpfT1Q';

console.log('Using fallback values if needed:');
console.log('Key ID:', key_id);
console.log('Key Secret exists:', !!key_secret);
console.log('============================'); 