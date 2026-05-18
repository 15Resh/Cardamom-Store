import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, IndianRupee, Package, Users, TrendingUp } from 'lucide-react'
import API from '../../utils/api'
import AdminLayout from '../../components/admin/AdminLayout'

const STATUS_COLOR = {
  placed: 'bg-blue-100 text-blue-700', confirmed: 'bg-purple-100 text-purple-700',
  processing: 'bg-yellow-100 text-yellow-700', shipped: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700'
}

export default function AdminDashboard() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/admin/dashboard')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <AdminLayout>
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-farm-green border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  )

  const stats = [
    { label: 'Total Orders',   value: data?.stats.totalOrders,   icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Revenue',  value: `₹${data?.stats.totalRevenue?.toLocaleString('en-IN')}`, icon: <IndianRupee className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
    { label: 'Products',       value: data?.stats.totalProducts,  icon: <Package className="w-5 h-5" />,     color: 'bg-purple-50 text-purple-600' },
    { label: 'Customers',      value: data?.stats.totalUsers,     icon: <Users className="w-5 h-5" />,       color: 'bg-orange-50 text-orange-600' },
  ]

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your farm store</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>{icon}</div>
            <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-farm-green hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Order ID</th>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.recentOrders?.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-mono text-xs text-gray-600">{order.orderId}</td>
                    <td className="px-6 py-3 text-gray-900">{order.user?.name || '—'}</td>
                    <td className="px-6 py-3 font-medium text-farm-green">₹{order.pricing?.total}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLOR[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orders by status */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {data?.stats.ordersByStatus?.map(({ _id, count }) => (
              <div key={_id} className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLOR[_id] || 'bg-gray-100 text-gray-600'}`}>
                  {_id}
                </span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
