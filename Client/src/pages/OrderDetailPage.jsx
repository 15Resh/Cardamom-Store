import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Package, MapPin, CreditCard, Truck } from 'lucide-react'
import API from '../utils/api'

const STATUS_COLOR = {
  placed: 'bg-blue-100 text-blue-800', confirmed: 'bg-purple-100 text-purple-800',
  processing: 'bg-yellow-100 text-yellow-800', shipped: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800'
}
const STATUS_STEPS = ['placed', 'confirmed', 'processing', 'shipped', 'delivered']

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get(`/orders/${id}`)
      .then(r => setOrder(r.data.order))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-farm-green border-t-transparent rounded-full animate-spin" /></div>
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found. <Link to="/orders" className="text-farm-green underline">Back to orders</Link></div>

  const currStep = STATUS_STEPS.indexOf(order.orderStatus)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-farm-green mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderId}</h1>
          <p className="text-sm text-gray-400 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
          </p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${STATUS_COLOR[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}>
          {order.orderStatus}
        </span>
      </div>

      {/* Progress bar */}
      {order.orderStatus !== 'cancelled' && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-4 h-1 bg-gray-100">
              <div className="h-1 bg-farm-green transition-all"
                style={{ width: `${(currStep / (STATUS_STEPS.length - 1)) * 100}%` }} />
            </div>
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex flex-col items-center z-10 gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  ${i <= currStep ? 'bg-farm-green text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {i < currStep ? '✓' : i + 1}
                </div>
                <span className={`text-xs capitalize hidden sm:block ${i <= currStep ? 'text-farm-green font-medium' : 'text-gray-400'}`}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Package className="w-4 h-4 text-farm-green" /> Items Ordered
        </h2>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-14 h-14 bg-green-50 rounded-xl overflow-hidden flex-shrink-0">
                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-400">{item.weight} × {item.quantity}</p>
              </div>
              <p className="font-semibold text-gray-900">₹{item.price * item.quantity}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-4 pt-4 space-y-1 text-sm">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{order.pricing?.subtotal}</span></div>
          {order.pricing?.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−₹{order.pricing.discount}</span></div>}
          <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{order.pricing?.shipping === 0 ? 'Free' : `₹${order.pricing?.shipping}`}</span></div>
          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
            <span>Total Paid</span><span className="text-farm-green">₹{order.pricing?.total}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Shipping address */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-farm-green" /> Delivery Address
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>{order.shippingAddress?.fullName}</strong><br />
            {order.shippingAddress?.phone}<br />
            {order.shippingAddress?.addressLine1}<br />
            {order.shippingAddress?.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
            {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
          </p>
        </div>

        {/* Payment info */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-farm-green" /> Payment Info
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between"><span>Method</span><span className="font-medium">Razorpay</span></div>
            <div className="flex justify-between"><span>Status</span>
              <span className={`font-medium ${order.payment?.status === 'paid' ? 'text-green-600' : 'text-red-500'}`}>
                {order.payment?.status}
              </span>
            </div>
            {order.trackingNumber && (
              <div className="flex justify-between"><span>Tracking</span><span className="font-mono font-medium">{order.trackingNumber}</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
