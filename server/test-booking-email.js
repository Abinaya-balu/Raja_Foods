// This script tests the booking confirmation and status update emails
const { sendBookingConfirmationEmail, sendBookingStatusUpdateEmail } = require('./helpers/email');

// Generate a MongoDB-style ObjectId for testing
function generateObjectId() {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const randomPart = [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  return timestamp + randomPart;
}

// Test booking data
const testBooking = {
  _id: generateObjectId(), // Generate a realistic booking ID
  name: 'Test Customer',
  email: 'abinayabt.22msc@kongu.edu', // Replace with your email
  date: new Date(), // Current date
  timeSlot: '10:00 AM - 11:00 AM',
  notes: 'This is a test booking to verify email notifications',
  status: 'Pending'
};

console.log(`Using test booking ID: ${testBooking._id}`);

async function testBookingEmails() {
  console.log('=== Testing Booking Email Notifications ===');
  
  try {
    // Test confirmation email
    console.log('\n1. Testing booking confirmation email...');
    await sendBookingConfirmationEmail(testBooking);
    console.log('✅ Booking confirmation email sent successfully!');
    
    // Wait a moment before sending the next email
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test status update email - Approved
    console.log('\n2. Testing booking status update email (Approved)...');
    const approvedBooking = { ...testBooking, status: 'Approved' };
    await sendBookingStatusUpdateEmail(approvedBooking, 'Pending');
    console.log('✅ Booking approval email sent successfully!');
    
    // Wait a moment before sending the next email
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test status update email - Rejected
    console.log('\n3. Testing booking status update email (Rejected)...');
    const rejectedBooking = { ...testBooking, status: 'Rejected' };
    await sendBookingStatusUpdateEmail(rejectedBooking, 'Pending');
    console.log('✅ Booking rejection email sent successfully!');
    
    console.log('\nAll booking email tests completed successfully!');
    console.log('Check your inbox for the test emails.');
    console.log(`The booking details link uses ID: ${testBooking._id}`);
  } catch (error) {
    console.error('Error during booking email tests:', error);
  }
}

// Run the tests
testBookingEmails(); 