'use client'

import { useEffect, useState } from 'react'
import { supabase, verifyAdminInSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { useCart } from '@/lib/cartContext'
import {
  ShoppingBag,
  Search,
  Sparkles,
  User,
  Shield,
  LogOut,
  X,
  Mail,
  ChevronDown
} from 'lucide-react'
import { ANNOUNCEMENT_MESSAGES, AROMA_FRAGRANCES, Fragrance } from '@/lib/aromaData'
import { useSiteConfig, getAvatarFromEmail } from '@/lib/siteConfigStore'

interface AuthUser {
  id: string
  email: string
  name: string
  avatar_url?: string
  is_verified_oauth?: boolean
}

export default function Navbar({ onSelectFragrance }: { onSelectFragrance?: (f: Fragrance) => void }) {
  const { config } = useSiteConfig()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [announcementIdx, setAnnouncementIdx] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authEmailInput, setAuthEmailInput] = useState('')
  const [authNameInput, setAuthNameInput] = useState('')
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const { totalCount, openCart } = useCart()

  // STRICT REQUIREMENT: Admin access is dynamically verified against Supabase admins table upon successful login
  useEffect(() => {
    let isMounted = true
    const checkAdminStatus = async () => {
      if (!user?.email) {
        if (isMounted) setIsAdmin(false)
        return
      }
      try {
        const verified = await verifyAdminInSupabase(user.email)
        if (isMounted) setIsAdmin(Boolean(verified))
      } catch {
        if (isMounted) setIsAdmin(false)
      }
    }
    checkAdminStatus()
    return () => {
      isMounted = false
    }
  }, [user?.email])

  const announcements =
    config?.announcements?.messages && config.announcements.messages.length > 0
      ? config.announcements.messages
      : ANNOUNCEMENT_MESSAGES

  // Announcement rotator
  useEffect(() => {
    const speed = (config?.announcements?.speedSeconds || 5) * 1000
    const timer = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % announcements.length)
    }, speed)
    return () => clearInterval(timer)
  }, [announcements.length, config?.announcements?.speedSeconds])

  // Restore and listen to Auth
  useEffect(() => {
    const checkInitialSession = async () => {
      try {
        // Check active Supabase OAuth session first
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const u = session.user
          const avatar =
            u.user_metadata?.avatar_url ||
            u.user_metadata?.picture ||
            getAvatarFromEmail(u.email, u.user_metadata?.full_name || u.email?.split('@')[0])
          const name = u.user_metadata?.full_name || u.email?.split('@')[0] || 'Fragrance Lover'
          const verifiedUser: AuthUser = {
            id: u.id,
            email: u.email || '',
            name,
            avatar_url: avatar,
            is_verified_oauth: true
          }
          setUser(verifiedUser)
          localStorage.setItem('aroma_auth_customer', JSON.stringify(verifiedUser))
          setLoading(false)
          return
        }

        // Fallback: Check local storage for customer or verified owner sign-in
        const storedCustomer = localStorage.getItem('aroma_auth_customer')
        if (storedCustomer) {
          try {
            const parsed = JSON.parse(storedCustomer)
            setUser(parsed)
          } catch {
            // ignore
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    checkInitialSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user
        const avatar =
          u.user_metadata?.avatar_url ||
          u.user_metadata?.picture ||
          getAvatarFromEmail(u.email, u.user_metadata?.full_name || u.email?.split('@')[0])
        const name = u.user_metadata?.full_name || u.email?.split('@')[0] || 'Fragrance Lover'
        const authObj: AuthUser = {
          id: u.id,
          email: u.email || '',
          name,
          avatar_url: avatar,
          is_verified_oauth: true
        }
        setUser(authObj)
        localStorage.setItem('aroma_auth_customer', JSON.stringify(authObj))
      } else if (_event === 'SIGNED_OUT') {
        setUser(null)
        localStorage.removeItem('aroma_auth_customer')
      }
    })

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [])

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true)
      setAuthError(null)
      const currentUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: currentUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      })
      if (error) {
        console.error('Google Sign-in Error:', error.message)
        setAuthError(error.message)
        setGoogleLoading(false)
      }
    } catch (err: any) {
      console.error(err)
      setAuthError(err?.message || 'Failed to initiate Google login.')
      setGoogleLoading(false)
    }
  }

  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authEmailInput.trim()) return

    const email = authEmailInput.trim().toLowerCase()
    const name = authNameInput.trim() || email.split('@')[0]
    const avatar = getAvatarFromEmail(email, name)
    const isDbAdmin = await verifyAdminInSupabase(email)

    const authUser: AuthUser = {
      id: `usr-${Date.now()}`,
      email,
      name: isDbAdmin ? `${name} (Admin)` : name,
      avatar_url: avatar,
      is_verified_oauth: isDbAdmin
    }

    setUser(authUser)
    setIsAdmin(isDbAdmin)
    localStorage.setItem('aroma_auth_customer', JSON.stringify(authUser))
    setAuthModalOpen(false)
    setAuthEmailInput('')
    setAuthNameInput('')
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // ignore
    }
    localStorage.removeItem('aroma_auth_customer')
    setUser(null)
    setAccountMenuOpen(false)
  }

  const filteredSearchFragrances = searchQuery.trim()
    ? AROMA_FRAGRANCES.filter(
        (f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.fragrance_notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const navLinks = config?.navigation?.items || [
    { label: 'Catalog', href: '#fragrance-catalog' },
    { label: 'Collections', href: '#fragrance-catalog' },
    { label: 'Scent Matcher', href: '#scent-finder' },
    { label: 'Craftsmanship', href: '#craftsmanship' },
    { label: 'Reviews', href: '#testimonials' }
  ]

  return (
    <>
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      {config?.announcements?.enabled !== false && announcements.length > 0 && (
        <div className="bg-[#0a0a0a] border-b border-neutral-900 text-[11px] font-mono tracking-widest text-neutral-300 py-2 px-4 text-center overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <span className="text-amber-400">✦</span>
            <p className="transition-opacity duration-500 animate-fade-in font-medium">
              {announcements[announcementIdx % announcements.length]}
            </p>
            <span className="text-amber-400">✦</span>
          </div>
        </div>
      )}

      {/* 2. MAIN LUXURY NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md border-b border-neutral-900/90 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* BRAND LOGO */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full border border-amber-400/40 bg-gradient-to-br from-neutral-900 to-black flex items-center justify-center text-amber-300 font-serif font-black text-lg group-hover:border-amber-400 transition shadow-lg">
              {config?.brand?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <span className="text-2xl font-serif tracking-[0.2em] font-light text-white block group-hover:text-amber-300 transition">
                {config?.brand?.name || 'AROMA'}
              </span>
              <span className="text-[9px] font-mono tracking-[0.35em] text-neutral-400 uppercase block -mt-1">
                {config?.brand?.subtitle || 'FINE PERFUMERY · CEYLON'}
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION LINKS (Dynamically editable from customizer) */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-mono uppercase tracking-[0.2em] text-neutral-300">
            {navLinks.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                className="hover:text-amber-300 transition flex items-center gap-1.5"
              >
                {item.label === 'Scent Matcher' && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          {/* ACTIONS: SEARCH, CART, AUTH & ADMIN */}
          <div className="flex items-center gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-900 transition"
              aria-label="Search Fragrances"
              title="Search scents & notes"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Cart Trigger */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-900 transition flex items-center gap-2 group"
              aria-label="Open Fragrance Bag"
            >
              <ShoppingBag className="w-4 h-4 group-hover:text-amber-300 transition" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-black font-mono font-bold text-[10px] flex items-center justify-center shadow-lg">
                  {totalCount}
                </span>
              )}
            </button>

            {/* ADMIN ACCESS BUTTON: ONLY VISIBLE UPON SUCCESSFUL LOGIN WITH DEFINED ADMIN EMAILS */}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400 text-xs font-mono font-bold transition shadow-lg shadow-amber-400/20"
                title="Store Administrator Panel"
              >
                <Shield className="w-3.5 h-3.5 text-black" />
                <span>Admin Panel</span>
              </Link>
            )}

            {/* USER AUTHENTICATION / ACCOUNT */}
            {loading ? (
              <span className="text-[11px] font-mono text-neutral-500">...</span>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-2 pl-2 border-l border-neutral-800 hover:opacity-90 transition"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-800 border border-amber-400/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={user.avatar_url || getAvatarFromEmail(user.email, user.name)}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-medium text-white max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-400 max-w-[120px] truncate">
                      {user.email}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-neutral-400 hidden md:inline" />
                </button>

                {/* Account Dropdown */}
                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#0d0d0d] border border-neutral-800 rounded-2xl p-3 shadow-2xl z-50 animate-fade-in text-xs font-sans">
                    <div className="p-3 rounded-xl bg-neutral-900/80 mb-2 border border-neutral-800">
                      <p className="font-semibold text-white">{user.name}</p>
                      <p className="text-[11px] font-mono text-neutral-400 break-all">{user.email}</p>
                      {isAdmin ? (
                        <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono font-bold">
                          👑 Verified Administrator
                        </span>
                      ) : (
                        <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 text-[10px] font-mono">
                          ✦ Verified Customer
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 font-mono text-xs mb-1.5 transition"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Go to Admin Dashboard</span>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-neutral-900 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition shadow"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* AUTHENTICATION MODAL */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 shadow-2xl relative text-neutral-200">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full border border-amber-400/40 bg-gradient-to-br from-neutral-900 to-black flex items-center justify-center text-amber-300 font-serif font-black text-xl mx-auto mb-2 shadow-lg">
                {config?.brand?.name?.charAt(0) || 'A'}
              </div>
              <h3 className="text-xl font-serif text-white">Atelier Sign In</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Sign in to track orders, manage purchases, and access your profile.
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
                <span className="text-sm">⚠️</span>
                <div>
                  <p className="font-semibold">Sign-in Notice</p>
                  <p className="text-[11px] text-rose-200/90 mt-0.5">{authError}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full py-3 px-4 bg-white hover:bg-neutral-200 disabled:opacity-70 text-black rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2.5 shadow"
              >
                {googleLoading ? (
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Connecting to Google...</span>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </button>

              <div className="flex items-center gap-3">
                <span className="flex-1 h-[1px] bg-neutral-800" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                  Or Sign In with Email
                </span>
                <span className="flex-1 h-[1px] bg-neutral-800" />
              </div>

              <form onSubmit={handleEmailLoginSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={authEmailInput}
                      onChange={(e) => setAuthEmailInput(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Full Name (Optional)</label>
                  <input
                    type="text"
                    value={authNameInput}
                    onChange={(e) => setAuthNameInput(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg transition"
                >
                  Sign In to Atelier
                </button>
              </form>
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono text-neutral-500">
              <span>Aroma Haute Parfumerie</span>
              <Link
                href="/admin/login"
                onClick={() => setAuthModalOpen(false)}
                className="text-amber-400/80 hover:text-amber-300 transition"
              >
                Administrator Portal &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH MODAL */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-[#0c0c0c] border border-neutral-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setSearchOpen(false)
                setSearchQuery('')
              }}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
              <Search className="w-5 h-5 text-amber-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by scent note (e.g. oud, cinnamon, vanilla, ambergris)..."
                className="w-full bg-transparent text-white placeholder:text-neutral-500 text-sm focus:outline-none"
              />
            </div>

            {/* Search Results */}
            <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-3">
              {filteredSearchFragrances.length > 0 ? (
                filteredSearchFragrances.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => {
                      if (onSelectFragrance) onSelectFragrance(f)
                      setSearchOpen(false)
                    }}
                    className="flex gap-4 p-3 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 hover:border-amber-400/40 cursor-pointer transition"
                  >
                    <div className="w-14 h-18 rounded-xl overflow-hidden bg-neutral-800 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.image_url} alt={f.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{f.name}</h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        {f.category} &bull; LKR {f.price.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                        {f.fragrance_notes}
                      </p>
                    </div>
                  </div>
                ))
              ) : searchQuery.trim() ? (
                <p className="text-xs text-neutral-400 py-6 text-center">
                  No fragrance found matching &quot;{searchQuery}&quot;. Try searching &apos;oud&apos;, &apos;spices&apos;, or &apos;vanilla&apos;.
                </p>
              ) : (
                <div className="py-6 text-xs text-neutral-400 space-y-2">
                  <p className="font-mono text-[11px] text-neutral-500 uppercase">Popular Olfactory Searches:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Ceylon Oud', 'Cinnamon Quills', 'Bourbon Vanilla', 'Ocean Driftwood', 'Extrait'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-3 py-1 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}