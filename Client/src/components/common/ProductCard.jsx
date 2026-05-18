import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  // ── Variant state (NEW) ───────────────────────────────────────────────────
  const hasVariants = product.variants && product.variants.length > 0
  const [selectedVariant, setSelectedVariant] = useState(
    hasVariants ? product.variants[0] : null
  )
  const currentPrice    = hasVariants ? selectedVariant.price         : product.price
  const currentOriginal = hasVariants ? selectedVariant.originalPrice : product.originalPrice
  const currentWeight   = hasVariants ? selectedVariant.weight        : product.weight
  // ─────────────────────────────────────────────────────────────────────────

  const discount = currentOriginal > currentPrice
    ? Math.round(((currentOriginal - currentPrice) / currentOriginal) * 100)
    : 0

  const img = product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400'

  const handleAdd = (e) => {
    e.preventDefault()
    // Pass selected variant info into cart (UPDATED)
    addToCart({
      ...product,
      price:           currentPrice,
      originalPrice:   currentOriginal,
      weight:          currentWeight,
      selectedVariant: selectedVariant
    })
    toast.success(`${product.name} (${currentWeight}) added to cart!`)
  }

  return (
    <Link to={`/products/${product._id}`}
      className="card group hover:shadow-md transition-all duration-300 overflow-hidden block">

      {/* Image */}
      <div className="relative overflow-hidden bg-green-50 h-48">
        <img src={img} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400' }}
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            {discount}% OFF
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2">{product.name}</h3>

        {/* Rating */}
        {product.rating?.average > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-500">
              {product.rating.average} ({product.rating.count})
            </span>
          </div>
        )}

        {/* ── Variant selector pills (NEW) ──────────────────────────────── */}
        {hasVariants ? (
          <div className="flex flex-wrap gap-1.5 mb-3" onClick={e => e.preventDefault()}>
            {product.variants.map((v) => (
              <button
                key={v.weight}
                onClick={(e) => { e.preventDefault(); setSelectedVariant(v) }}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                  ${selectedVariant?.weight === v.weight
                    ? 'bg-farm-green text-white border-farm-green'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-farm-green hover:text-farm-green'
                  }`}
              >
                {v.weight}
              </button>
            ))}
          </div>
        ) : (
          /* fallback for old products without variants */
          product.weight && (
            <span className="badge-green inline-block mb-3">{product.weight}</span>
          )
        )}
        {/* ─────────────────────────────────────────────────────────────── */}

        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.shortDescription}</p>

        {/* Price + Add to cart */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-farm-green font-bold text-lg">₹{currentPrice}</span>
            {currentOriginal > currentPrice && (
              <span className="text-gray-400 text-xs line-through ml-1.5">₹{currentOriginal}</span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="flex items-center gap-1.5 bg-farm-green text-white px-3 py-1.5 rounded-lg text-xs
                       font-medium hover:bg-farm-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>
    </Link>
  )
}
