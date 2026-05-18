// frontend/src/pages/LoginPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// CHANGES from original:
//  1. After login → redirect to wherever user was trying to go (not just "/")
//     e.g. user tried to visit /cart → got sent to /login → after login → /cart
//  2. Shows "Session expired" message if redirected due to expired token
//  3. Added link to register page below the form
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Leaf, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()

  // ── Where was the user trying to go before being sent to /login? (NEW) ────
  // React Router stores this in location.state.from when using <Navigate>
  // Default to "/" if they came directly to /login
  const from = location.state?.from?.pathname || '/'
  // ─────────────────────────────────────────────────────────────────────────

  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      // ── Redirect: admin → admin dashboard, others → intended page ─────────
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate(from, { replace: true }) // go to page they originally wanted
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-farm-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-farm-green font-bold text-2xl">
            <Leaf className="w-7 h-7" />
            Cardamom Farm
          </Link>
          <p className="text-gray-500 mt-2 text-sm">Sign in to continue shopping</p>
        </div>

        {/* ── Show message if redirected due to expired session (NEW) ──────── */}
        {location.state?.expired && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm
                          rounded-lg px-4 py-3 mb-4 text-center">
            Your session expired. Please login again.
          </div>
        )}
        {/* ─────────────────────────────────────────────────────────────────── */}

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="input-field"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Your password"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-farm-green font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Admin? Use your admin credentials to sign in.
        </p>
      </div>
    </div>
  )
}
