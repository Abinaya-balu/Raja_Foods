// Load environment variables from the .env file
require('dotenv').config({ path: '../.env' });

console.log('Checking environment variables:');
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'Not set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set (masked)' : 'Not set');
console.log(`CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME || 'Not set'}`);

// Check if .env file exists and read its contents
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
console.log('\nChecking .env file at:', envPath);

try {
  if (fs.existsSync(envPath)) {
    console.log('File exists: Yes');
    console.log('\nReading .env file content:');
    const content = fs.readFileSync(envPath, 'utf8');
    console.log(content.replace(/^.+PASS=.+$/mg, 'PASSWORD=*******')); // Mask passwords
  } else {
    console.log('File exists: No');
  }
} catch (error) {
  console.error('Error checking .env file:', error.message);
} 