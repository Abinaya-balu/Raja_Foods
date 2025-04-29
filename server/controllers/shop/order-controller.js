const paypal = require("../../helpers/paypal");
const razorpay = require("../../helpers/razorpay");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const crypto = require('crypto');
const axios = require("axios");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
    } = req.body;

    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:5173/shop/paypal-return",
        cancel_url: "http://localhost:5173/shop/paypal-cancel",
      },
      transactions: [
        {
          item_list: {
            items: cartItems.map((item) => ({
              name: item.title,
              sku: item.productId,
              price: item.price.toFixed(2),
              currency: "USD",
              quantity: item.quantity,
            })),
          },
          amount: {
            currency: "USD",
            total: totalAmount.toFixed(2),
          },
          description: "description",
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
        console.log(error);

        return res.status(500).json({
          success: false,
          message: "Error while creating paypal payment",
        });
      } else {
        const newlyCreatedOrder = new Order({
          userId,
          cartId,
          cartItems,
          addressInfo,
          orderStatus,
          paymentMethod,
          paymentStatus,
          totalAmount,
          orderDate,
          orderUpdateDate,
          paymentId,
          payerId,
        });

        await newlyCreatedOrder.save();

        const approvalURL = paymentInfo.links.find(
          (link) => link.rel === "approval_url"
        ).href;

        res.status(201).json({
          success: true,
          approvalURL,
          orderId: newlyCreatedOrder._id,
        });
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Not enough stock for this product ${product.title}`,
        });
      }

      product.totalStock -= item.quantity;

      await product.save();
    }

    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`Fetching orders for user ID: "${userId}"`);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Add strict matching for userId to prevent accidental matches
    const orders = await Order.find({ userId: userId.toString() }).sort({ orderDate: -1 });
    
    console.log(`Found ${orders.length} orders for user ${userId}`);
    
    // Log first few orders for debugging
    if (orders.length > 0) {
      console.log("Sample order data:", {
        orderId: orders[0]._id,
        userId: orders[0].userId,
        orderStatus: orders[0].orderStatus,
        paymentMethod: orders[0].paymentMethod
      });
    }

    // Return empty array instead of 404 when no orders are found
    return res.status(200).json({
      success: true,
      data: orders
    });
  } catch (e) {
    console.error("Error fetching orders:", e);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: e.message
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

// Create order without payment gateway (cash on delivery or invoice)
const createOrderWithoutPayment = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      paymentMethod,
      totalAmount,
      cartId,
    } = req.body;

    // Create new order with confirmed status
    const newOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus: "confirmed", // Mark as confirmed immediately
      paymentMethod: paymentMethod || "invoice", // Default to invoice
      paymentStatus: "pending", // Payment pending but order confirmed
      totalAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    });

    await newOrder.save();

    // Update product stock
    for (let item of cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.title}`,
        });
      }

      product.totalStock -= item.quantity;
      await product.save();
    }

    // Clear the cart
    if (cartId) {
      await Cart.findByIdAndDelete(cartId);
    }

    // Generate invoice/receipt number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: {
        order: newOrder,
        invoiceNumber: invoiceNumber
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// Get Razorpay key directly from .env file
function getEnvValue(key, defaultValue = '') {
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '..', '..', '..', '.env');
    if (!fs.existsSync(envPath)) {
      console.error('ERROR: .env file not found at', envPath);
      return defaultValue;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      if (line.trim().startsWith(`${key}=`)) {
        return line.substring(key.length + 1).trim();
      }
    }
    
    return defaultValue;
  } catch (error) {
    console.error('ERROR reading .env file:', error.message);
    return defaultValue;
  }
}

// Create Razorpay order
const createRazorpayOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      totalAmount,
      cartId,
    } = req.body;

    console.log('Creating Razorpay order with amount:', totalAmount);

    // Create a Razorpay order
    const options = {
      amount: Math.round(totalAmount * 100), // Amount in paise (Razorpay expects amount in smallest currency unit)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1 // Auto-capture payment
    };

    console.log('Razorpay order options:', options);

    try {
      // Create order in Razorpay
      const razorpayOrder = await razorpay.orders.create(options);
      console.log('Razorpay order created:', razorpayOrder);

      // Create order in our database with pending status
      const newOrder = new Order({
        userId,
        cartId,
        cartItems,
        addressInfo,
        orderStatus: "pending",
        paymentMethod: "razorpay",
        paymentStatus: "pending",
        totalAmount,
        orderDate: new Date(),
        orderUpdateDate: new Date(),
        razorpayOrderId: razorpayOrder.id,
      });

      await newOrder.save();
      console.log('Order saved to database with ID:', newOrder._id);

      // Get Razorpay key from .env file
      const razorpayKeyId = getEnvValue('RAZORPAY_KEY_ID', 'rzp_test_eWp4sZ6kX2ButP');

      res.status(201).json({
        success: true,
        message: "Razorpay order created successfully",
        data: {
          order: newOrder,
          razorpayOrder: {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency
          },
          key: razorpayKeyId
        }
      });
    } catch (razorpayError) {
      console.error('Razorpay order creation error:', razorpayError);
      res.status(500).json({
        success: false,
        message: "Error creating Razorpay order",
        error: razorpayError.message
      });
    }
  } catch (e) {
    console.error('Server error in createRazorpayOrder:', e);
    res.status(500).json({
      success: false,
      message: "Error processing order request",
      error: e.message
    });
  }
};

// Verify Razorpay payment
const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId
    } = req.body;

    // Get Razorpay secret key directly from .env
    const razorpayKeySecret = getEnvValue('RAZORPAY_KEY_SECRET', 'RMbi0aO8WtcIJEBQCqcpfT1Q');

    // Verify the payment signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(body)
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpaySignature;

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature"
      });
    }

    // Find the order
    let order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Update order status
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;

    // Update product stock
    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.title}`
        });
      }

      product.totalStock -= item.quantity;
      await product.save();
    }

    // Clear the cart
    if (order.cartId) {
      await Cart.findByIdAndDelete(order.cartId);
    }

    await order.save();

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        order: order,
        invoiceNumber: invoiceNumber
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: e.message
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
  createOrderWithoutPayment,
  createRazorpayOrder,
  verifyRazorpayPayment
};
