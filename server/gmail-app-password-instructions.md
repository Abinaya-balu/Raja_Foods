# Generating Gmail App Password for Raja Oils

If you're experiencing issues with email sending, you may need to generate an App Password for your Gmail account, especially if you have 2-Step Verification enabled.

## What is an App Password?

An App Password is a 16-character code that gives a less secure app or device permission to access your Google Account. App Passwords can only be used with accounts that have 2-Step Verification turned on.

## Steps to Generate an App Password

1. **Ensure 2-Step Verification is enabled on your Google Account**
   - Go to your [Google Account](https://myaccount.google.com/)
   - In the "Security" section, select "2-Step Verification"
   - Follow the prompts to turn on 2-Step Verification if it's not already enabled

2. **Generate an App Password**
   - Go to your [Google Account](https://myaccount.google.com/)
   - Select "Security"
   - Under "Signing in to Google," select "App passwords" (you may need to sign in again)
   - At the bottom, click "Select app" and choose "Mail"
   - Click "Select device" and choose "Other (Custom name)"
   - Enter "Raja Oils SMTP" as the name
   - Click "Generate"
   - Google will display your app password. Copy this password (the 16-character code)

3. **Update your .env file**
   - Open your project's `.env` file
   - Replace the current `SMTP_PASS` value with your new App Password:
   ```
   SMTP_PASS=your-16-character-app-password
   ```
   - Leave the `EMAIL_USER` as your full Gmail address

4. **Test the email functionality**
   - Run the SMTP test script:
   ```
   node server/test-smtp-ports.js
   ```
   - This will test both port 465 (SSL) and port 587 (TLS) connections
   - Use the recommended settings from the test results

## Important Notes

- App Passwords are 16 characters long, with no spaces
- You should never share your App Password with anyone
- If you believe your App Password has been compromised, you can revoke it from the same place you created it
- Using App Passwords is more secure than enabling "Less secure app access"

## Still Having Issues?

If you're still experiencing issues after generating an App Password:

1. Double-check that you've copied the App Password correctly (no spaces)
2. Make sure your network/firewall isn't blocking outgoing SMTP connections
3. Consider using a third-party email service like SendGrid or Mailgun
4. Check the Google account you're using for any security alerts or restrictions

## Additional Resources

- [Google App Passwords Documentation](https://support.google.com/accounts/answer/185833)
- [Troubleshooting Gmail SMTP](https://support.google.com/mail/answer/7126229) 