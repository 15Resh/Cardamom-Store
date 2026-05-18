import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Star, Check, ArrowLeft, Leaf } from 'lucide-react'
import API from '../utils/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { id }        = useParams()
  const { addToCart } = useCart()
  const { user }      = useAuth()   // (NEW) to check login + prefill name
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty]         = useState(1)
  const [added, setAdded]     = useState(false)

  // ── Review state (NEW) ────────────────────────────────────────────────────
  const [reviewRating,  setReviewRating]  = useState(0)
  const [reviewHover,   setReviewHover]   = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submitting,    setSubmitting]    = useState(false)

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Please login to submit a review'); return }
    if (reviewRating === 0) { toast.error('Please select a star rating'); return }
    if (!reviewComment.trim()) { toast.error('Please write a comment'); return }
    setSubmitting(true)
    try {
      const { data } = await API.post(`/products/${id}/review`, {
        rating:  reviewRating,
        comment: reviewComment
      })
      // Update product reviews + rating in state without refetching
      setProduct(p => ({ ...p, reviews: data.reviews, rating: data.rating }))
      setReviewRating(0)
      setReviewComment('')
      toast.success('Review submitted! Thank you 🌿')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    }
    setSubmitting(false)
  }

  // Check if current user already reviewed this product
  const alreadyReviewed = product?.reviews?.some(
    r => r.userId === user?._id || r.userId?.toString() === user?._id
  )
  // ─────────────────────────────────────────────────────────────────────────

  // ── Variant state (NEW) ───────────────────────────────────────────────────
  const hasVariants = product?.variants && product.variants.length > 0
  const [selectedVariant, setSelectedVariant] = useState(null)

  // Set first variant when product loads
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0])
    }
  }, [product])

  const currentPrice    = hasVariants ? selectedVariant?.price         : product?.price
  const currentOriginal = hasVariants ? selectedVariant?.originalPrice : product?.originalPrice
  const currentWeight   = hasVariants ? selectedVariant?.weight        : product?.weight
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    API.get(`/products/${id}`)
      .then(r => setProduct(r.data.product))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleAdd = () => {
    addToCart({
      ...product,
      price:           currentPrice,
      originalPrice:   currentOriginal,
      weight:          currentWeight,
      selectedVariant: selectedVariant
    }, qty)
    toast.success(`${product.name} (${currentWeight}) added to cart!`)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-16 flex justify-center">
      <div className="w-10 h-10 border-4 border-farm-green border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!product) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Product not found</p>
      <Link to="/products" className="text-farm-green underline mt-2 block">← Back to products</Link>
    </div>
  )

  const img = product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800'

  const discount = currentOriginal > currentPrice
    ? Math.round(((currentOriginal - currentPrice) / currentOriginal) * 100)
    : 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-farm-green mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="relative rounded-2xl overflow-hidden bg-green-50">
          <img src={img} alt={product.name} className="w-full h-96 object-cover"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800' }} />
          {discount > 0 && (
            <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-lg">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

          {product.rating?.average > 0 && (
            <div className="flex items-center gap-1.5 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i}
                  className={`w-4 h-4 ${i < Math.round(product.rating.average)
                    ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
              ))}
              <span className="text-sm text-gray-500">({product.rating.count} reviews)</span>
            </div>
          )}

          {/* ── Variant selector (NEW) ──────────────────────────────────── */}
          {hasVariants && (
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Select Weight:
                <span className="ml-2 text-farm-green font-semibold">{currentWeight}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.weight}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all
                      ${selectedVariant?.weight === v.weight
                        ? 'bg-farm-green text-white border-farm-green shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-farm-green hover:text-farm-green'
                      }`}
                  >
                    {v.weight}
                    <span className="ml-1.5 opacity-80">₹{v.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* ─────────────────────────────────────────────────────────────── */}

          {/* Price — updates dynamically with variant selection */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-farm-green">₹{currentPrice}</span>
            {currentOriginal > currentPrice && (
              <span className="text-gray-400 text-lg line-through">₹{currentOriginal}</span>
            )}
            {discount > 0 && (
              <span className="text-red-500 text-sm font-medium">Save {discount}%</span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {/* Features */}
          {product.features?.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-6">
              {product.features.map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-farm-green flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm text-green-700 mb-6">
            <Leaf className="w-4 h-4" />
            <span>
              {hasVariants
                ? `In stock (${selectedVariant?.stock ?? product.stock} available)`
                : `In stock (${product.stock} available)`
              }
            </span>
          </div>

          {/* Qty + Add to cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                className="px-4 py-3 hover:bg-gray-50 text-lg font-medium">−</button>
              <span className="px-5 py-3 font-medium border-x border-gray-300">{qty}</span>
              <button onClick={() => setQty(q => Math.min(10, q + 1))}
                className="px-4 py-3 hover:bg-gray-50 text-lg font-medium">+</button>
            </div>

            <button onClick={handleAdd}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all
                ${added ? 'bg-green-600 text-white' : 'bg-farm-green text-white hover:bg-farm-light'}`}>
              {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              {added ? 'Added!' : 'Add to Cart'}
            </button>
          </div>

          <Link to="/checkout"
            className="block text-center mt-3 bg-farm-gold text-white py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors">
            Buy Now
          </Link>
        </div>
      </div>

      {/* ── Reviews Section (NEW) ─────────────────────────────────────────── */}
      <div className="mt-16">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          Customer Reviews
          {product.rating?.count > 0 && (
            <span className="text-base font-normal text-gray-500">
              ({product.rating.count} review{product.rating.count !== 1 ? 's' : ''})
            </span>
          )}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: average + write review form */}
          <div className="lg:col-span-1">

            {/* Average rating display */}
            {product.rating?.count > 0 && (
              <div className="card p-5 text-center mb-5">
                <p className="text-5xl font-bold text-farm-green mb-1">
                  {product.rating.average}
                </p>
                <div className="flex justify-center gap-0.5 mb-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-5 h-5 ${
                      s <= Math.round(product.rating.average)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-200'
                    }`} />
                  ))}
                </div>
                <p className="text-sm text-gray-400">
                  {product.rating.count} verified review{product.rating.count !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Write a review form */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">
                {alreadyReviewed ? '✅ You reviewed this product' : 'Write a Review'}
              </h3>

              {!user ? (
                <p className="text-sm text-gray-500">
                  <Link to="/login" className="text-farm-green font-medium hover:underline">Login</Link>
                  {' '}to write a review
                </p>
              ) : alreadyReviewed ? (
                <p className="text-sm text-gray-400">
                  You have already submitted a review for this product.
                </p>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Star rating picker */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Your Rating *</label>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <button
                          key={s}
                          type="button"
                          onMouseEnter={() => setReviewHover(s)}
                          onMouseLeave={() => setReviewHover(0)}
                          onClick={() => setReviewRating(s)}
                          className="focus:outline-none"
                        >
                          <Star className={`w-7 h-7 transition-colors ${
                            s <= (reviewHover || reviewRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`} />
                        </button>
                      ))}
                    </div>
                    {reviewRating > 0 && (
                      <p className="text-xs text-farm-green mt-1">
                        {['','Poor','Fair','Good','Very Good','Excellent'][reviewRating]}
                      </p>
                    )}
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Your Comment *</label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      className="input-field text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2"
                  >
                    {submitting
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Submitting…</>
                      : '⭐ Submit Review'
                    }
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right: list of reviews */}
          <div className="lg:col-span-2 space-y-4">
            {!product.reviews || product.reviews.length === 0 ? (
              <div className="card p-8 text-center text-gray-400">
                <Star className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm">No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              [...product.reviews].reverse().map((review, i) => (
                <div key={i} className="card p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {/* Avatar circle with initial */}
                      <div className="w-8 h-8 bg-farm-green text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {review.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{review.name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    {/* Stars */}
                    <div className="flex gap-0.5 flex-shrink-0">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3.5 h-3.5 ${
                          s <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-200'
                        }`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* ───────────────────────────────────────────────────────────────────── */}

    </div>
  )
}
