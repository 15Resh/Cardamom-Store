const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Note: Cart is stored on the frontend (localStorage) for simplicity.
// This route can be used for server-side cart persistence if needed.

// ─── GET /api/cart ────────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  res.json({ success: true, message: 'Cart is managed client-side.' });
});

module.exports = router;
