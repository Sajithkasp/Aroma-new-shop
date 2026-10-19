'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cartContext'
import { supabase } from '@/lib/supabase'
import {
  X,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  CheckCircle2,
  Lock,
  Mail,
  Check
} from 'lucide-react'
import { getAvatarFromEmail, savePlacedOrder, PlacedOrder } from '@/lib/siteConfigStore'
import { APP_CONFIG } from '@/lib/config'

const SRI_LANKA_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
]

interface AuthUser {
  id: string
  email: string
  name: string
  avatar_url?: string
}

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    coupon,
    discountAmount,
    deliveryFee,
    total,
    applyCoupon,
    removeCoupon
  } = useCart()

  const [couponInput, setCouponInput] = useState('')
  const [couponMsg, setCouponMsg] = useState<{ success: boolean; text: string } | null>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<{ id: string; name: string } | null>(null)

  // Auth state for ordering gate
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [showAuthGate, setShowAuthGate] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginName, setLoginName] = useState('')

  // Checkout form fields
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: 'Colombo',
    notes: '',
    paymentMethod: 'Cash on Delivery (COD)'
  })

  // Synchronize authenticated user
  useEffect(() => {
    const checkUser = async () => {
      const stored = localStorage.getItem('aroma_auth_customer')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setCurrentUser(parsed)
          setFormData((prev) => ({
            ...prev,
            fullName: prev.fullName || parsed.name || '',
            email: prev.email || parsed.email || ''
          }))
          return
        } catch {
          // ignore
        }
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const u = session.user
        const name = u.user_metadata?.full_name || u.email?.split('@')[0] || 'Customer'
        const avatar =
          u.user_metadata?.avatar_url ||
          u.user_metadata?.picture ||
          getAvatarFromEmail(u.email, name)
        const userObj: AuthUser = {
          id: u.id,
          email: u.email || '',
          name,
          avatar_url: avatar
        }
        setCurrentUser(userObj)
        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || name,
          email: prev.email || (u.email || '')
        }))
      }
    }

    if (isOpen) {
      checkUser()
    }
  }, [isOpen])

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponInput.trim()) return
    const res = applyCoupon(couponInput)
    setCouponMsg({ success: res.success, text: res.message })
    if (res.success) setCouponInput('')
  }

  // Mandatory Login Gate before proceeding to checkout
  const handleProceedToCheckoutClick = () => {
    if (!currentUser) {
      // User must log in to order
      setShowAuthGate(true)
    } else {
      setIsCheckoutOpen(true)
      setShowAuthGate(false)
    }
  }

  const handleInlineLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail.trim()) return

    const email = loginEmail.trim().toLowerCase()
    const name = loginName.trim() || email.split('@')[0]
    const avatar = getAvatarFromEmail(email, name)

    const userObj: AuthUser = {
      id: `usr-${Date.now()}`,
      email,
      name,
      avatar_url: avatar
    }

    setCurrentUser(userObj)
    localStorage.setItem('aroma_auth_customer', JSON.stringify(userObj))
    setFormData((prev) => ({
      ...prev,
      fullName: name,
      email: email
    }))
    setShowAuthGate(false)
    setIsCheckoutOpen(true)
  }

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      setShowAuthGate(true)
      return
    }

    if (!formData.fullName || !formData.phone || !formData.address) {
      alert('Please fill in your name, contact phone, and delivery address.')
      return
    }

    setIsSubmitting(true)
    const generatedOrderId = 'ARM-' + Math.floor(100000 + Math.random() * 900000)

    const fullOrderData: PlacedOrder = {
      id: `ord-${Date.now()}`,
      order_number: generatedOrderId,
      customer_name: formData.fullName,
      customer_phone: formData.phone,
      customer_email: currentUser.email || formData.email || undefined,
      shipping_address: `${formData.address}, ${formData.city}`,
      district: formData.district,
      payment_method: formData.paymentMethod,
      payment_status: formData.paymentMethod === 'Cash on Delivery (COD)' ? 'pending' : 'awaiting_transfer',
      order_status: 'pending',
      subtotal: subtotal,
      discount: discountAmount,
      shipping_fee: deliveryFee,
      total_amount: total,
      notes: formData.notes || undefined,
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        volume_ml: i.volume_ml,
        image_url: i.image_url
      })),
      created_at: new Date().toISOString()
    }

    // 1. Save immediately to client store so it appears in Admin instantly
    savePlacedOrder(fullOrderData)

    try {
      // 2. Save to Supabase orders table
      await supabase.from('orders').insert([
        {
          order_number: generatedOrderId,
          customer_name: formData.fullName,
          customer_phone: formData.phone,
          customer_email: currentUser.email || formData.email || null,
          shipping_address: `${formData.address}, ${formData.city}, ${formData.district}`,
          district: formData.district,
          payment_method: formData.paymentMethod,
          payment_status: formData.paymentMethod === 'Cash on Delivery (COD)' ? 'pending' : 'awaiting_transfer',
          order_status: 'pending',
          subtotal: subtotal,
          discount: discountAmount,
          shipping_fee: deliveryFee,
          total_amount: total,
          notes: formData.notes || null,
          items_count: items.length
        }
      ])

      try {
        const orderItemRows = items.map((item) => ({
          order_id: generatedOrderId,
          product_name: item.name,
          volume_ml: item.volume_ml,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        }))
        await supabase.from('order_items').insert(orderItemRows)
      } catch {
        // Fallback for order items
      }
    } catch {
      // Offline fallback: order already saved in local store
    } finally {
      setOrderSuccess({ id: generatedOrderId, name: formData.fullName })
      clearCart()
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  // Progress towards free delivery (10,000 LKR threshold)
  const freeShippingThreshold = APP_CONFIG.FREE_SHIPPING_THRESHOLD
  const shippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0a0a0a] border-l border-neutral-800 text-neutral-100 flex flex-col shadow-2xl">
          {/* CART HEADER */}
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-serif font-medium tracking-wide text-white">Your Fragrance Bag</h3>
                <p className="text-xs text-neutral-400 font-mono">
                  {items.length} {items.length === 1 ? 'bottle' : 'bottles'} selected
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* FREE SHIPPING PROGRESS BAR */}
          <div className="px-6 py-3 bg-neutral-900/60 border-b border-neutral-800 text-xs">
            <div className="flex items-center justify-between text-[11px] mb-1.5 font-mono">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                {remainingForFreeShipping === 0
                  ? '✦ You unlocked Complimentary Express Delivery!'
                  : `Add LKR ${remainingForFreeShipping.toLocaleString()} for Free Delivery`}
              </span>
              <span className="text-amber-400 font-bold">{shippingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500 rounded-full"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          {/* 1. ORDER SUCCESS SCREEN */}
          {orderSuccess ? (
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-400 font-semibold">
                Order Confirmed
              </span>
              <h3 className="text-2xl font-serif mt-2 text-white">Thank you, {orderSuccess.name}</h3>
              <p className="text-xs text-neutral-400 mt-2 max-w-xs">
                Your bespoke Aroma perfume order has been logged into our atelier dispatch queue.
              </p>

              <div className="mt-6 p-4 rounded-xl bg-neutral-900 border border-neutral-800 w-full text-left">
                <p className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">Order Reference</p>
                <p className="text-lg font-mono font-bold text-amber-300 mt-0.5">{orderSuccess.id}</p>
                <div className="mt-3 pt-3 border-t border-neutral-800 text-xs text-neutral-400 space-y-1">
                  <p>• Estimated Delivery: 2-3 business days island-wide</p>
                  <p>• Dispatch Location: Colombo Perfumery Atelier</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col w-full gap-2">
                <a
                  href={`https://wa.me/94771234567?text=${encodeURIComponent(`Hi Aroma Ceylon, I just placed order ${orderSuccess.id}. Please confirm dispatch.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition flex items-center justify-center gap-2"
                >
                  <span>Confirm via WhatsApp Dispatch</span>
                </a>
                <button
                  onClick={() => {
                    setOrderSuccess(null)
                    setIsCheckoutOpen(false)
                    closeCart()
                  }}
                  className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-medium transition"
                >
                  Continue Exploring Fragrances
                </button>
              </div>
            </div>
          ) : showAuthGate ? (
            /* 2. MANDATORY LOGIN GATE FOR CHECKOUT */
            <div className="flex-1 overflow-y-auto p-6 space-y-5 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <h4 className="font-serif text-lg text-white">Client Sign In Required</h4>
                </div>
                <button
                  onClick={() => setShowAuthGate(false)}
                  className="text-xs text-amber-400 hover:underline"
                >
                  ← Back to Bag
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs">
                <p className="text-neutral-300 leading-relaxed font-light">
                  To ensure personalized bottle batch registration, island-wide order tracking, and client care, please sign in before confirming your purchase.
                </p>
              </div>

              {/* Sign in with Google */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    const currentUrl = typeof window !== 'undefined' ? window.location.origin : ''
                    await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: { redirectTo: currentUrl }
                    })
                  } catch {
                    alert('Please use email sign in below.')
                  }
                }}
                className="w-full py-3 px-4 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2.5 shadow"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3 my-3">
                <span className="flex-1 h-[1px] bg-neutral-800" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                  Or Sign In with Email
                </span>
                <span className="flex-1 h-[1px] bg-neutral-800" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleInlineLoginSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Your Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. customer@gmail.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Your Name</label>
                  <input
                    type="text"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    placeholder="e.g. Shanil Perera"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {loginEmail && (
                  <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400/40 bg-neutral-800 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getAvatarFromEmail(loginEmail, loginName)}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] text-white">Avatar from Email</p>
                      <p className="text-[10px] text-neutral-400 font-mono truncate max-w-[200px]">
                        {loginEmail}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg transition"
                >
                  Sign In & Continue to Delivery
                </button>
              </form>
            </div>
          ) : isCheckoutOpen ? (
            /* 3. CHECKOUT FORM VIEW */
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div>
                  <h4 className="font-serif text-lg text-white">Island-wide Express Delivery</h4>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    Artisanal Hand-Distilled Sri Lankan Flacons
                  </p>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-xs text-amber-400 hover:underline"
                >
                  ← Back to Bag
                </button>
              </div>

              {/* Logged in Badge */}
              {currentUser && (
                <div className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400/50 bg-neutral-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentUser.avatar_url || getAvatarFromEmail(currentUser.email, currentUser.name)}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{currentUser.name}</p>
                      <p className="text-[10px] font-mono text-neutral-400">{currentUser.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Verified
                  </span>
                </div>
              )}

              <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Full Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Sajith Perera"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Mobile / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="077 123 4567"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@domain.lk"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="No. 45, Flower Road"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">City / Town *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Colombo 07"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">District *</label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                    >
                      {SRI_LANKA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Payment Preference</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Cash on Delivery (COD)', 'Bank Transfer / Deposit'].map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setFormData({ ...formData, paymentMethod: m })}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          formData.paymentMethod === m
                            ? 'border-amber-400 bg-amber-400/10 text-white'
                            : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <p className="font-semibold text-[11px]">{m}</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          {m === 'Cash on Delivery (COD)' ? 'Pay cash on arrival' : 'Direct Seylan/HNB bank'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Special Fragrance / Delivery Notes</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Gift packaging requested / Call before arrival"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-3 border-t border-neutral-800">
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>Order Total ({items.length} items):</span>
                    <span className="text-white font-bold font-mono">LKR {total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-bold uppercase tracking-wider text-xs rounded-xl shadow-xl transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Placing Bespoke Order...' : `Confirm & Place Order (LKR ${total.toLocaleString()})`}
                </button>
              </form>
            </div>
          ) : (
            /* 4. CART ITEMS VIEW (Free browsing without login) */
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 mb-4 text-2xl">
                      🧴
                    </div>
                    <h4 className="font-serif text-lg text-white">Your Fragrance Bag is Empty</h4>
                    <p className="text-xs text-neutral-400 max-w-xs mt-1">
                      Explore our hand-distilled Ceylon luxury fragrance catalog to select your signature scent.
                    </p>
                    <a
                      href="#fragrance-catalog"
                      onClick={closeCart}
                      className="mt-6 px-6 py-2.5 bg-white text-black rounded-full text-xs font-semibold hover:bg-neutral-200 transition"
                    >
                      Browse Fragrances
                    </a>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={`${item.id}-${item.volume_ml}`}
                      className="flex gap-4 p-3.5 bg-neutral-900/60 rounded-2xl border border-neutral-800/80 hover:border-neutral-700 transition"
                    >
                      <div className="w-20 h-24 rounded-xl overflow-hidden bg-neutral-800 shrink-0 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-bold text-white leading-snug">{item.name}</h4>
                            <button
                              onClick={() => removeFromCart(item.id, item.volume_ml)}
                              className="text-neutral-500 hover:text-red-400 p-1 transition"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                            {item.volume_ml}ml Bottle {item.concentration && `· ${item.concentration}`}
                          </p>
                        </div>

                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center border border-neutral-700 rounded-lg bg-neutral-950 px-1 py-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, item.volume_ml, -1)}
                              className="px-2 py-0.5 text-neutral-400 hover:text-white text-xs font-mono"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-mono font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.volume_ml, 1)}
                              className="px-2 py-0.5 text-neutral-400 hover:text-white text-xs font-mono"
                            >
                              +
                            </button>
                          </div>

                          <span className="font-mono text-xs font-bold text-amber-300">
                            LKR {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* FOOTER & PROCEED BUTTON */}
              {items.length > 0 && (
                <div className="p-6 border-t border-neutral-800 bg-[#070707] space-y-4">
                  {/* Coupon Code Input */}
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Promo Code (e.g. AROMA10)"
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-neutral-900 border border-neutral-800 text-white uppercase placeholder:normal-case placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium rounded-xl text-neutral-200 transition"
                    >
                      Apply
                    </button>
                  </form>

                  {couponMsg && (
                    <p
                      className={`text-[11px] font-mono ${
                        couponMsg.success ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {couponMsg.text}
                    </p>
                  )}

                  {coupon && (
                    <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-3 py-1.5 rounded-lg">
                      <span className="flex items-center gap-1 font-mono">
                        <Sparkles className="w-3.5 h-3.5" />
                        Code: {coupon}
                      </span>
                      <button
                        onClick={removeCoupon}
                        className="text-[11px] underline hover:text-white"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Calculations */}
                  <div className="space-y-1.5 text-xs text-neutral-400 pt-1 border-t border-neutral-800/80">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono text-neutral-200">LKR {subtotal.toLocaleString()}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>VIP Discount</span>
                        <span className="font-mono">- LKR {discountAmount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Island-wide Courier</span>
                      <span className="font-mono text-neutral-200">
                        {deliveryFee === 0 ? (
                          <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                            FREE
                          </span>
                        ) : (
                          `LKR ${deliveryFee.toLocaleString()}`
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
                      <span>Estimated Total</span>
                      <span className="font-mono text-amber-300">LKR {total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Proceed CTA - Gated with Login Requirement */}
                  <button
                    onClick={handleProceedToCheckoutClick}
                    className="w-full py-4 bg-white hover:bg-neutral-200 text-black font-bold uppercase tracking-wider text-xs rounded-xl shadow-xl transition flex items-center justify-center gap-2 group"
                  >
                    <span>Proceed to Delivery & Checkout</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-500 pt-1">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      100% Authentic Guarantee
                    </span>
                    <span>•</span>
                    <span>Island-wide 48h Delivery</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
