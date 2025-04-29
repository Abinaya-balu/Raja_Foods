require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/raja-oils';

async function checkUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully!');
    
    console.log('Checking for users in the database...');
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('No users found in the database.');
      console.log('You need to register at least one user to test email notifications.');
    } else {
      console.log(`Found ${users.length} users in the database:`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.userName}, Email: ${user.email}, Role: ${user.role}`);
      });
      
      console.log('\nYou can use these users to test email notifications.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
checkUsers(); 