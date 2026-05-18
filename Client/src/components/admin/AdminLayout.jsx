import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Leaf, LayoutDashboard, Package, ShoppingBag, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const nav = [
  { to: '/admin',          icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard' },
  { to: '/admin/products', icon: <Package className="w-4 h-4" />,         label: 'Products' },
  { to: '/admin/orders',   icon: <ShoppingBag className="w-4 h-4" />,     label: 'Orders' },
]

export default function AdminLayout({ children }) {
  const { pathname } = useLocation()
  const { logout }   = useAuth()
  const navigate     = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <Leaf className="w-5 h-5 text-green-400" /> Cardamom Farm
          </Link>
          <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map(({ to, icon, label }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${pathname === to
                  ? 'bg-farm-green text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
              {icon} {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
