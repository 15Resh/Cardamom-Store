const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendOrderConfirmation = async (email, order) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email not configured');
  }

  const transporter = createTransporter();

  const itemsList = order.items
    .map(item => `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name} (${item.weight})</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align:center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align:right;">₹${item.price * item.quantity}</td>
    </tr>`)
    .join('');

  const mailOptions = {
    from: `"Cardamom Farm 🌿" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Confirmed! #${order.orderId} - Cardamom Farm`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2d5a27, #4a7c59); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🌿 Cardamom Farm</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Order Confirmed!</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #2d5a27;">Thank you for your order!</h2>
          <p>Your order <strong>#${order.orderId}</strong> has been confirmed and will be processed shortly.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f0f7f0;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>${itemsList}</tbody>
          </table>
          
          <div style="text-align: right; margin-top: 10px;">
            <p style="font-size: 18px; font-weight: bold; color: #2d5a27;">Total: ₹${order.pricing.total}</p>
          </div>
          
          <div style="background: #f0f7f0; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <h3 style="margin-top: 0; color: #2d5a27;">Shipping Address</h3>
            <p style="margin: 0;">${order.shippingAddress.fullName}<br>
            ${order.shippingAddress.addressLine1}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
          </div>
          
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            We'll notify you when your order is shipped. Fresh cardamom from our farm to your doorstep! 🌱
          </p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOrderConfirmation };
