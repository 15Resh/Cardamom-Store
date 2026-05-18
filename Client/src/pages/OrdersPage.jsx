import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight, CheckCircle, Circle } from 'lucide-react'
import API from '../utils/api'

const STATUS_COLOR = {
  placed:     'bg-blue-100 text-blue-800',
  confirmed:  'bg-purple-100 text-purple-800',
  processing: 'bg-yellow-100 text-yellow-800',
  shipped:    'bg-orange-100 text-orange-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800'
}

// ── 4-step tracking bar (NEW) ─────────────────────────────────────────────────
const TRACKING_STEPS = ['Pending', 'Packed', 'Shipped', 'Delivered']

function TrackingBar({ status }) {
  const currentIndex = TRACKING_STEPS.indexOf(status ?? 'Pending')

  return (
    <div className="flex items-center gap-0 mt-3">
      {TRACKING_STEPS.map((step, i) => {
        const done    = i < currentIndex   // completed step
        const active  = i === currentIndex // current step
        const last    = i === TRACKING_STEPS.length - 1

        return (
          <div key={step} className="flex items-center">
            {/* Step dot + label */}
            <div className="flex flex-col items-center gap-1">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs
                ${done   ? 'bg-farm-green text-white'
                : active ? 'bg-farm-green text-white ring-2 ring-farm-green ring-offset-1'
                :          'bg-gray-200 text-gray-400'}`}>
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap
                ${active ? 'text-farm-green' : done ? 'text-gray-500' : 'text-gray-300'}`}>
                {step}
              </span>
            </div>
            {/* Connector line between steps */}
            {!last && (
              <div className={`h-0.5 w-8 sm:w-12 mb-4 mx-0.5
                ${i < currentIndex ? 'bg-farm-green' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/orders/my-orders')
      .then(r => setOrders(r.data.orders))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-farm-green border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <Package className="w-6 h-6 text-farm-green" /> My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No orders yet</p>
          <Link to="/products" className="btn-primary">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order._id} to={`/orders/${order.orderId}`}
              className="card p-5 hover:shadow-md transition-all group block">

              {/* Top row — order info + amount */}
              <div className="flex items-center justify-between">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-farm-green" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Order #{order.orderId}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                      {' · '}{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                    </p>
                    <span className={`inline-block mt-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full capitalize
                      ${STATUS_COLOR[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-farm-green">₹{order.pricing?.total}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              </div>

              {/* ── Tracking bar (NEW) — only show if not cancelled ──────── */}
              {order.orderStatus !== 'cancelled' && (
                <div className="mt-4 pt-4 border-t border-gray-50 pl-14">
                  <TrackingBar status={order.trackingStatus || 'Pending'} />
                </div>
              )}
              {/* ─────────────────────────────────────────────────────────── */}

            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
