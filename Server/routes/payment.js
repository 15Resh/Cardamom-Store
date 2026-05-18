// backend/routes/payment.js
// ─────────────────────────────────────────────────────────────────────────────
// ONLY CHANGE from original:
//   Line 1  — added require for sendWhatsAppNotifications
//   ~Line 90 — added 4-line WhatsApp call after order.save()
//   Everything else is IDENTICAL to your existing file
// ─────────────────────────────────────────────────────────────────────────────

const express  = require('express');
const Razorpay = require('razorpay');
const crypto   = require('crypto');
const { protect }                    = require('../middleware/auth');
const Order                          = require('../models/Order');
// ── NEW: import WhatsApp helper (1 line added) ────────────────────────────────
const { sendWhatsAppNotifications }  = require('../config/whatsapp');
// ─────────────────────────────────────────────────────────────────────────────

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ─── POST /api/payment/create-order ──────────────────────────────────────────
// Creates a Razorpay order — UNCHANGED
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount.' });
    }

    const options = {
      amount:   Math.round(amount * 100), // paise
      currency,
      receipt:  receipt || `receipt_${Date.now()}`,
      notes:    { userId: req.user._id.toString() }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success: true,
      order: {
        id:       razorpayOrder.id,
        amount:   razorpayOrder.amount,
        currency: razorpayOrder.currency
      },
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order.' });
  }
});

// ─── POST /api/payment/verify ─────────────────────────────────────────────────
// Verifies Razorpay signature, saves order — ONLY 4 LINES ADDED at the bottom
router.post('/verify', protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData
    } = req.body;

    // ── Verify Razorpay signature (UNCHANGED) ─────────────────────────────
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.'
      });
    }

    // ── Save order to database (UNCHANGED) ────────────────────────────────
    const order = await Order.create({
      user:            req.user._id,
      items:           orderData.items,
      shippingAddress: orderData.shippingAddress,
      pricing:         orderData.pricing,
      coupon:          orderData.coupon,
      payment: {
        method:              'razorpay',
        razorpayOrderId:     razorpay_order_id,
        razorpayPaymentId:   razorpay_payment_id,
        razorpaySignature:   razorpay_signature,
        status:              'paid',
        paidAt:              new Date()
      },
      orderStatus: 'confirmed',
      statusHistory: [
        { status: 'placed',    note: 'Order placed' },
        { status: 'confirmed', note: 'Payment confirmed' }
      ]
    });

    // ── Update product stock (UNCHANGED) ──────────────────────────────────
    const Product = require('../models/Product');
    for (const item of orderData.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // ── Send email confirmation (UNCHANGED) ───────────────────────────────
    try {
      const { sendOrderConfirmation } = require('../config/email');
      await sendOrderConfirmation(req.user.email, order);
    } catch (emailErr) {
      console.log('Email notification skipped:', emailErr.message);
    }

    // ── NEW: Send WhatsApp notifications (4 lines added) ──────────────────
    // Runs after order is fully saved — will NEVER break order flow if it fails
    try {
      await sendWhatsAppNotifications(order, req.user);
    } catch (waErr) {
      console.log('WhatsApp notification skipped:', waErr.message);
    }
    // ─────────────────────────────────────────────────────────────────────

    res.json({
      success:  true,
      message:  'Payment verified and order placed successfully!',
      orderId:  order.orderId,
      order
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Order creation failed.' });
  }
});

// ─── GET /api/payment/key ─────────────────────────────────────────────────────
router.get('/key', protect, (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

module.exports = router;
