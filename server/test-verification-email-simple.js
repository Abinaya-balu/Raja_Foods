require('dotenv').config();
const { sendVerificationEmail } = require('./helpers/email');
const crypto = require('crypto');

// Test email to use
const TEST_EMAIL = 'abinayabt.22msc@kongu.edu'; // Change this to your test email

// Create a mock user and send verification email
async function testVerificationEmail() {
  try {
    console.log('=== Testing Email Verification (Simple Version) ===');
    
    // Generate a test verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Create a mock user object
    const mockUser = {
      userName: 'TestUser',
      email: TEST_EMAIL,
      verificationToken,
      verificationTokenExpires
    };
    
    console.log(`Testing with email: ${TEST_EMAIL}`);
    console.log('Sending verification email...');
    
    try {
      await sendVerificationEmail(mockUser);
      console.log('✅ Verification email sent successfully!');
      
      // Print test verification link
      const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
      console.log(`\nVerification token: ${verificationToken}`);
      console.log(`Test verification link (copy and paste into your browser):`);
      console.log(`${clientURL}/verify-email?token=${verificationToken}`);
      
      console.log('\nNote: This is a test only. Since we\'re not using MongoDB, you cannot actually verify this account.');
    } catch (emailError) {
      console.error('❌ Error sending verification email:', emailError);
    }
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run the test
testVerificationEmail(); 