import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  // ── Unique key per product+variant combination ────────────────────────────
  // e.g. "abc123__100g" so same product in different weights = separate cart items
  const cartKey = (product) => {
    const weight = product.selectedVariant?.weight || product.weight || ''
    return `${product._id}__${weight}`
  }
  // ─────────────────────────────────────────────────────────────────────────

  const addToCart = (product, qty = 1) => {
    const key = cartKey(product)
    setItems(prev => {
      const exists = prev.find(i => cartKey(i) === key)
      if (exists) {
        return prev.map(i =>
          cartKey(i) === key
            ? { ...i, quantity: Math.min(i.quantity + qty, 10) }
            : i
        )
      }
      return [...prev, { ...product, quantity: qty, cartKey: key }]
    })
  }

  const updateQty = (key, qty) => {
    if (qty < 1) return removeFromCart(key)
    setItems(prev => prev.map(i =>
      (i.cartKey || cartKey(i)) === key
        ? { ...i, quantity: Math.min(qty, 10) }
        : i
    ))
  }

  const removeFromCart = (key) => {
    setItems(prev => prev.filter(i => (i.cartKey || cartKey(i)) !== key))
  }

  const clearCart = () => setItems([])

  const subtotal  = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, itemCount, subtotal, cartKey,
      addToCart, updateQty, removeFromCart, clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
