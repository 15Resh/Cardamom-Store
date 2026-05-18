# 🌿 Cardamom Farm — Full-Stack eCommerce Store

> Farm-fresh cardamom sold directly from farmer to customer.
> Built with React + Node.js + MongoDB + Razorpay.

---

## 📁 Project Structure

```
cardamom-store/
├── backend/                  ← Node.js + Express API
│   ├── config/
│   │   └── email.js          ← Nodemailer (order confirmation)
│   ├── middleware/
│   │   └── auth.js           ← JWT protect + adminOnly
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Coupon.js
│   ├── routes/
│   │   ├── auth.js           ← /api/auth/*
│   │   ├── products.js       ← /api/products/*
│   │   ├── orders.js         ← /api/orders/*
│   │   ├── payment.js        ← /api/payment/* (Razorpay)
│   │   ├── admin.js          ← /api/admin/*
│   │   └── coupons.js        ← /api/coupons/*
│   ├── server.js             ← Entry point
│   ├── seed.js               ← Seed DB with products + admin
│   └── package.json
│
└── frontend/                 ← React + Tailwind CSS (Vite)
    ├── public/
    │   └── favicon.svg
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── Footer.jsx
    │   │   │   └── ProductCard.jsx
    │   │   └── admin/
    │   │       └── AdminLayout.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx   ← JWT auth state
    │   │   └── CartContext.jsx   ← Cart state (localStorage)
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── ProductsPage.jsx
    │   │   ├── ProductDetail.jsx
    │   │   ├── CartPage.jsx
    │   │   ├── CheckoutPage.jsx  ← Razorpay integration
    │   │   ├── OrderSuccessPage.jsx
    │   │   ├── OrdersPage.jsx
    │   │   ├── OrderDetailPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── AboutPage.jsx
    │   │   └── admin/
    │   │       ├── AdminLogin.jsx
    │   │       ├── AdminDashboard.jsx
    │   │       ├── AdminProducts.jsx
    │   │       └── AdminOrders.jsx
    │   ├── utils/
    │   │   └── api.js            ← Axios instance with JWT
    │   ├── App.jsx               ← All routes
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

---

## ⚡ Quick Start (Local Development)

### Step 1 — Prerequisites
Install these once:
- **Node.js LTS** → https://nodejs.org
- **Git** → https://git-scm.com

### Step 2 — Create Free Accounts
| Service | URL | What for |
|---------|-----|----------|
| MongoDB Atlas | https://mongodb.com/atlas | Free cloud database |
| Razorpay | https://razorpay.com | Payment gateway |

### Step 3 — Backend Setup

```bash
cd cardamom-store/backend

# Install dependencies
npm install

# Create .env file (copy from .env.example and fill in your values)
cp .env.example .env
# → Edit .env with your MongoDB URI and Razorpay keys

# Seed the database (run once)
node seed.js

# Start backend (development)
npm run dev
# Server runs on http://localhost:5000
```

**Backend `.env` file:**
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/cardamom_store
JWT_SECRET=any_long_random_string_here
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_secret
FRONTEND_URL=http://localhost:5173
PORT=5000
ADMIN_EMAIL=admin@cardamomfarm.com
ADMIN_PASSWORD=Admin@123
```

### Step 4 — Frontend Setup

Open a **new terminal tab** (keep backend running):

```bash
cd cardamom-store/frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# → Edit .env with your Razorpay key

# Start frontend
npm run dev
# App opens at http://localhost:5173
```

**Frontend `.env` file:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
```

---

## 🌐 All Pages

| URL | Page |
|-----|------|
| `/` | Home — hero, products, testimonials |
| `/products` | All products with search & sort |
| `/products/:id` | Product detail + add to cart |
| `/cart` | Shopping cart |
| `/checkout` | Address + Razorpay payment |
| `/order-success/:id` | Order confirmation |
| `/orders` | My order history |
| `/orders/:id` | Order detail + tracking |
| `/login` | User login |
| `/register` | User registration |
| `/about` | Farmer story page |
| `/admin/login` | Admin login |
| `/admin` | Admin dashboard |
| `/admin/products` | Add/Edit/Delete products |
| `/admin/orders` | Manage all orders + status |

---

## 💳 Razorpay Test Details

Use these in the payment popup (test mode — no real money):

| Field | Value |
|-------|-------|
| Card number | `4111 1111 1111 1111` |
| Expiry | Any future date |
| CVV | Any 3 digits |
| UPI ID | `success@razorpay` |

---

## 🔑 Admin Access

After seeding (`node seed.js`):
- **URL:** http://localhost:5173/admin/login
- **Email:** admin@cardamomfarm.com
- **Password:** Admin@123

---

## 🎟️ Coupon Codes (seeded)

| Code | Discount |
|------|----------|
| `FIRST10` | 10% off (min order ₹200) |
| `FARM50` | ₹50 off (min order ₹500) |

---

## 🚀 Deployment

### Backend → Render (free)
1. Push code to GitHub
2. New Web Service → connect repo
3. Root Directory: `backend`
4. Build: `npm install` | Start: `npm start`
5. Add all `.env` variables in Render dashboard

### Frontend → Vercel (free)
1. New Project → connect repo
2. Root Directory: `frontend`
3. Framework: Vite
4. Add `VITE_API_URL` and `VITE_RAZORPAY_KEY_ID` env vars
5. Deploy

> After deploying, update `FRONTEND_URL` in Render to your Vercel URL.

---

## 🔐 Security Notes

- Passwords hashed with **bcryptjs**
- All sensitive routes protected by **JWT middleware**
- Razorpay payment signature **verified on backend**
- Admin routes protected by **role-based middleware**
- Never commit `.env` files — they're in `.gitignore`

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Payments | Razorpay |
| Email | Nodemailer (Gmail) |
| Icons | Lucide React |
| Hosting | Vercel + Render |

---

Made with 🌿 in Kerala
