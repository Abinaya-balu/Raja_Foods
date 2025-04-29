const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Directly read email credentials from .env file since environment variables aren't loading correctly
function getEnvValue(key, defaultValue = '') {
  try {
    const envPath = path.join(__dirname, '..', '..', '.env');
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

// Get email credentials from .env file
const EMAIL_USER = getEnvValue('EMAIL_USER');
const EMAIL_PASS = getEnvValue('EMAIL_PASS');
const SMTP_HOST = getEnvValue('SMTP_HOST');
const SMTP_PORT = getEnvValue('SMTP_PORT');
const SMTP_SECURE = getEnvValue('SMTP_SECURE');

// Configure transporter based on email provider
let transporterConfig;

// Check which email provider to use based on explicit settings or email address
if (SMTP_HOST && SMTP_PORT) {
  // Custom SMTP configuration
  transporterConfig = {
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: SMTP_SECURE === 'true',
    auth: {
      user: getEnvValue('SMTP_USER', EMAIL_USER),
      pass: getEnvValue('SMTP_PASS', EMAIL_PASS),
    },
    tls: {
      rejectUnauthorized: false, // Accept self-signed certificates
      timeout: 30000 // Increase timeout to 30 seconds
    },
    connectionTimeout: 30000, // Connection timeout in ms
    greetingTimeout: 30000 // Greeting timeout in ms
  };
  console.log(`Using custom SMTP configuration: ${SMTP_HOST}:${SMTP_PORT}`);
} else if (EMAIL_USER && EMAIL_USER.includes('@gmail.com')) {
  // Gmail configuration - using port 587 with TLS instead of 465 with SSL
  transporterConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Accept self-signed certificates
      timeout: 30000 // Increase timeout to 30 seconds
    },
    connectionTimeout: 30000, // Connection timeout in ms
    greetingTimeout: 30000 // Greeting timeout in ms
  };
  console.log('Using Gmail SMTP configuration with port 587 (TLS)');
} else {
  // Fallback to a generic configuration
  transporterConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Accept self-signed certificates
      timeout: 30000 // Increase timeout to 30 seconds
    },
    connectionTimeout: 30000, // Connection timeout in ms
    greetingTimeout: 30000 // Greeting timeout in ms
  };
  console.log('Using default email configuration with port 587 (TLS)');
}

// Add debug mode for troubleshooting
const NODE_ENV = getEnvValue('NODE_ENV');
if (NODE_ENV !== 'production') {
  transporterConfig.debug = true;
}

// Create the transporter
const transporter = nodemailer.createTransport(transporterConfig);

// Log configuration details (masking sensitive info)
console.log(`Email configuration: Using ${EMAIL_USER} for sending emails`);

/**
 * Send email notification about a new product to a list of users
 * @param {Array} users - Array of user objects with email and userName fields
 * @param {Object} product - Product object with details about the new product
 * @returns {Promise} - Promise that resolves when all emails are sent
 */
