require('dotenv').config();
const nodemailer = require('nodemailer');
const os = require('os');
const dns = require('dns');

console.log('=== Email Configuration Test ===');
console.log('Starting email test script...');

// Display current environment settings
console.log('\nCurrent Configuration:');
console.log(`- Email User: ${process.env.EMAIL_USER || 'Not set'}`);
console.log(`- SMTP Host: ${process.env.SMTP_HOST || 'Not set (using default)'}`);
console.log(`- SMTP Port: ${process.env.SMTP_PORT || 'Not set (using default)'}`);
console.log(`- SMTP Secure: ${process.env.SMTP_SECURE || 'Not set (using default)'}`);

// Create configuration based on environment variables
let config;
if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
  config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    },
    debug: true
  };
  console.log('\nUsing custom SMTP configuration');
} else if (process.env.EMAIL_USER && process.env.EMAIL_USER.includes('@gmail.com')) {
  config = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    debug: true
  };
  console.log('\nUsing Gmail SMTP configuration');
} else {
  config = {
    host: 'smtp.gmail.com', // Default to Gmail
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    debug: true
  };
  console.log('\nUsing default configuration');
}

// Function to check network connectivity
async function checkNetworkConnectivity() {
  console.log('\nChecking network connectivity...');
  
  try {
    // Get network interfaces
    const networkInterfaces = os.networkInterfaces();
    console.log('Network interfaces:', 
      Object.entries(networkInterfaces)
        .map(([name, interfaces]) => `${name}: ${interfaces.map(i => i.address).join(', ')}`)
        .join('; ')
    );
    
    // Check DNS resolution for the SMTP host
    console.log(`Testing DNS resolution for ${config.host}...`);
    const addresses = await new Promise((resolve, reject) => {
      dns.resolve(config.host, (err, addresses) => {
        if (err) reject(err);
        else resolve(addresses);
      });
    });
    console.log(`DNS resolved ${config.host} to:`, addresses.join(', '));
    return true;
  } catch (error) {
    console.error('Network connectivity issue:', error.message);
    return false;
  }
}

// Function to test email sending
async function testEmailSending() {
  try {
    // First check network connectivity
    const networkOk = await checkNetworkConnectivity();
    if (!networkOk) {
      console.log('Network issues detected. Please check your internet connection.');
    }
    
    console.log('\nCreating email transporter...');
    const transporter = nodemailer.createTransport(config);
    
    console.log('Verifying transporter configuration...');
    try {
      const verify = await transporter.verify();
      console.log('Transporter verification successful:', verify);
    } catch (verifyError) {
      console.error('Transporter verification failed:', verifyError);
      throw verifyError;
    }
    
    console.log('Sending test email...');
    // Send test email
    const info = await transporter.sendMail({
      from: `"Raja Oils Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: 'Email Test for Product Notifications',
      text: 'This is a test email to verify that the product notification system is working correctly.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #4a4a4a; border-bottom: 1px solid #eee; padding-bottom: 10px;">Email Test</h2>
          <p style="color: #666;">This is a test email to verify that the product notification system is working correctly.</p>
          <p style="color: #666;">If you're receiving this, the email configuration is working!</p>
          <p style="color: #666;">Timestamp: ${new Date().toISOString()}</p>
          <p style="color: #666;">System Info: ${os.type()} ${os.release()}</p>
        </div>
      `
    });
    
    console.log('\n✅ Email sent successfully!');
    console.log('Response:', info.response);
    console.log('Message ID:', info.messageId);
    
    console.log('\nYour email configuration is working correctly! The product notification system should now be operational.');
    console.log('You should receive the test email shortly at:', process.env.EMAIL_USER);
  } catch (error) {
    console.error('\n❌ Error sending test email:', error);
    
    // Additional diagnostic information
    if (error.code === 'EAUTH') {
      console.error('\nAuthentication error - check your email and password');
      console.error('\nFor Gmail accounts:');
      console.error('1. Make sure 2-Step Verification is enabled in your Google account');
      console.error('2. Generate an App Password at https://myaccount.google.com/apppasswords');
      console.error('3. Use that App Password instead of your regular password');
      console.error('\nAlternatively, try using a different email provider by running:');
      console.error('node configure-email.js');
    } else if (error.code === 'ESOCKET') {
      console.error('\nNetwork error - check your internet connection and firewall settings');
    } else if (error.code === 'EENVELOPE') {
      console.error('\nEnvelope error - check your from/to email addresses');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\nConnection timeout - your internet connection may be slow or blocked');
    }
  }
}

// Run the test
testEmailSending().then(() => {
  console.log('\nEmail test complete');
}).catch(err => {
  console.error('\nUnhandled error during email test:', err);
}); 