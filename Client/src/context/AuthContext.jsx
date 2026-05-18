// frontend/src/context/AuthContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// CHANGES from original:
//  1. Added isTokenExpired() helper — checks JWT expiry without a library
//  2. On app load: if token is expired → auto logout instead of restoring session
//  3. Added token expiry check on every route change (via checkAuth export)
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import API from '../utils/api'

const AuthContext = createContext(null)

// ── Helper: decode JWT and check if it's expired (NEW) ────────────────────────
const isTokenExpired = (token) => {
  try {
    // JWT is 3 base64 parts: header.payload.signature
    const payload = JSON.parse(atob(token.split('.')[1]))
    // exp is in seconds, Date.now() is in milliseconds
    return payload.exp * 1000 < Date.now()
  } catch {
    return true // if we can't decode it, treat as expired
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true) // true while checking stored token

  // ── On app load: restore session OR auto-logout if token expired (UPDATED) ──
  useEffect(() => {
    const token = localStorage.getItem('token')
    const saved = localStorage.getItem('user')

    if (token && saved) {
      // NEW: check expiry before restoring
      if (isTokenExpired(token)) {
        // Token expired → clear storage and send to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        console.log('Session expired — please login again')
      } else {
        try { setUser(JSON.parse(saved)) } catch {}
      }
    }
    setLoading(false) // done checking
  }, [])

  // ── Login: call API, save token + user to localStorage ────────────────────
  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  // ── Register: same as login ────────────────────────────────────────────────
  const register = async (name, email, password, phone) => {
    const { data } = await API.post('/auth/register', { name, email, password, phone })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  // ── Logout: wipe everything ────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('cart') // clear cart on logout too
    setUser(null)
  }, [])

  // ── checkAuth: call this anywhere to verify token is still valid (NEW) ─────
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token || isTokenExpired(token)) {
      logout()
      return false
    }
    return true
  }, [logout])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      checkAuth,
      isAdmin:        user?.role === 'admin',
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
