// Import the updated email helper
const { transporter } = require('./helpers/email');

console.log('=== Testing Email with Fixed Configuration ===');

async function testEmail() {
  try {
    console.log('Verifying transporter connection...');
    try {
      const verify = await transporter.verify();
      console.log('✅ Transporter verification successful:', verify);
    } catch (verifyError) {
      console.error('❌ Transporter verification failed:', verifyError.message);
      return;
    }

    // Get email address from the transporter config
    const emailUser = transporter.options.auth.user;
    console.log(`Using email: ${emailUser}`);

    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"Raja Oils Test" <${emailUser}>`,
      to: emailUser, // Send to yourself
      subject: 'Test Email for Raja Oils Notifications (Fixed)',
      text: 'This is a test email using the fixed configuration. If you receive this, the email configuration is working correctly!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #4a4a4a;">Test Email (Fixed Configuration)</h2>
          <p>This is a test email using the fixed configuration. If you receive this, the email functionality is working correctly!</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('You should receive the test email shortly.');
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
  }
}

// Run the test
testEmail(); 