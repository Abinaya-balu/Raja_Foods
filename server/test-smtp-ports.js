/**
 * SMTP Configuration Test Script
 * 
 * This script tests different SMTP configurations to determine which one works in your environment.
 * It tries both port 465 (SSL) and 587 (TLS) and reports which one is successful.
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const net = require('net');

// Function to read values from .env file
function getEnvValue(key, defaultValue = '') {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
      console.error('ERROR: .env file not found at', envPath);
      return defaultValue;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      if (line.startsWith(`${key}=`)) {
        return line.substring(key.length + 1).trim();
      }
    }
    
    return defaultValue;
  } catch (error) {
    console.error('ERROR reading .env file:', error.message);
    return defaultValue;
  }
}

// Get email credentials
const EMAIL_USER = getEnvValue('EMAIL_USER');
const EMAIL_PASS = getEnvValue('EMAIL_PASS');
const TEST_RECIPIENT = getEnvValue('EMAIL_USER'); // Send to self for testing

console.log('======== SMTP Configuration Test ========');
console.log('Testing email delivery with different configurations...');
console.log(`Email user: ${EMAIL_USER}`);
console.log(`Sending test emails to: ${TEST_RECIPIENT}`);
console.log('=========================================');

// First, check basic connectivity to both ports
console.log('\nChecking network connectivity to SMTP ports...');

// Test function for port connectivity
function testPortConnectivity(port, description) {
  return new Promise((resolve) => {
    console.log(`Testing connection to smtp.gmail.com on port ${port} (${description})...`);
    const socket = net.createConnection(port, 'smtp.gmail.com');
    let connected = false;
    
    socket.on('connect', () => {
      console.log(`✅ Successfully connected to port ${port}`);
      connected = true;
      socket.end();
      resolve(true);
    });
    
    socket.on('error', (err) => {
      console.error(`❌ Failed to connect to port ${port}: ${err.message}`);
      resolve(false);
    });
    
    socket.setTimeout(8000, () => {
      console.error(`⏱️ Connection timeout while connecting to port ${port}`);
      socket.destroy();
      resolve(false);
    });
  });
}

// Function to test sending email with specific configuration
async function testEmailDelivery(config) {
  console.log(`\nTesting email delivery with: ${config.description}`);
  console.log(`Port: ${config.port}, Secure: ${config.secure}`);
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: config.port,
    secure: config.secure,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      timeout: 30000
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    debug: true
  });
  
  try {
    console.log('Verifying SMTP configuration...');
    const verified = await transporter.verify();
    console.log('✅ SMTP configuration verified successfully:', verified);
    
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"SMTP Test" <${EMAIL_USER}>`,
      to: TEST_RECIPIENT,
      subject: `Test Email - ${config.description}`,
      text: `This is a test email sent using ${config.description} (Port ${config.port}, Secure: ${config.secure})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2>SMTP Test Successful!</h2>
          <p>This email was sent using the following configuration:</p>
          <ul>
            <li><strong>Method:</strong> ${config.description}</li>
            <li><strong>Port:</strong> ${config.port}</li>
            <li><strong>Secure:</strong> ${config.secure}</li>
            <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
          </ul>
          <p>If you received this email, it means this configuration works in your environment!</p>
        </div>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
    return {
      success: true,
      port: config.port,
      secure: config.secure,
      description: config.description
    };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    return {
      success: false,
      port: config.port,
      secure: config.secure,
      description: config.description,
      error: error.message
    };
  }
}

// Main function to run tests
async function runTests() {
  // Test basic connectivity first
  const port465Accessible = await testPortConnectivity(465, 'SSL');
  const port587Accessible = await testPortConnectivity(587, 'TLS');
  
  console.log('\nConnectivity Test Results:');
  console.log(`Port 465 (SSL): ${port465Accessible ? '✅ Accessible' : '❌ Not accessible'}`);
  console.log(`Port 587 (TLS): ${port587Accessible ? '✅ Accessible' : '❌ Not accessible'}`);
  
  // Test email delivery
  const results = [];
  
  // Only test configurations for ports that are accessible
  if (port465Accessible) {
    results.push(await testEmailDelivery({
      port: 465,
      secure: true,
      description: 'SSL (port 465)'
    }));
  }
  
  if (port587Accessible) {
    results.push(await testEmailDelivery({
      port: 587,
      secure: false,
      description: 'TLS (port 587)'
    }));
  }
  
  // If neither port is accessible, show a message
  if (!port465Accessible && !port587Accessible) {
    console.error('\n❌ No SMTP ports are accessible from your environment.');
    console.error('This may be due to firewall restrictions or network configuration.');
    console.error('Recommended solutions:');
    console.error('1. Try running this test from a different network');
    console.error('2. Check if your hosting provider allows outgoing SMTP connections');
    console.error('3. Consider using a third-party email service like SendGrid or Mailgun');
    return;
  }
  
  // Summarize results
  const successfulConfigs = results.filter(r => r.success);
  
  console.log('\n========= Test Results Summary =========');
  if (successfulConfigs.length > 0) {
    console.log('✅ Successful configurations:');
    successfulConfigs.forEach(config => {
      console.log(`- ${config.description} (Port ${config.port}, Secure: ${config.secure})`);
    });
    
    console.log('\nRecommended Configuration for .env file:');
    const recommended = successfulConfigs[0]; // First successful config
    console.log(`SMTP_HOST=smtp.gmail.com`);
    console.log(`SMTP_PORT=${recommended.port}`);
    console.log(`SMTP_SECURE=${recommended.secure}`);
    
    console.log('\nPlease update your .env file with these settings.');
  } else {
    console.log('❌ No successful configurations found.');
    console.log('All email delivery attempts failed. You may need to:');
    console.log('1. Check if your email password is correct');
    console.log('2. For Gmail, make sure "Less secure app access" is enabled, or use an App Password');
    console.log('3. Try a different email service provider');
  }
  console.log('=========================================');
}

// Run the tests
runTests().catch(console.error); 