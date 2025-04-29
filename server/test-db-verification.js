require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const { sendVerificationEmail } = require('./helpers/email');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Test email to use (change to your email for testing)
const TEST_EMAIL = 'test@example.com';
const TEST_USERNAME = 'testuser';
const TEST_PASSWORD = 'password123';

// MongoDB Connection (use the same connection string as your application)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/raja_oils';

async function createOrUpdateTestUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB!');

    // Check if test user already exists
    console.log(`Looking for test user with email: ${TEST_EMAIL}`);
    let testUser = await User.findOne({ email: TEST_EMAIL });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (testUser) {
      console.log('Test user found! Updating verification token...');
      
      // Update existing user
      testUser.isVerified = false;
      testUser.verificationToken = verificationToken;
      testUser.verificationTokenExpires = verificationTokenExpires;
      
      await testUser.save();
      console.log('Test user updated successfully!');
    } else {
      console.log('Test user not found. Creating new test user...');
      
      // Create new test user
      const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 12);
      
      testUser = new User({
        userName: TEST_USERNAME,
        email: TEST_EMAIL,
        password: hashedPassword,
        isVerified: false,
        verificationToken: verificationToken,
        verificationTokenExpires: verificationTokenExpires,
        role: 'user'
      });
      
      await testUser.save();
      console.log('New test user created successfully!');
    }

    // Print verification details
    console.log('\n=== VERIFICATION DETAILS ===');
    console.log(`Email: ${TEST_EMAIL}`);
    console.log(`Username: ${TEST_USERNAME}`);
    console.log(`Password: ${TEST_PASSWORD}`);
    console.log(`Verification Token: ${verificationToken}`);
    console.log(`Token Expires: ${verificationTokenExpires}`);
    
    // Generate URL for verification
    const API_URL = process.env.API_URL || 'http://localhost:5000/api';
    const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
    
    console.log('\n=== TEST URLS ===');
    console.log(`API Verification URL: ${API_URL}/auth/verify-email/${verificationToken}`);
    console.log(`Client Verification URL: ${CLIENT_URL}/verify-email?token=${verificationToken}`);
    
    // Optional: Send actual verification email
    try {
      console.log('\nSending verification email...');
      await sendVerificationEmail(testUser);
      console.log('✅ Verification email sent successfully!');
    } catch (emailError) {
      console.error('❌ Error sending verification email:', emailError);
    }

    return testUser;
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the database connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the function
createOrUpdateTestUser(); 