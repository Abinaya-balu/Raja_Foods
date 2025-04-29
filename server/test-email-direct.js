const nodemailer = require('nodemailer');

// Email to test with - REPLACE WITH YOUR EMAIL
const TEST_EMAIL = 'abinayabt.22msc@kongu.edu';
// App password - REPLACE WITH YOUR APP PASSWORD
const TEST_PASSWORD = 'jrcoigwcuptgrvhb';

console.log('=== Direct Email Test ===');
console.log(`Testing with email: ${TEST_EMAIL}`);

async function testEmail() {
  try {
    // Create a test transporter with hardcoded credentials
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: TEST_EMAIL,
        pass: TEST_PASSWORD
      }
    });

    console.log('Verifying transporter connection...');
    try {
      const verify = await transporter.verify();
      console.log('✅ Transporter verification successful:', verify);
    } catch (verifyError) {
      console.error('❌ Transporter verification failed:', verifyError.message);
      return;
    }

    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"Test Email" <${TEST_EMAIL}>`,
      to: TEST_EMAIL, // Send to yourself
      subject: 'Test Email for Raja Oils Notifications',
      text: 'This is a test email. If you receive this, the email functionality is working correctly!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #4a4a4a;">Test Email</h2>
          <p>This is a test email. If you receive this, the email functionality is working correctly!</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('You should receive the test email shortly.');
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.log('\nPossible solutions:');
    console.log('1. For Gmail, make sure 2-Step Verification is enabled and you\'re using an App Password');
    console.log('2. Check if your email provider allows SMTP access');
    console.log('3. Try a different email provider');
  }
}

// Run the test
testEmail(); 