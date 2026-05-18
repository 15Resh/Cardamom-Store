import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CreditCard, MapPin, Tag, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import API from '../utils/api'
import toast from 'react-hot-toast'

const EMPTY_ADDR = {
  fullName: '', phone: '', addressLine1: '', addressLine2: '',
  city: '', state: '', pincode: ''
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()

  const [addr, setAddr]         = useState(EMPTY_ADDR)
  const [couponCode, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [couponLoading, setCouponLoading] = useState(false)

  const shipping = (subtotal - discount) >= 500 ? 0 : 60
  const total    = subtotal - discount + shipping

  if (items.length === 0) return (
    <div className="text-center py-24">
      <p className="text-gray-500 mb-4">Your cart is empty</p>
      <Link to="/products" className="btn-primary">Shop Now</Link>
    </div>
  )

  const updateAddr = (e) => setAddr(a => ({ ...a, [e.target.name]: e.target.value }))

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const { data } = await API.post('/coupons/apply', { code: couponCode, orderAmount: subtotal })
      setDiscount(data.discount)
      setCouponApplied(data.coupon)
      toast.success(`Coupon applied! You saved ₹${data.discount}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon')
    }
    setCouponLoading(false)
  }

  const removeCoupon = () => {
    setDiscount(0); setCouponApplied(null); setCoupon('')
  }

  // ── Razorpay payment flow ──────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    // Validate address
    const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode']
    for (const field of required) {
      if (!addr[field].trim()) {
        toast.error(`Please enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
        return
      }
    }

    setLoading(true)
    try {
      // Step 1: Create Razorpay order from backend
      const { data: orderData } = await API.post('/payment/create-order', { amount: total })

      // Step 2: Open Razorpay checkout popup
      const options = {
        key:      orderData.key,
        amount:   orderData.order.amount,
        currency: orderData.order.currency,
        order_id: orderData.order.id,
        name:     'Cardamom Farm',
        description: 'Fresh Cardamom Purchase',
        image:    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=100',
        prefill: {
          name:    user.name,
          email:   user.email,
          contact: addr.phone
        },
        theme: { color: '#2d5a27' },

        // Step 3: On payment success, verify on backend
        handler: async (response) => {
          try {
            const orderPayload = {
              items: items.map(i => ({
                product:  i._id,
                name:     i.name,
                price:    i.price,
                weight:   i.weight,
                quantity: i.quantity,
                image:    i.images?.[0]?.url || ''
              })),
              shippingAddress: addr,
              pricing: { subtotal, discount, shipping, total },
              coupon: couponApplied ? { code: couponApplied.code, discount } : undefined
            }

            const { data: verifyData } = await API.post('/payment/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              orderData: orderPayload
            })

            // Step 4: Clear cart and redirect to success page
            clearCart()
            navigate(`/order-success/${verifyData.orderId}`)
          } catch {
            toast.error('Payment verification failed. Contact support.')
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false)
            toast('Payment cancelled')
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (res) => {
        toast.error(`Payment failed: ${res.error.description}`)
        setLoading(false)
      })
      rzp.open()

    } catch (err) {
      toast.error('Failed to initiate payment. Try again.')
      setLoading(false)
    }
  }

  const inputCls = 'input-field text-sm'

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Address */}
        <div className="lg:col-span-2 space-y-6">

          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-5">
              <MapPin className="w-4 h-4 text-farm-green" /> Delivery Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Full Name *</label>
                <input name="fullName" value={addr.fullName} onChange={updateAddr} placeholder="Your full name" className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Phone Number *</label>
                <input name="phone" value={addr.phone} onChange={updateAddr} placeholder="10-digit mobile number" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Address Line 1 *</label>
                <input name="addressLine1" value={addr.addressLine1} onChange={updateAddr} placeholder="House no, street, area" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Address Line 2</label>
                <input name="addressLine2" value={addr.addressLine2} onChange={updateAddr} placeholder="Landmark (optional)" className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">City *</label>
                <input name="city" value={addr.city} onChange={updateAddr} placeholder="City" className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">State *</label>
                <input name="state" value={addr.state} onChange={updateAddr} placeholder="State" className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Pincode *</label>
                <input name="pincode" value={addr.pincode} onChange={updateAddr} placeholder="6-digit pincode" className={inputCls} maxLength={6} />
              </div>
            </div>
          </div>

          {/* Coupon */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-farm-green" /> Coupon Code
            </h2>
            {couponApplied ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
                <span className="text-green-800 text-sm font-medium">
                  "{couponApplied.code}" applied — saved ₹{discount}!
                </span>
                <button onClick={removeCoupon} className="text-red-400 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={e => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code (e.g. FIRST10)"
                  className={`${inputCls} flex-1`}
                  onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                />
                <button onClick={applyCoupon} disabled={couponLoading}
                  className="btn-outline px-4 py-3 text-sm whitespace-nowrap">
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>

            {/* Items */}
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate flex-1 mr-2">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-gray-900">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon discount</span><span>−₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `₹${shipping}`}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className="text-farm-green text-xl">₹{total}</span>
              </div>
            </div>

            <button onClick={handlePlaceOrder} disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
              ) : (
                <><CreditCard className="w-4 h-4" /> Pay ₹{total}</>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              Secured by Razorpay · UPI · Cards · NetBanking
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
