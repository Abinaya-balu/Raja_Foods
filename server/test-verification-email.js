require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const { sendVerificationEmail } = require('./helpers/email');
const crypto = require('crypto');

// MongoDB Connection String
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/raja_oils';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Test email to use
const TEST_EMAIL = 'abinayabt.22msc@kongu.edu'; // Change this to your test email

// Create a test user and send verification email
async function testVerificationEmail() {
  try {
    console.log('=== Testing Email Verification ===');

    // Check if test user already exists
    let testUser = await User.findOne({ email: TEST_EMAIL });
    
    if (!testUser) {
      // Create a test user if doesn't exist
      console.log(`Creating test user with email: ${TEST_EMAIL}`);
      
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      testUser = new User({
        userName: 'TestUser',
        email: TEST_EMAIL,
        password: await require('bcryptjs').hash('testpassword', 12),
        isVerified: false,
        verificationToken,
        verificationTokenExpires
      });
      
      await testUser.save();
      console.log('Test user created successfully');
    } else {
      // Update existing test user with new verification token
      console.log(`Updating existing test user: ${TEST_EMAIL}`);
      
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      testUser.isVerified = false;
      testUser.verificationToken = verificationToken;
      testUser.verificationTokenExpires = verificationTokenExpires;
      
      await testUser.save();
      console.log('Test user updated with new verification token');
    }
    
    console.log('Sending verification email...');
    await sendVerificationEmail(testUser);
    console.log('✅ Verification email sent successfully!');
    console.log(`Verification token: ${testUser.verificationToken}`);
    console.log(`Verification link will expire at: ${testUser.verificationTokenExpires}`);
    
    // Print test verification link
    const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
    console.log(`\nTest verification link (copy and paste into your browser):`);
    console.log(`${clientURL}/verify-email?token=${testUser.verificationToken}`);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the test
testVerificationEmail(); 