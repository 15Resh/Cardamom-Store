// backend/config/whatsapp.js
// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp notifications via Twilio WhatsApp API
// Called ONLY after order is saved — does NOT affect payment flow at all
// If keys are missing OR Twilio fails → logs silently, NEVER throws
// ─────────────────────────────────────────────────────────────────────────────

const sendWhatsAppNotifications = async (order, user) => {
  // ── Skip silently if Twilio is not configured ─────────────────────────────
  if (
    !process.env.TWILIO_ACCOUNT_SID  ||
    !process.env.TWILIO_AUTH_TOKEN   ||
    !process.env.TWILIO_WHATSAPP_FROM
  ) {
    console.log('📵 WhatsApp skipped: Twilio keys not set in .env');
    return;
  }

  try {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Twilio sandbox sender — format: whatsapp:+14155238886
    const from = `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`;

    // ── Build item list string ─────────────────────────────────────────────
    const itemSummary = order.items
      .map(i => `• ${i.name} (${i.weight || ''}) x${i.quantity} = ₹${i.price * i.quantity}`)
      .join('\n');

    // ─────────────────────────────────────────────────────────────────────────
    // 1. ADMIN NOTIFICATION
    // ─────────────────────────────────────────────────────────────────────────
    if (process.env.ADMIN_WHATSAPP_NUMBER) {
      const adminMsg =
        `🌿 *New Order Received!*\n\n` +
        `📦 *Order ID:* ${order.orderId}\n` +
        `👤 *Customer:* ${user.name}\n` +
        `📧 *Email:* ${user.email}\n` +
        `📱 *Phone:* ${order.shippingAddress?.phone || 'N/A'}\n\n` +
        `🛒 *Items Ordered:*\n${itemSummary}\n\n` +
        `💰 *Total Amount:* ₹${order.pricing.total}\n` +
        `🏷️ *Payment:* Razorpay (Paid)\n` +
        `📍 *Ship to:* ${order.shippingAddress?.city}, ${order.shippingAddress?.state} — ${order.shippingAddress?.pincode}\n` +
        `🕐 *Placed at:* ${new Date().toLocaleString('en-IN')}`;

      await client.messages.create({
        from,
        to:   `whatsapp:${process.env.ADMIN_WHATSAPP_NUMBER}`,  // e.g. +919876543210
        body: adminMsg
      });
      console.log('✅ WhatsApp admin notification sent');
    } else {
      console.log('⚠️  ADMIN_WHATSAPP_NUMBER not set — skipping admin notification');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. CUSTOMER CONFIRMATION
    //    Priority: use phone from shipping address, fallback to .env number
    // ─────────────────────────────────────────────────────────────────────────
    const rawPhone = order.shippingAddress?.phone || '';
    const cleaned  = rawPhone.replace(/\D/g, '').slice(-10); // keep last 10 digits
    const userPhone = cleaned.length === 10
      ? `+91${cleaned}`                          // auto-format Indian number
      : process.env.USER_WHATSAPP_NUMBER || '';  // fallback from .env

    if (userPhone) {
      const userMsg =
        `🌿 *Cardamom Farm — Order Confirmed!*\n\n` +
        `Hi ${user.name}! 👋\n\n` +
        `Your order has been placed successfully. ✅\n\n` +
        `🧾 *Order ID:* ${order.orderId}\n` +
        `💰 *Amount Paid:* ₹${order.pricing.total}\n` +
        `📦 *Status:* Pending\n\n` +
        `🛒 *Your Items:*\n${itemSummary}\n\n` +
        `📍 *Delivering to:*\n` +
        `${order.shippingAddress?.addressLine1},\n` +
        `${order.shippingAddress?.city}, ${order.shippingAddress?.state} — ${order.shippingAddress?.pincode}\n\n` +
        `⏱️ Estimated delivery: 3–6 business days\n\n` +
        `We'll notify you when your order is shipped! 🚚\n` +
        `Thank you for choosing Cardamom Farm 🌱`;

      await client.messages.create({
        from,
        to:   `whatsapp:${userPhone}`,
        body: userMsg
      });
      console.log('✅ WhatsApp customer confirmation sent to', userPhone);
    } else {
      console.log('⚠️  No customer phone found — skipping customer notification');
    }

  } catch (err) {
    // ── CRITICAL: never throw — order is already saved, just log the error ──
    console.error('❌ WhatsApp notification failed (order still saved):', err.message);
  }
};

module.exports = { sendWhatsAppNotifications };
