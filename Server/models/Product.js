const mongoose = require('mongoose');

// ── Variant sub-schema ────────────────────────────────────────────────────────
const variantSchema = new mongoose.Schema({
  weight:        { type: String, required: true },
  price:         { type: Number, required: true },
  originalPrice: { type: Number, default: 0 },
  stock:         { type: Number, default: 100 }
}, { _id: false })

// ── Review sub-schema (NEW) ───────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, required: true },
  rating:    { type: Number, required: true, min: 1, max: 5 },
  comment:   { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
})
// ─────────────────────────────────────────────────────────────────────────────

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  shortDescription: {
    type: String,
    default: ''
  },
  variants: {
    type: [variantSchema],
    default: []
  },
  price:         { type: Number, default: 0 },
  originalPrice: { type: Number, default: 0 },
  weight:        { type: String, default: '' },
  category:      { type: String, default: 'cardamom' },
  images: [{ url: String, alt: String }],
  stock: {
    type: Number,
    min: [0, 'Stock cannot be negative'],
    default: 100
  },

  // ── reviews array (NEW) ───────────────────────────────────────────────────
  reviews: {
    type: [reviewSchema],
    default: []
  },
  // ── rating auto-calculated from reviews (NEW) ─────────────────────────────
  rating: {
    average: { type: Number, default: 0 },
    count:   { type: Number, default: 0 }
  },
  // ─────────────────────────────────────────────────────────────────────────

  features:   [String],
  isActive:   { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  createdAt:  { type: Date,    default: Date.now }
})

// Auto-generate slug + sync base price from first variant
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }
  if (this.variants && this.variants.length > 0) {
    this.price         = this.variants[0].price
    this.originalPrice = this.variants[0].originalPrice || 0
    this.weight        = this.variants[0].weight
  }
  // Recalculate average rating whenever reviews change (NEW)
  if (this.isModified('reviews')) {
    if (this.reviews.length === 0) {
      this.rating.average = 0
      this.rating.count   = 0
    } else {
      const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0)
      this.rating.average = Math.round((sum / this.reviews.length) * 10) / 10
      this.rating.count   = this.reviews.length
    }
  }
  next()
})

module.exports = mongoose.model('Product', productSchema)
