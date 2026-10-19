'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  volume_ml: number
  image_url: string
  quantity: number
  concentration?: string
}

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeFromCart: (id: string, volume_ml: number) => void
  updateQuantity: (id: string, volume_ml: number, delta: number) => void
  clearCart: () => void
  totalCount: number
  subtotal: number
  coupon: string | null
  discountAmount: number
  deliveryFee: number
  total: number
  applyCoupon: (code: string) => { success: boolean; message: string }
  removeCoupon: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [coupon, setCoupon] = useState<string | null>(null)
  const [discountPercent, setDiscountPercent] = useState<number>(0)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aroma_cart_items')
      if (saved) {
        setItems(JSON.parse(saved))
      }
      const savedCoupon = localStorage.getItem('aroma_cart_coupon')
      if (savedCoupon) {
        setCoupon(savedCoupon)
        if (savedCoupon === 'AROMA10') setDiscountPercent(10)
        if (savedCoupon === 'VIP20') setDiscountPercent(20)
      }
    } catch {
      // Ignore storage errors
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem('aroma_cart_items', JSON.stringify(items))
      if (coupon) {
        localStorage.setItem('aroma_cart_coupon', coupon)
      } else {
        localStorage.removeItem('aroma_cart_coupon')
      }
    } catch {
      // Ignore storage errors
    }
  }, [items, coupon, isLoaded])

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.id === item.id && i.volume_ml === item.volume_ml
      )
      if (existingIndex > -1) {
        const updated = [...prev]
        updated[existingIndex].quantity += quantity
        return updated
      }
      return [...prev, { ...item, quantity }]
    })
    setIsOpen(true)
  }

  const removeFromCart = (id: string, volume_ml: number) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.volume_ml === volume_ml)))
  }

  const updateQuantity = (id: string, volume_ml: number, delta: number) => {
    setItems((prev) => {
      return prev
        .map((i) => {
          if (i.id === id && i.volume_ml === volume_ml) {
            const newQty = i.quantity + delta
            return newQty > 0 ? { ...i, quantity: newQty } : null
          }
          return i
        })
        .filter(Boolean) as CartItem[]
    })
  }

  const clearCart = () => {
    setItems([])
    setCoupon(null)
    setDiscountPercent(0)
  }

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase()
    if (clean === 'AROMA10') {
      setCoupon('AROMA10')
      setDiscountPercent(10)
      return { success: true, message: 'Promo code AROMA10 applied: 10% discount!' }
    } else if (clean === 'CEYLONVIP' || clean === 'VIP20') {
      setCoupon(clean)
      setDiscountPercent(20)
      return { success: true, message: 'VIP Promo Code applied: 20% discount!' }
    } else {
      return { success: false, message: 'Invalid or expired coupon code' }
    }
  }

  const removeCoupon = () => {
    setCoupon(null)
    setDiscountPercent(0)
  }

  const totalCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }, [items])

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [items])

  const discountAmount = useMemo(() => {
    return Math.round((subtotal * discountPercent) / 100)
  }, [subtotal, discountPercent])

  // Complimentary delivery for orders >= 10,000 LKR
  const deliveryFee = useMemo(() => {
    if (subtotal === 0) return 0
    if (subtotal >= 10000 || coupon === 'CEYLONVIP') return 0
    return 450 // standard courier fee in LKR
  }, [subtotal, coupon])

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + deliveryFee)
  }, [subtotal, discountAmount, deliveryFee])

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        coupon,
        discountAmount,
        deliveryFee,
        total,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return ctx
}