const sendNewProductNotification = async (users, product) => {
  try {
    console.log(`Attempting to send emails to ${users.length} users for product: ${product.title}`);
    
    // Verify transporter configuration
    try {
      const verifyResult = await transporter.verify();
      console.log('Transporter verification:', verifyResult);
    } catch (verifyError) {
      console.error('Transporter verification failed:', verifyError);
      throw new Error(`Email transporter verification failed: ${verifyError.message}`);
    }
    
    // Create an array of promises for each email to be sent
    const emailPromises = users.map(user => {
      console.log(`Preparing email for: ${user.email}`);
      
      const mailOptions = {
        from: `"Raja Oils" <${EMAIL_USER}>`,
        to: user.email,
        subject: `New Product Alert: ${product.title} is now available!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #4a4a4a; border-bottom: 1px solid #eee; padding-bottom: 10px;">Hello ${user.userName},</h2>
            <p style="color: #666;">We're excited to announce a new product in our collection!</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #3a3a3a; margin-top: 0;">${product.title}</h3>
              <p style="color: #666;">${product.description}</p>
              <p style="font-weight: bold; color: #4a4a4a;">Price: ₹${product.price}</p>
              ${product.salePrice ? `<p style="font-weight: bold; color: #e63946;">Sale Price: ₹${product.salePrice}</p>` : ''}
              <p style="color: #666;">Category: ${product.category}</p>
              <p style="color: #666;">Brand: ${product.brand}</p>
            </div>
            
            <p style="color: #666;">Visit our website to check out this new product and place your order while stocks last!</p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${getEnvValue('CLIENT_URL', 'http://localhost:3000')}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Shop Now</a>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">© ${new Date().getFullYear()} Raja Oils. All rights reserved.</p>
          </div>
        `
      };

      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(`Failed to send email to ${user.email}:`, error);
            reject(error);
          } else {
            console.log(`Email sent to ${user.email}:`, info.response);
            resolve(info);
          }
        });
      });
    });

    // Wait for all emails to be sent
    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Email sending complete. Successfully sent: ${successful}, Failed: ${failed}`);
    
    if (failed > 0) {
      const errors = results
        .filter(r => r.status === 'rejected')
        .map(r => r.reason)
        .slice(0, 3); // Log first 3 errors
      
      console.error('Sample of email errors:', errors);
    }
    
    return successful > 0;
  } catch (error) {
    console.error('Critical error sending new product notifications:', error);
    return false;
  }
};

/**
 * Send a booking confirmation email
 * @param {Object} booking - Booking object with details about the grinding session
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendBookingConfirmationEmail = async (booking) => {
  try {
    console.log(`Preparing to send booking confirmation email to: ${booking.email}`);
    
    // Verify transporter configuration
    try {
      const verifyResult = await transporter.verify();
      console.log('Transporter verification:', verifyResult);
    } catch (verifyError) {
      console.error('Transporter verification failed:', verifyError);
      throw new Error(`Email transporter verification failed: ${verifyError.message}`);
    }

    // Format date for better display
    const bookingDate = new Date(booking.date);
    const formattedDate = bookingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Get client URL from env or use default (port 5173 for Vite apps)
    const clientURL = getEnvValue('CLIENT_URL', 'http://localhost:5173');
    
    // Create email options
    const mailOptions = {
      from: `"Raja Oils Booking" <${EMAIL_USER}>`,
      to: booking.email,
      subject: 'Grinding Session Booking Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #4a4a4a; border-bottom: 1px solid #eee; padding-bottom: 10px;">Hello ${booking.name || 'Valued Customer'},</h2>
          <p style="color: #666;">Thank you for booking a grinding session with Raja Oils!</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="color: #3a3a3a; margin-top: 0;">Booking Details</h3>
            <p style="color: #666;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="color: #666;"><strong>Time Slot:</strong> ${booking.timeSlot}</p>
            ${booking.notes ? `<p style="color: #666;"><strong>Notes:</strong> ${booking.notes}</p>` : ''}
            <p style="color: #666;"><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">${booking.status}</span></p>
          </div>
          
          <p style="color: #666;">Please arrive 10 minutes before your scheduled time.</p>
          <p style="color: #666;">If you need to cancel or reschedule, please contact us at least 24 hours in advance.</p>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="${clientURL}/shop/grinding-bookings" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Booking Details</a>
          </div>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">© ${new Date().getFullYear()} Raja Oils. All rights reserved.</p>
        </div>
      `
    };

    // Send the email
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(`Failed to send booking confirmation email to ${booking.email}:`, error);
          reject(error);
        } else {
          console.log(`Booking confirmation email sent to ${booking.email}:`, info.response);
          resolve(info);
        }
      });
    });
  } catch (error) {
    console.error('Critical error sending booking confirmation email:', error);
    throw error;
  }
};

