import { useEffect, useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import API from '../../utils/api'
import AdminLayout from '../../components/admin/AdminLayout'
import toast from 'react-hot-toast'

const STATUSES = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_COLOR = {
  placed: 'bg-blue-100 text-blue-700', confirmed: 'bg-purple-100 text-purple-700',
  processing: 'bg-yellow-100 text-yellow-700', shipped: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700'
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')
  const [detail, setDetail]   = useState(null)   // selected order
  const [newStatus, setNewStatus]   = useState('')
  const [trackingNum, setTracking]  = useState('')
  const [updating, setUpdating]     = useState(false)

  const load = (status) => {
    setLoading(true)
    const params = status && status !== 'all' ? `?status=${status}` : ''
    API.get(`/admin/orders${params}`)
      .then(r => setOrders(r.data.orders))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(filter) }, [filter])

  const openDetail = (order) => {
    setDetail(order)
    setNewStatus(order.orderStatus)
    setTracking(order.trackingNumber || '')
  }

  const handleUpdateStatus = async () => {
    if (!newStatus) return
    setUpdating(true)
    try {
      const { data } = await API.put(`/admin/orders/${detail._id}/status`, {
        status: newStatus,
        trackingNumber: trackingNum || undefined
      })
      toast.success('Order status updated!')
      setDetail(data.order)
      load(filter)
    } catch { toast.error('Update failed') }
    setUpdating(false)
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">{orders.length} orders</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-colors
              ${filter === s
                ? 'bg-farm-green text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-farm-green hover:text-farm-green'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-farm-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No orders found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
              <tr>
                <th className="px-5 py-4 text-left">Order ID</th>
                <th className="px-5 py-4 text-left">Customer</th>
                <th className="px-5 py-4 text-left">Items</th>
                <th className="px-5 py-4 text-left">Amount</th>
                <th className="px-5 py-4 text-left">Status</th>
                <th className="px-5 py-4 text-left">Date</th>
                <th className="px-5 py-4 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-xs text-gray-600">{order.orderId}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900 text-xs">{order.user?.name || '—'}</p>
                    <p className="text-gray-400 text-xs">{order.user?.email}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{order.items?.length} items</td>
                  <td className="px-5 py-3 font-semibold text-farm-green">₹{order.pricing?.total}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLOR[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => openDetail(order)}
                      className="text-xs text-farm-green hover:underline font-medium">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order detail drawer */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900">Order #{detail.orderId}</h2>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Customer</h3>
                <p className="font-medium text-gray-900">{detail.user?.name}</p>
                <p className="text-sm text-gray-500">{detail.user?.email}</p>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Items</h3>
                <div className="space-y-2">
                  {detail.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.name} ({item.weight}) × {item.quantity}</span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 pt-2 flex justify-between font-bold">
                    <span>Total</span><span className="text-farm-green">₹{detail.pricing?.total}</span>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Delivery Address</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {detail.shippingAddress?.fullName}, {detail.shippingAddress?.phone}<br />
                  {detail.shippingAddress?.addressLine1}<br />
                  {detail.shippingAddress?.city}, {detail.shippingAddress?.state} — {detail.shippingAddress?.pincode}
                </p>
              </div>

              {/* Update status */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Update Status</h3>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-farm-green">
                  {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
                <input value={trackingNum} onChange={e => setTracking(e.target.value)}
                  placeholder="Tracking number (optional)"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-farm-green" />
                <button onClick={handleUpdateStatus} disabled={updating}
                  className="w-full bg-farm-green text-white py-2.5 rounded-lg text-sm font-medium hover:bg-farm-light disabled:opacity-50">
                  {updating ? 'Updating…' : 'Update Status'}
                </button>
              </div>

              {/* Status history */}
              {detail.statusHistory?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">History</h3>
                  <div className="space-y-2">
                    {[...detail.statusHistory].reverse().map((h, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <span className={`px-2 py-0.5 rounded-full capitalize font-medium ${STATUS_COLOR[h.status] || 'bg-gray-100 text-gray-600'}`}>
                          {h.status}
                        </span>
                        <span className="text-gray-400">{new Date(h.timestamp).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
