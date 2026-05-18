import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Package, Truck, Home, ArrowRight } from 'lucide-react'
import API from '../utils/api'

export default function OrderSuccessPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    API.get(`/orders/${orderId}`)
      .then(r => setOrder(r.data.order))
      .catch(() => {})
  }, [orderId])

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      {/* Success icon */}
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-14 h-14 text-farm-green" />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
      <p className="text-gray-500 mb-2">Thank you for your order. We'll process it right away.</p>
      <p className="text-farm-green font-semibold text-lg mb-8">Order ID: #{orderId}</p>

      {/* Order details */}
      {order && (
        <div className="card p-6 text-left mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">Order Details</h2>

          <div className="space-y-2 text-sm mb-4">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-gray-700">
                <span>{item.name} ({item.weight}) × {item.quantity}</span>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
            <span>Total Paid</span>
            <span className="text-farm-green">₹{order.pricing?.total}</span>
          </div>

          {order.shippingAddress && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Delivery to</p>
              <p className="text-sm text-gray-700">
                {order.shippingAddress.fullName}, {order.shippingAddress.addressLine1},
                {' '}{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Steps */}
      <div className="flex justify-center gap-2 items-center text-sm text-gray-500 mb-10 flex-wrap">
        <div className="flex items-center gap-1.5 text-farm-green font-medium">
          <CheckCircle className="w-4 h-4" /> Order Placed
        </div>
        <ArrowRight className="w-3 h-3 text-gray-300" />
        <div className="flex items-center gap-1.5">
          <Package className="w-4 h-4" /> Processing
        </div>
        <ArrowRight className="w-3 h-3 text-gray-300" />
        <div className="flex items-center gap-1.5">
          <Truck className="w-4 h-4" /> Shipped
        </div>
        <ArrowRight className="w-3 h-3 text-gray-300" />
        <div className="flex items-center gap-1.5">
          <Home className="w-4 h-4" /> Delivered
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/orders" className="btn-primary flex items-center justify-center gap-2">
          <Package className="w-4 h-4" /> View My Orders
        </Link>
        <Link to="/products" className="btn-outline flex items-center justify-center gap-2">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
