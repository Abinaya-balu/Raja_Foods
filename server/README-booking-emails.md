# Booking Email Notification System

This document explains the booking email notification system for Raja Oils website. The system sends emails to customers when they make a booking and when the booking status changes.

## Features

The booking email system provides the following notifications:

1. **Booking Confirmation Emails**
   - Sent immediately when a customer creates a new booking
   - Contains all booking details including date, time slot, and booking status

2. **Booking Status Update Emails**
   - Sent when an admin changes the status of a booking
   - Shows both the previous and new status
   - Contains custom messages based on the new status (Approved/Rejected)

## How It Works

The email system uses the same reliable infrastructure as the product notification system:

1. The `email.js` helper module contains the email sending functions
2. Emails are sent using nodemailer with proper HTML templates
3. Email credentials are securely read from the .env file
4. Robust error handling prevents booking operations from failing if emails fail

## Email Functions

### Booking Confirmation Email

```javascript
sendBookingConfirmationEmail(booking)
```

This function sends a confirmation email to the customer when they make a new booking. It includes:
- Booking details (date, time, notes)
- Current status (usually "Pending")
- Links to view their bookings

### Booking Status Update Email

```javascript
sendBookingStatusUpdateEmail(booking, previousStatus)
```

This function sends an email when a booking's status changes:
- Shows the previous and new status
- Displays a different message depending on whether the booking was approved or rejected
- Includes all booking details

## Booking Routes

The booking routes have been updated to use these email functions:

1. `POST /bookings` - Creates a new booking and sends a confirmation email
2. `PUT /bookings/:id/status` - Updates a booking's status and sends a status update email

## Testing

You can test the booking email functionality using the provided test script:

```
node test-booking-email.js
```

This script tests:
1. Booking confirmation emails
2. Approval notification emails
3. Rejection notification emails

## Customization

To customize the email templates:

1. Open `server/helpers/email.js`
2. Find the `sendBookingConfirmationEmail` or `sendBookingStatusUpdateEmail` functions
3. Edit the HTML template in the `mailOptions.html` property

## Troubleshooting

If booking emails are not being sent:

1. Make sure your email configuration is correct in the .env file
2. Run the test script to verify email functionality
3. Check the server logs for any error messages
4. Verify that the booking object contains a valid email address

## Best Practices

- Keep the HTML email templates responsive and mobile-friendly
- Use clear subject lines that explain the purpose of the email
- Always include booking details and next steps in confirmation emails 