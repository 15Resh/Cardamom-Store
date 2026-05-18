// frontend/src/App.jsx
// ─────────────────────────────────────────────────────────────────────────────
// CHANGES from original:
//  1. PrivateRoute now blocks ALL non-admin pages — redirects to /login
//  2. PublicOnlyRoute — redirects already-logged-in users AWAY from /login
//  3. Loading spinner shown while auth state is being checked (prevents flash)
//  4. AdminRoute unchanged in logic, just uses updated useAuth values
// ─────────────────────────────────────────────────────────────────────────────

import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

// Pages
import HomePage         from './pages/HomePage'
import ProductsPage     from './pages/ProductsPage'
import ProductDetail    from './pages/ProductDetail'
import CartPage         from './pages/CartPage'
import CheckoutPage     from './pages/CheckoutPage'
import LoginPage        from './pages/LoginPage'
import RegisterPage     from './pages/RegisterPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import OrdersPage       from './pages/OrdersPage'
import OrderDetailPage  from './pages/OrderDetailPage'
import AboutPage        from './pages/AboutPage'

// Admin Pages
import AdminLogin     from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts  from './pages/admin/AdminProducts'
import AdminOrders    from './pages/admin/AdminOrders'

// Layout
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'

// ── Full-screen loading spinner ───────────────────────────────────────────────
const Spinner = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  }}>
    <div className="w-10 h-10 border-4 border-farm-green border-t-transparent rounded-full animate-spin" />
    <p style={{ fontSize: '14px', color: '#6b7280' }}>Loading…</p>
  </div>
)

// ── PrivateRoute: user MUST be logged in (NEW BEHAVIOR) ───────────────────────
// Previously only checkout was protected. Now ALL pages require login.
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Spinner />
  // Pass location so LoginPage can redirect back after successful login
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

// ── PublicOnlyRoute: logged-in users are sent to Home (NEW) ──────────────────
// Prevents already-logged-in users from seeing /login or /register again
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  // Already logged in → go home
  if (user) return <Navigate to="/" replace />
  return children
}

// ── AdminRoute: must be logged in AND have admin role ─────────────────────────
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <Spinner />
  if (!user)    return <Navigate to="/admin/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

// ── Main layout wrapper (Navbar + page content + Footer) ─────────────────────
const MainLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
)

// ── App routes ────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>

          {/* ── Auth pages: only for guests (logged-in users → Home) ───────── */}
          <Route path="/login" element={
            <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>
          } />
          <Route path="/register" element={
            <PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>
          } />

          {/* ── All main pages: REQUIRE login ──────────────────────────────── */}
          <Route path="/" element={
            <PrivateRoute>
              <MainLayout><HomePage /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/products" element={
            <PrivateRoute>
              <MainLayout><ProductsPage /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/products/:id" element={
            <PrivateRoute>
              <MainLayout><ProductDetail /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/about" element={
            <PrivateRoute>
              <MainLayout><AboutPage /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/cart" element={
            <PrivateRoute>
              <MainLayout><CartPage /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/checkout" element={
            <PrivateRoute>
              <MainLayout><CheckoutPage /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/order-success/:orderId" element={
            <PrivateRoute>
              <MainLayout><OrderSuccessPage /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/orders" element={
            <PrivateRoute>
              <MainLayout><OrdersPage /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/orders/:id" element={
            <PrivateRoute>
              <MainLayout><OrderDetailPage /></MainLayout>
            </PrivateRoute>
          } />

          {/* ── Admin pages: require login + admin role ─────────────────────── */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
          <Route path="/admin/products" element={
            <AdminRoute><AdminProducts /></AdminRoute>
          } />
          <Route path="/admin/orders" element={
            <AdminRoute><AdminOrders /></AdminRoute>
          } />

          {/* ── 404: unknown routes → login if not logged in, home if logged in */}
          <Route path="*" element={
            <PrivateRoute>
              <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                  <h1 className="text-4xl font-bold text-farm-green">404</h1>
                  <p className="text-gray-500">Page not found</p>
                  <a href="/" className="btn-primary">Go Home</a>
                </div>
              </MainLayout>
            </PrivateRoute>
          } />

        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}
