const paypal = require("paypal-rest-sdk");


paypal.configure({
  'mode': 'sandbox', // or 'live' for production
  'client_id': 'YOUR_CLIENT_ID', // Your PayPal client ID
  'client_secret': 'YOUR_CLIENT_SECRET' // Your PayPal client secret
});


module.exports = paypal;
