# Email Verification System Documentation

This document explains how the email verification system works in the Raja Oils application.

## Features

- Users must verify their email address after registration before they can log in
- Verification links are sent via email and expire after 24 hours
- Users can request a new verification email if needed
- Clean UI for verification process

## Technical Implementation

### User Model

The User schema has been extended with the following fields:

```javascript
isVerified: {
  type: Boolean,
  default: false,
},
verificationToken: {
  type: String,
},
verificationTokenExpires: {
  type: Date,
}
```

### Registration Flow

1. When a user registers, their account is created with `isVerified: false`
2. A random verification token is generated and stored along with an expiration date
3. A verification email is sent to the user's email address with a link containing the token
4. User is informed that they need to verify their email to continue

### Verification Process

1. When the user clicks the verification link, they are taken to `/verify-email?token=<token>`
2. The frontend makes a request to `/api/auth/verify-email/<token>` endpoint
3. The backend validates the token and marks the user as verified if valid
4. The user is redirected to the login page after successful verification

### Login Restriction

The login endpoint checks if the user's email is verified before allowing login:

```javascript
// Check if the user's email is verified
if (!checkUser.isVerified) {
  return res.json({
    success: false,
    message: "Please verify your email address before logging in.",
  });
}
```

### Resending Verification Emails

If a user doesn't receive the verification email or the link expires:

1. They can request a new verification email from the verification page
2. The system generates a new token and updates the expiration date
3. A new verification email is sent to the user

## API Endpoints

- `POST /api/auth/register` - Register and generate verification token
- `GET /api/auth/verify-email/:token` - Verify an email address with token
- `POST /api/auth/resend-verification` - Resend verification email

## Testing

Use the following test scripts to test the verification system:

- `test-verification-email-simple.js` - Test email sending without MongoDB
- `test-verification-email.js` - Complete test with database integration

## Security Considerations

- Verification tokens are stored as hashed values
- Tokens expire after 24 hours for security
- Email addresses must be verified before any login is allowed 