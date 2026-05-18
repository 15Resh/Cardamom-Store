import { Link } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const { items, itemCount, subtotal, updateQty, removeFromCart, cartKey } = useCart()

  if (itemCount === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
      <p className="text-gray-400 mb-6">Add some fresh cardamom to get started!</p>
      <Link to="/products" className="btn-primary">Browse Products</Link>
    </div>
  )

  const shipping = subtotal >= 500 ? 0 : 60
  const total    = subtotal + shipping

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart ({itemCount} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const key = item.cartKey || cartKey(item)
            const img = item.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200'
            return (
              <div key={key} className="card p-4 flex gap-4">
                <img src={img} alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                      {/* Show selected weight as a pill (NEW) */}
                      {item.weight && (
                        <span className="inline-block mt-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                          {item.weight}
                        </span>
                      )}
                    </div>
                    <button onClick={() => removeFromCart(key)}
                      className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Qty controls */}
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateQty(key, item.quantity - 1)}
                        className="px-3 py-1.5 hover:bg-gray-50 text-sm font-medium">−</button>
                      <span className="px-3 py-1.5 text-sm border-x border-gray-200">{item.quantity}</span>
                      <button onClick={() => updateQty(key, item.quantity + 1)}
                        className="px-3 py-1.5 hover:bg-gray-50 text-sm font-medium">+</button>
                    </div>
                    <span className="font-bold text-farm-green">₹{item.price * item.quantity}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0
                  ? <span className="text-green-600">Free</span>
                  : `₹${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">Add ₹{500 - subtotal} more for free shipping</p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className="text-farm-green text-lg">₹{total}</span>
              </div>
            </div>

            <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>

            <Link to="/products" className="block text-center text-sm text-farm-green mt-3 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
