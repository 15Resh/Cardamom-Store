import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const { login, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role !== 'admin') {
        toast.error('Access denied. Admins only.')
        return
      }
      toast.success('Welcome, Admin!')
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-white font-bold text-2xl">
            <Leaf className="w-7 h-7 text-green-400" /> Cardamom Farm
          </div>
          <div className="flex items-center justify-center gap-2 mt-2 text-gray-400 text-sm">
            <Shield className="w-4 h-4" /> Admin Portal
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Admin Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
                placeholder="admin@cardamomfarm.com" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Password</label>
              <input type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
                placeholder="Admin password" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-farm-green text-white py-3.5 rounded-lg font-medium
                         hover:bg-farm-light transition-colors disabled:opacity-50">
              {loading ? 'Signing in…' : 'Sign In to Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
