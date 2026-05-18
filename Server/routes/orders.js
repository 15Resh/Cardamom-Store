const express = require('express');
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/orders/my-orders ────────────────────────────────────────────────
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images weight')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT /api/orders/:id/status ── Admin only (NEW) ───────────────────────────
// Updates the simple 4-step trackingStatus shown to customers
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { trackingStatus } = req.body;
    const allowed = ['Pending', 'Packed', 'Shipped', 'Delivered'];

    if (!allowed.includes(trackingStatus)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowed.join(', ')}`
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { trackingStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, message: `Tracking status updated to "${trackingStatus}"`, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// ─────────────────────────────────────────────────────────────────────────────

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderId: req.params.id }],
      user: req.user._id
    }).populate('items.product', 'name images weight description');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
