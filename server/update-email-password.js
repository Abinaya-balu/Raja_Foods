const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== Gmail App Password Update Utility ===');
console.log('This script will update your Gmail app password in the .env file');
console.log('To generate an app password:');
console.log('1. Go to https://myaccount.google.com/apppasswords');
console.log('2. Sign in with your Google account');
console.log('3. Select "App" -> "Other (Custom name)" -> Enter "Raja Oils Notifications"');
console.log('4. Click "Generate" and copy the 16-character password\n');

// Ask for the new app password
rl.question('Enter your new Gmail app password: ', (newPassword) => {
  if (!newPassword || newPassword.trim().length === 0) {
    console.error('Error: Password cannot be empty');
    rl.close();
    return;
  }

  try {
    // Get path to the .env file (one directory up from this script)
    const envPath = path.join(__dirname, '..', '.env');
    
    // Check if the file exists
    if (!fs.existsSync(envPath)) {
      console.error(`Error: .env file not found at ${envPath}`);
      rl.close();
      return;
    }
    
    // Read the current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check if EMAIL_PASS exists
    if (envContent.includes('EMAIL_PASS=')) {
      // Replace the existing EMAIL_PASS value
      envContent = envContent.replace(
        /EMAIL_PASS=.*/,
        `EMAIL_PASS=${newPassword}`
      );
    } else {
      // Add EMAIL_PASS if it doesn't exist
      envContent += `\nEMAIL_PASS=${newPassword}\n`;
    }
    
    // Write the updated content back to the .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log('\nSuccess! Your Gmail app password has been updated.');
    console.log('You can now run the test-email.js script to verify your email setup.');
  } catch (error) {
    console.error('An error occurred while updating the .env file:', error);
  } finally {
    rl.close();
  }
}); 