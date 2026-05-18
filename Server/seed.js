const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User    = require('./models/User');
const Product = require('./models/Product');
const Coupon  = require('./models/Coupon');

dotenv.config();

// ── Products with variants ────────────────────────────────────────────────────
const products = [
  {
    name: 'Premium Green Cardamom',
    description: 'Hand-picked premium green cardamom from the lush hills of Kerala. Harvested at peak maturity for the finest aroma and flavour. Ideal for chai, biryanis, and desserts.',
    shortDescription: 'Hand-picked premium green cardamom, freshly harvested.',
    variants: [
      { weight: '50g',  price: 149, originalPrice: 199, stock: 150 },
      { weight: '100g', price: 269, originalPrice: 349, stock: 200 },
      { weight: '250g', price: 599, originalPrice: 799, stock: 100 },
    ],
    category: 'cardamom',
    images: [{ url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600', alt: 'Green Cardamom' }],
    stock: 450,
    features: ['100% Organic', 'Direct from Farm', 'No Preservatives', 'Hand-picked'],
    isFeatured: true,
    rating: { average: 4.8, count: 124 }
  },
  {
    name: 'Cardamom Powder',
    description: 'Freshly ground cardamom powder from our farm-fresh pods. Ground on the day of packaging to preserve maximum aroma. Perfect for baking, desserts, and quick cooking.',
    shortDescription: 'Freshly ground on the day of packaging.',
    variants: [
      { weight: '50g',  price: 179, originalPrice: 229, stock: 80 },
      { weight: '100g', price: 329, originalPrice: 429, stock: 60 },
    ],
    category: 'cardamom',
    images: [{ url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600', alt: 'Cardamom Powder' }],
    stock: 140,
    features: ['Freshly Ground', 'No Additives', 'Direct from Farm', 'Airtight Pack'],
    isFeatured: true,
    rating: { average: 4.6, count: 43 }
  },
  {
    name: 'Bold Black Cardamom',
    description: 'Large, smoky black cardamom pods sourced directly from high-altitude farms. Ideal for curries, rice dishes, and slow-cooked meats. Rich earthy flavour unlike any store-bought variety.',
    shortDescription: 'Smoky, bold flavour — perfect for curries and biryanis.',
    variants: [
      { weight: '50g',  price: 129, originalPrice: 169, stock: 90 },
      { weight: '100g', price: 239, originalPrice: 299, stock: 70 },
    ],
    category: 'cardamom',
    images: [{ url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600', alt: 'Black Cardamom' }],
    stock: 160,
    features: ['High Altitude Grown', 'Direct from Farm', 'Bold Flavour', 'Sun Dried'],
    isFeatured: true,
    rating: { average: 4.5, count: 31 }
  },
  {
    name: 'Cardamom Gift Bundle',
    description: 'The perfect gift for spice lovers! Includes Green Cardamom (100g) + Cardamom Powder (50g) + Black Cardamom (50g) in a beautiful farm-branded box.',
    shortDescription: 'Green + Powder + Black cardamom in a gift box.',
    variants: [
      { weight: '200g bundle', price: 499, originalPrice: 649, stock: 40 },
    ],
    category: 'cardamom',
    images: [{ url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600', alt: 'Cardamom Gift Bundle' }],
    stock: 40,
    features: ['Gift Ready', 'Farm Branded Box', 'Mixed Varieties', 'Free Shipping'],
    isFeatured: true,
    rating: { average: 4.9, count: 18 }
  }
]

const coupons = [
  {
    code: 'FIRST10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 200,
    maxDiscount: 50,
    usageLimit: 1000,
    isActive: true
  },
  {
    code: 'FARM50',
    discountType: 'fixed',
    discountValue: 50,
    minOrderAmount: 500,
    isActive: true
  }
]

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cardamom_store')
    console.log('✅ Connected to MongoDB')

    // Drop slug index to avoid duplicate key errors
    try {
      await mongoose.connection.collection('products').dropIndex('slug_1')
      console.log('🗑️  Dropped old slug index')
    } catch (e) {
      // Index doesn't exist — that's fine
    }

    await Product.deleteMany({})
    await Coupon.deleteMany({})
    console.log('🗑️  Cleared existing products and coupons')

    await Product.insertMany(products)
    console.log('🌿 Products with variants seeded successfully')

    await Coupon.insertMany(coupons)
    console.log('🎟️  Coupons seeded successfully')

    // Create admin if not exists
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@cardamomfarm.com' })
    if (!adminExists) {
      await User.create({
        name:     'Farm Admin',
        email:    process.env.ADMIN_EMAIL    || 'admin@cardamomfarm.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role:     'admin'
      })
      console.log('👤 Admin user created')
    } else {
      console.log('👤 Admin user already exists')
    }

    console.log('\n✅ Database seeded successfully!')
    console.log('📧 Admin:', process.env.ADMIN_EMAIL || 'admin@cardamomfarm.com')
    console.log('🔑 Password:', process.env.ADMIN_PASSWORD || 'Admin@123')
    console.log('\n🛍️  Products seeded:')
    products.forEach(p => {
      console.log(`   • ${p.name} — ${p.variants.map(v => `${v.weight} ₹${v.price}`).join(' | ')}`)
    })
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding error:', error.message)
    process.exit(1)
  }
}

seedDB()
