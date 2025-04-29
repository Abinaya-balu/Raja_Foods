const Order = require("../../models/Order");
const User = require("../../models/User");
const razorpay = require("../../helpers/razorpay");
const { sendRefundNotificationEmail } = require("../../helpers/email");

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({});

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
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

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    await Order.findByIdAndUpdate(id, { 
      orderStatus,
      orderUpdateDate: new Date()
    });

    res.status(200).json({
      success: true,
      message: "Order status is updated successfully!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

// Process refund for orders
const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundAmount, refundNotes } = req.body;
    // Use optional chaining to handle cases where req.user might be undefined
    const adminId = req?.user?.id || 'system'; // Default to 'system' if req.user.id is undefined

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    // Check if order is already refunded
    if (order.refundStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: "This order has already been refunded!",
      });
    }

    // Check if order is canceled or rejected
    if (order.orderStatus !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: "Only canceled or rejected orders can be refunded!",
      });
    }

    // Check if order is paid before allowing refund
    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: "Only paid orders can be refunded!",
      });
    }

    let refundId = null;

    // Process the refund based on payment gateway
    if (order.paymentMethod === 'razorpay' && order.razorpayPaymentId) {
      try {
        console.log(`Initiating Razorpay refund for payment ID: ${order.razorpayPaymentId}`);
        const refundAmount = parseFloat(req.body.refundAmount) || order.totalAmount;
        const amountInPaise = Math.round(refundAmount * 100); // Convert to paise
        
        console.log(`Refund amount: ${refundAmount} INR (${amountInPaise} paise)`);
        
        // Process Razorpay refund
        const refundResponse = await razorpay.payments.refund(order.razorpayPaymentId, {
          amount: amountInPaise,
          notes: {
            reason: refundNotes || "Order canceled - admin initiated refund",
            orderId: order._id.toString()
          }
        });
        
        // Validate the refund response
        if (!refundResponse || !refundResponse.id) {
          console.error('Invalid response from Razorpay:', refundResponse);
          throw new Error('Invalid response received from Razorpay');
        }
        
        refundId = refundResponse.id;
        console.log('Razorpay refund processed successfully:', refundResponse);
        
        // Additional verification - fetch the refund to confirm it exists
        try {
          const verifyRefund = await razorpay.refunds.fetch(refundId);
          console.log('Refund verification successful:', verifyRefund);
        } catch (verifyError) {
          console.warn('Refund verification warning:', verifyError.message);
          // Continue despite verification issue - the refund might still have been created
        }
      } catch (refundError) {
        console.error('Razorpay refund error:', refundError);
        
        // Detailed error logging
        if (refundError.response && refundError.response.data) {
          console.error('Razorpay API error details:', refundError.response.data);
        }
        
        return res.status(500).json({
          success: false,
          message: `Refund processing failed: ${refundError.message}`,
          errorDetails: refundError.response?.data || {}
        });
      }
    } else if (order.paymentMethod === 'paypal' && order.paymentId) {
      // For PayPal, you would integrate with their refund API
      // This is a placeholder - actual implementation would depend on your PayPal integration
      refundId = `manual_${Date.now()}`;
    } else {
      // For COD and invoice payments, record as manual refund
      refundId = `manual_${Date.now()}`;
      console.log(`Manual refund recorded for ${order.paymentMethod} order:`, order._id);
    }

    // Update order with refund information
    const updatedOrder = await Order.findByIdAndUpdate(id, {
      refundStatus: 'completed',
      refundDate: new Date(),
      refundAmount: refundAmount || order.totalAmount,
      refundId: refundId,
      refundNotes: refundNotes || "Admin initiated refund",
      refundedBy: adminId
    }, { new: true });

    // Send notification email to the customer
    try {
      // Get the user to send the email notification
      const user = await User.findById(order.userId);
      
      if (user && user.email) {
        // Send refund notification email - don't await or throw errors
        const emailResult = await sendRefundNotificationEmail(updatedOrder, user);
        if (emailResult) {
          console.log(`Refund notification email sent to ${user.email}`);
        } else {
          console.warn(`Refund completed but email notification failed for user: ${user.email}`);
        }
      } else {
        console.log(`Could not send refund notification email - user not found for ID: ${order.userId}`);
      }
    } catch (emailError) {
      // Don't fail the entire process if email sending fails
      console.error('Failed to send refund notification email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: "Refund processed successfully!",
      refundId: refundId
    });
  } catch (e) {
    console.error('Error processing refund:', e);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the refund!",
      error: e.message
    });
  }
};

// Update payment status of an order
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    // Validate payment status
    if (!["pending", "paid", "failed"].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status! Allowed values: pending, paid, failed",
      });
    }

    await Order.findByIdAndUpdate(id, { 
      paymentStatus,
      orderUpdateDate: new Date()
    });

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully!",
    });
  } catch (e) {
    console.error("Error updating payment status:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  processRefund,
  updatePaymentStatus
};