/**
 * Send a booking status update email
 * @param {Object} booking - Booking object with details about the grinding session
 * @param {String} previousStatus - The previous status of the booking
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendBookingStatusUpdateEmail = async (booking, previousStatus) => {
  try {
    console.log(`Preparing to send booking status update email to: ${booking.email}`);
    
    // Verify transporter configuration
    try {
      const verifyResult = await transporter.verify();
      console.log('Transporter verification:', verifyResult);
    } catch (verifyError) {
      console.error('Transporter verification failed:', verifyError);
      throw new Error(`Email transporter verification failed: ${verifyError.message}`);
    }

    // Format date for better display
    const bookingDate = new Date(booking.date);
    const formattedDate = bookingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Set status color based on the status
    let statusColor = '#4CAF50'; // Default green
    let statusMessage = '';
    
    if (booking.status === 'Approved') {
      statusColor = '#4CAF50'; // Green
      statusMessage = 'Your booking has been approved. We look forward to seeing you!';
    } else if (booking.status === 'Rejected') {
      statusColor = '#e63946'; // Red
      statusMessage = 'Unfortunately, your booking has been rejected. Please contact us for more information or to reschedule.';
    } else {
      statusColor = '#FFA500'; // Orange
      statusMessage = 'Your booking is currently pending approval.';
    }
    
    // Get client URL from env or use default (port 5173 for Vite apps)
    const clientURL = getEnvValue('CLIENT_URL', 'http://localhost:5173');
    
    // Create email options
    const mailOptions = {
      from: `"Raja Oils Booking" <${EMAIL_USER}>`,
      to: booking.email,
      subject: `Grinding Session Booking Update: ${booking.status}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #4a4a4a; border-bottom: 1px solid #eee; padding-bottom: 10px;">Hello ${booking.name || 'Valued Customer'},</h2>
          <p style="color: #666;">There has been an update to your grinding session booking.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="color: #3a3a3a; margin-top: 0;">Booking Status Update</h3>
            <p style="color: #666;"><strong>Previous Status:</strong> ${previousStatus}</p>
            <p style="color: #666;"><strong>New Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${booking.status}</span></p>
            <p style="color: #666;">${statusMessage}</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="color: #3a3a3a; margin-top: 0;">Booking Details</h3>
            <p style="color: #666;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="color: #666;"><strong>Time Slot:</strong> ${booking.timeSlot}</p>
            ${booking.notes ? `<p style="color: #666;"><strong>Notes:</strong> ${booking.notes}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="${clientURL}/shop/grinding-bookings" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Booking Details</a>
          </div>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">© ${new Date().getFullYear()} Raja Oils. All rights reserved.</p>
        </div>
      `
    };

    // Send the email
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(`Failed to send booking status update email to ${booking.email}:`, error);
          reject(error);
        } else {
          console.log(`Booking status update email sent to ${booking.email}:`, info.response);
          resolve(info);
        }
      });
    });
  } catch (error) {
    console.error('Critical error sending booking status update email:', error);
    throw error;
  }
};

/**
 * Send a verification email to newly registered users
 * @param {Object} user - User object with verification token
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendVerificationEmail = async (user) => {
  try {
    console.log(`Preparing to send verification email to: ${user.email}`);
    
    // Verify transporter configuration
    try {
      const verifyResult = await transporter.verify();
      console.log('Transporter verification:', verifyResult);
    } catch (verifyError) {
      console.error('Transporter verification failed:', verifyError);
      throw new Error(`Email transporter verification failed: ${verifyError.message}`);
    }
    
    // Get client URL from env or use default
    const clientURL = getEnvValue('CLIENT_URL', 'http://localhost:5173');
    const verificationLink = `${clientURL}/verify-email?token=${user.verificationToken}`;
    
    // Create email options
    const mailOptions = {
      from: `"Raja Oils" <${EMAIL_USER}>`,
      to: user.email,
      subject: 'Email Verification - Complete Your Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #4a4a4a; border-bottom: 1px solid #eee; padding-bottom: 10px;">Hello ${user.userName},</h2>
          <p style="color: #666;">Thank you for registering with Raja Oils!</p>
          
          <p style="color: #666;">Please click the button below to verify your email address and activate your account:</p>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
          </div>
          
          <p style="color: #666; margin-top: 20px;">If the button doesn't work, you can copy and paste the following link into your browser:</p>
          <p style="color: #666; word-break: break-all;"><a href="${verificationLink}">${verificationLink}</a></p>
          
          <p style="color: #666;">This verification link will expire in 24 hours.</p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">© ${new Date().getFullYear()} Raja Oils. All rights reserved.</p>
        </div>
      `
    };

    // Send the email
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(`Failed to send verification email to ${user.email}:`, error);
          reject(error);
        } else {
          console.log(`Verification email sent to ${user.email}:`, info.response);
          resolve(info);
        }
      });
    });
  } catch (error) {
    console.error('Critical error sending verification email:', error);
    throw error;
  }
};

/**
 * Send a refund notification email to the customer
 * @param {Object} order - Order object with details about the refunded order
 * @param {Object} user - User object with email and userName
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendRefundNotificationEmail = async (order, user) => {
  try {
    console.log(`Preparing to send refund notification email to: ${user.email}`);
    
    // Verify transporter configuration
    try {
      const verifyResult = await transporter.verify();
      console.log('Transporter verification:', verifyResult);
    } catch (verifyError) {
      console.error('Transporter verification failed:', verifyError);
      // Log error but don't stop the process
      console.log('Continuing despite transporter verification failure');
      // Return false to indicate email couldn't be sent, but don't throw error
      return false;
    }
    
    const date = new Date(order.refundDate || Date.now()).toLocaleDateString();
    const formattedAmount = parseFloat(order.refundAmount || order.totalAmount).toFixed(2);
    
    // Create email options
    const mailOptions = {
      from: `"Raja Oils Refund" <${EMAIL_USER}>`,
      to: user.email,
      subject: 'Refund Processed for Your Order',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #4a4a4a; border-bottom: 1px solid #eee; padding-bottom: 10px;">Hello ${user.userName || 'Valued Customer'},</h2>
          <p style="color: #666;">We've processed a refund for your recent order.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="color: #3a3a3a; margin-top: 0;">Refund Details</h3>
            <p style="color: #666;"><strong>Order ID:</strong> ${order._id}</p>
            <p style="color: #666;"><strong>Refund Amount:</strong> ₹${formattedAmount}</p>
            <p style="color: #666;"><strong>Refund Date:</strong> ${date}</p>
            <p style="color: #666;"><strong>Refund ID:</strong> ${order.refundId || 'N/A'}</p>
            ${order.refundNotes ? `<p style="color: #666;"><strong>Notes:</strong> ${order.refundNotes}</p>` : ''}
          </div>
          
          <p style="color: #666;">The refunded amount should be credited back to your original payment method. Depending on your bank or payment provider, this may take 3-10 business days to reflect in your account.</p>
          
          <p style="color: #666;">If you have any questions regarding this refund, please don't hesitate to contact our customer support.</p>
          
          <p style="color: #666;">Thank you for your understanding.</p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">© ${new Date().getFullYear()} Raja Oils. All rights reserved.</p>
        </div>
      `
    };

    // Send the email with improved error handling
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Refund notification email sent to ${user.email}:`, info.response);
      return true;
    } catch (emailError) {
      console.error(`Failed to send refund notification email to ${user.email}:`, emailError);
      // Log detailed error information to help with debugging
      console.error('Error details:', {
        errorName: emailError.name,
        errorMessage: emailError.message,
        errorCode: emailError.code,
        errorCommand: emailError.command
      });
      // Return false to indicate email couldn't be sent, but don't throw error
      return false;
    }
  } catch (error) {
    console.error('Critical error in sendRefundNotificationEmail function:', error);
    // Return false to indicate email couldn't be sent, but don't throw error
    return false;
  }
};

// Export all functions
module.exports = {
  sendNewProductNotification,
  sendBookingConfirmationEmail,
  sendBookingStatusUpdateEmail,
  sendVerificationEmail,
  sendRefundNotificationEmail,
  transporter
}; 