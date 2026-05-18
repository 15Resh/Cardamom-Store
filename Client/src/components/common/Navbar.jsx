import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, Leaf, User, LogOut, Package } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setDropOpen(false)
  }

  return (
    <nav className="bg-farm-green text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Leaf className="w-6 h-6 text-green-300" />
          <span>Cardamom Farm</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/products" className="hover:text-green-200 transition-colors">Shop</Link>
          <Link to="/about"    className="hover:text-green-200 transition-colors">Our Farm</Link>
          {isAdmin && (
            <Link to="/admin" className="hover:text-green-200 transition-colors">Admin</Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <Link to="/cart" className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-farm-gold text-white text-xs font-bold
                               w-5 h-5 flex items-center justify-center rounded-full">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>

          {/* User menu */}
          {user ? (
            <div className="relative">
              <button onClick={() => setDropOpen(p => !p)}
                className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors">
                <div className="w-7 h-7 bg-green-300 text-farm-green rounded-full flex items-center justify-center text-xs font-bold">
                  {user.name[0].toUpperCase()}
                </div>
                <span className="hidden md:block text-sm">{user.name.split(' ')[0]}</span>
              </button>

              {dropOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-gray-700 text-sm">
                  <Link to="/orders" onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50">
                    <Package className="w-4 h-4" /> My Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50">
                      <User className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}
                  <hr className="my-1" />
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-gray-50 text-red-600">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login"
              className="hidden md:block bg-white text-farm-green px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors">
              Login
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(p => !p)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-farm-light px-4 py-4 flex flex-col gap-3 text-sm font-medium">
          <Link to="/products" onClick={() => setMenuOpen(false)} className="hover:text-green-200">Shop</Link>
          <Link to="/about"    onClick={() => setMenuOpen(false)} className="hover:text-green-200">Our Farm</Link>
          {!user && <Link to="/login" onClick={() => setMenuOpen(false)} className="hover:text-green-200">Login / Register</Link>}
          {user && <Link to="/orders" onClick={() => setMenuOpen(false)} className="hover:text-green-200">My Orders</Link>}
          {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="hover:text-green-200">Admin</Link>}
          {user && <button onClick={handleLogout} className="text-left text-red-300">Logout</button>}
        </div>
      )}
    </nav>
  )
}
