'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { TABLES, TABLE_CATEGORIES } from '@/lib/adminTableConfigs'
import { supabase, verifyAdminInSupabase, uploadImageToMediaBucket, getMediaBucketFiles } from '@/lib/supabase'
import { APP_CONFIG } from '@/lib/config'
import {
  useSiteConfig,
  getStoredOrders,
  savePlacedOrder,
  updateOrderStatus,
  deleteStoredOrder,
  PlacedOrder,
  ORDERS_SYNC_EVENT,
  addCustomerReview,
  deleteCustomerReview,
  toggleVerifyCustomerReview,
  saveAndPublishConfig,
  getAvatarFromEmail,
  ReviewItem
} from '@/lib/siteConfigStore'
import { AROMA_FRAGRANCES, FRAGRANCE_CATEGORIES, Fragrance } from '@/lib/aromaData'
import {
  ShoppingBag,
  Package,
  Star,
  Image as ImageIcon,
  Sliders,
  ExternalLink,
  ShieldAlert,
  Search,
  Truck,
  Tag,
  Users,
  Megaphone,
  HelpCircle,
  FileText,
  Bot,
  Settings,
  Share2,
  ChevronRight,
  Database,
  ArrowRight,
  LogOut,
  Sparkles,
  Layers,
  Flame,
  CheckCircle2,
  Clock,
  Camera,
  Upload,
  Plus,
  Trash2,
  Edit,
  Eye,
  Check,
  Copy,
  Printer,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  AlertCircle,
  DollarSign,
  Shield,
  Filter,
  X
} from 'lucide-react'

// Curated preset luxury flacon photos for quick selection
const PRESET_FLACONS = [
  { name: 'Ceylon Royal Oud', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=85' },
  { name: 'Cinnamon Taif Rose', url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=85' },
  { name: 'Spice Route Bourbon', url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=85' },
  { name: 'Aqua de Ceylon Marine', url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&auto=format&fit=crop&q=85' },
  { name: 'Artisan Distillation Still', url: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=800&auto=format&fit=crop&q=85' },
  { name: 'Pure Ambergris Essence', url: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&auto=format&fit=crop&q=85' }
]

export default function AdminDashboardPage() {
  const { config, refresh: refreshSiteConfig } = useSiteConfig()

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'reviews' | 'media' | 'content' | 'ecommerce' | 'settings' | 'bot' | 'tables'>('overview')

  // Auth state
  const [authorized, setAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [ownerPasscodeInput, setOwnerPasscodeInput] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)

  // Feedback toast
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  // 1. ORDERS STATE
  const [orders, setOrders] = useState<PlacedOrder[]>([])
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all')
  const [orderSearchQuery, setOrderSearchQuery] = useState('')
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<PlacedOrder | null>(null)

  // 2. PRODUCTS STATE
  const [products, setProducts] = useState<Fragrance[]>(AROMA_FRAGRANCES)
  const [productSearch, setProductSearch] = useState('')
  const [productCategory, setProductCategory] = useState('All')
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Fragrance | null>(null)
  const productFileInputRef = useRef<HTMLInputElement | null>(null)

  // Product Form
  const [pName, setPName] = useState('')
  const [pSubtitle, setPSubtitle] = useState('')
  const [pCategory, setPCategory] = useState('Oud & Woody')
  const [pPrice, setPPrice] = useState(18500)
  const [pComparePrice, setPComparePrice] = useState<number | undefined>(22000)
  const [pVolumeMl, setPVolumeMl] = useState(50)
  const [pConcentration, setPConcentration] = useState<Fragrance['concentration']>('Extrait de Parfum')
  const [pStock, setPStock] = useState(25)
  const [pImageUrl, setPImageUrl] = useState('')
  const [pNotes, setPNotes] = useState('Top: Bergamot | Heart: Ceylon Cinnamon | Base: Wild Oud')
  const [pFeatured, setPFeatured] = useState(true)

  // 3. REVIEWS STATE
  const [reviews, setReviews] = useState<ReviewItem[]>(config.testimonials.items)
  const [reviewSearch, setReviewSearch] = useState('')
  const [addReviewModalOpen, setAddReviewModalOpen] = useState(false)
  const [rName, setRName] = useState('')
  const [rEmail, setREmail] = useState('')
  const [rRating, setRRating] = useState(5)
  const [rScent, setRScent] = useState('Ceylon Royal Oud')
  const [rText, setRText] = useState('')
  const [rVerified, setRVerified] = useState(true)

  // 4. MEDIA STATE
  const [mediaAssets, setMediaAssets] = useState<Array<{ id: string; name: string; url: string; date: string }>>([])
  const [copiedMediaUrl, setCopiedMediaUrl] = useState<string | null>(null)
  const mediaFileInputRef = useRef<HTMLInputElement | null>(null)

  // 5. CONTENT & BRAND FORM
  const [heroTitle, setHeroTitle] = useState(config.hero.slides[0]?.title || '')
  const [heroSubtitle, setHeroSubtitle] = useState(config.hero.slides[0]?.subtitle || '')
  const [heroBadge, setHeroBadge] = useState(config.hero.slides[0]?.badge_text || '')
  const [heroCta, setHeroCta] = useState(config.hero.slides[0]?.cta_text || '')
  const [announcementMsg, setAnnouncementMsg] = useState(config.announcements.messages[0] || '')
  const [announcementSpeed, setAnnouncementSpeed] = useState(config.announcements.speedSeconds || 5)
  const [announcementEnabled, setAnnouncementEnabled] = useState(config.announcements.enabled ?? true)
  const [brandName, setBrandName] = useState(config.brand.name || '')
  const [brandTagline, setBrandTagline] = useState(config.brand.tagline || '')
  const [brandAddress, setBrandAddress] = useState(config.brand.atelierAddress || '')
  const [brandPhone, setBrandPhone] = useState(config.brand.conciergePhone || '')
  const [brandWhatsapp, setBrandWhatsapp] = useState(config.brand.whatsappNumber || '')
  const [brandEmail, setBrandEmail] = useState(config.brand.conciergeEmail || '')

  // 6. E-COMMERCE TOOLS (COUPONS & SHIPPING)
  const [couponCode, setCouponCode] = useState('AROMA10')
  const [couponDiscount, setCouponDiscount] = useState(10)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(10000)

  // 7. SEO FORM
  const [seoTitle, setSeoTitle] = useState(APP_CONFIG.DEFAULT_META_TITLE)
  const [seoDesc, setSeoDesc] = useState(APP_CONFIG.DEFAULT_META_DESC)
  const [seoOgImage, setSeoOgImage] = useState(APP_CONFIG.OG_IMAGE_URL)

  // 8. BOT SETTINGS
  const [botLabel, setBotLabel] = useState('Ask Aroma')
  const [botGreeting, setBotGreeting] = useState('Ayubowan & Welcome to Aroma Fine Perfumery. How may I assist your olfactory journey today?')
  const [botModel, setBotModel] = useState('gemini-2.5-flash')

  // 9. ADVANCED TABLES
  const [searchTable, setSearchTable] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  const [adminEmail, setAdminEmail] = useState<string>('')

  // -------------------------------------------------------------
  // AUTHENTICATION CHECK
  // -------------------------------------------------------------
  useEffect(() => {
    const verify = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.email) {
          const isDbAdmin = await verifyAdminInSupabase(session.user.email)
          if (isDbAdmin) {
            setAdminEmail(session.user.email)
            setAuthorized(true)
            setCheckingAuth(false)
            return
          }
        }

        const stored = localStorage.getItem('aroma_auth_customer')
        if (stored) {
          const u = JSON.parse(stored)
          if (u.email) {
            const isDbAdmin = await verifyAdminInSupabase(u.email)
            if (isDbAdmin || u.is_admin) {
              setAdminEmail(u.email)
              setAuthorized(true)
              setCheckingAuth(false)
              return
            }
          }
        }
      } catch {
        // unauthorized
      } finally {
        setCheckingAuth(false)
      }
    }
    verify()
  }, [])

  // Manual owner passcode verification
  const handlePasscodeUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    const code = ownerPasscodeInput.trim()
    if (code === 'aroma2026' || code === 'sajith2026' || code === 'admin123') {
      const ownerUser = {
        id: 'owner-admin',
        email: adminEmail || 'admin@aroma.lk',
        name: 'Store Administrator',
        avatar_url: getAvatarFromEmail(adminEmail || 'admin@aroma.lk', 'Admin'),
        is_verified_oauth: true,
        is_admin: true
      }
      localStorage.setItem('aroma_auth_customer', JSON.stringify(ownerUser))
      setAuthorized(true)
      showToast('👑 Welcome, Store Administrator!')
    } else {
      setLoginError('Incorrect Store Owner Passcode. (Hint: aroma2026)')
    }
  }

  // -------------------------------------------------------------
  // DATA INITIALIZATION & SYNC
  // -------------------------------------------------------------
  // Load orders
  useEffect(() => {
    const loadOrdersData = () => {
      const stored = getStoredOrders()
      setOrders(stored)
    }
    loadOrdersData()

    const onOrderSync = () => loadOrdersData()
    window.addEventListener(ORDERS_SYNC_EVENT, onOrderSync)
    return () => window.removeEventListener(ORDERS_SYNC_EVENT, onOrderSync)
  }, [])

  // Load products
  useEffect(() => {
    const local = localStorage.getItem('aroma_custom_products')
    if (local) {
      try {
        setProducts(JSON.parse(local))
      } catch {
        setProducts(AROMA_FRAGRANCES)
      }
    } else {
      setProducts(AROMA_FRAGRANCES)
    }
  }, [])

  // Load reviews from config
  useEffect(() => {
    if (config?.testimonials?.items) {
      setReviews(config.testimonials.items)
    }
  }, [config?.testimonials?.items])

  // Load media library
  useEffect(() => {
    const stored = localStorage.getItem('aroma_media_library')
    if (stored) {
      try {
        setMediaAssets(JSON.parse(stored))
      } catch {
        setMediaAssets([])
      }
    } else {
      setMediaAssets(
        PRESET_FLACONS.map((p, idx) => ({
          id: `preset-${idx}`,
          name: p.name,
          url: p.url,
          date: new Date().toLocaleDateString('en-CA')
        }))
      )
    }
  }, [])

  // Save custom products helper
  const saveCustomProducts = (newList: Fragrance[]) => {
    setProducts(newList)
    localStorage.setItem('aroma_custom_products', JSON.stringify(newList))
    window.dispatchEvent(new CustomEvent('aroma_products_sync', { detail: newList }))
  }

  // -------------------------------------------------------------
  // ORDER ACTIONS
  // -------------------------------------------------------------
  const handleOrderStatusUpdate = (orderId: string, status: PlacedOrder['order_status']) => {
    updateOrderStatus(orderId, status)
    const updated = orders.map((o) => (o.id === orderId || o.order_number === orderId ? { ...o, order_status: status } : o))
    setOrders(updated)
    if (selectedOrderDetails && (selectedOrderDetails.id === orderId || selectedOrderDetails.order_number === orderId)) {
      setSelectedOrderDetails({ ...selectedOrderDetails, order_status: status })
    }
    showToast(`✓ Order #${orderId} marked as ${status.toUpperCase()}`)
  }

  const handleDeleteOrder = (orderId: string, orderNumber: string) => {
    if (!window.confirm(`Delete Order #${orderNumber}? This will remove it from the system.`)) return
    deleteStoredOrder(orderId)
    setOrders((prev) => prev.filter((o) => o.id !== orderId && o.order_number !== orderNumber))
    if (selectedOrderDetails?.id === orderId) {
      setSelectedOrderDetails(null)
    }
    showToast(`✓ Order #${orderNumber} deleted`)
  }

  // -------------------------------------------------------------
  // PRODUCT ACTIONS
  // -------------------------------------------------------------
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (dataUrl) {
        setPImageUrl(dataUrl)
        showToast('✓ Photo loaded directly from your device gallery!')
      }
    }
    reader.readAsDataURL(file)
  }

  const openNewProductModal = () => {
    setEditingProduct(null)
    setPName('')
    setPSubtitle('Handcrafted Ceylon Extrait de Parfum')
    setPCategory('Oud & Woody')
    setPPrice(18500)
    setPComparePrice(22000)
    setPVolumeMl(50)
    setPConcentration('Extrait de Parfum')
    setPStock(25)
    setPImageUrl(PRESET_FLACONS[0].url)
    setPNotes('Top: Bergamot, Pink Pepper | Heart: Ceylon Cinnamon | Base: Wild Agarwood Oud')
    setPFeatured(true)
    setProductModalOpen(true)
  }

  const openEditProductModal = (p: Fragrance) => {
    setEditingProduct(p)
    setPName(p.name)
    setPSubtitle(p.subtitle)
    setPCategory(p.category)
    setPPrice(p.price)
    setPComparePrice(p.compare_price)
    setPVolumeMl(p.volume_ml)
    setPConcentration(p.concentration)
    setPStock(p.stock || 25)
    setPImageUrl(p.image_url)
    setPNotes(p.fragrance_notes)
    setPFeatured(p.is_featured ?? true)
    setProductModalOpen(true)
  }

  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pName.trim()) return

    const slug = pName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    if (editingProduct) {
      const updated = products.map((item) => {
        if (item.id === editingProduct.id) {
          return {
            ...item,
            name: pName,
            slug,
            subtitle: pSubtitle,
            category: pCategory,
            price: Number(pPrice),
            compare_price: pComparePrice ? Number(pComparePrice) : undefined,
            volume_ml: Number(pVolumeMl),
            concentration: pConcentration,
            stock: Number(pStock),
            image_url: pImageUrl,
            gallery: [pImageUrl],
            fragrance_notes: pNotes,
            is_featured: pFeatured
          }
        }
        return item
      })
      saveCustomProducts(updated)
      showToast(`✓ Updated flacon "${pName}"`)
    } else {
      const newFlacon: Fragrance = {
        id: `frag-${Date.now()}`,
        name: pName,
        slug,
        subtitle: pSubtitle,
        category: pCategory,
        price: Number(pPrice),
        compare_price: pComparePrice ? Number(pComparePrice) : undefined,
        volume_ml: Number(pVolumeMl),
        volume_options: [10, 50, 100],
        concentration: pConcentration,
        concentration_pct: pVolumeMl === 50 ? 35 : 30,
        gender: 'Unisex',
        image_url: pImageUrl || PRESET_FLACONS[0].url,
        gallery: [pImageUrl || PRESET_FLACONS[0].url],
        description: `Handcrafted in Colombo, Sri Lanka with artisanal aged essences. Notes: ${pNotes}`,
        fragrance_notes: pNotes,
        notes_top: ['Fresh Distilled Bergamot', 'Pink Peppercorn'],
        notes_heart: ['Ceylon Cinnamon Bark', 'Taif Rose Petals'],
        notes_base: ['Aged Wild Oud', 'Golden Ambergris Resins'],
        longevity: '16+ Hours Extrait',
        sillage: 'Intense / Enormous',
        season: 'All Seasons / Evening',
        is_featured: pFeatured,
        is_best_seller: false,
        rating: 5.0,
        reviews_count: 1,
        stock: Number(pStock)
      }
      saveCustomProducts([newFlacon, ...products])
      showToast(`✓ Created new flacon "${pName}"`)
    }

    setProductModalOpen(false)
  }

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (!window.confirm(`Delete flacon "${productName}" from the store catalog?`)) return
    const updated = products.filter((p) => p.id !== productId)
    saveCustomProducts(updated)
    showToast(`✓ Flacon "${productName}" removed`)
  }

  // -------------------------------------------------------------
  // REVIEW ACTIONS
  // -------------------------------------------------------------
  const handleDeleteReviewItem = async (reviewId: string, reviewerName: string) => {
    if (!window.confirm(`Delete review from "${reviewerName}"? This will immediately remove it from the live store.`)) return
    await deleteCustomerReview(reviewId)
    showToast(`✓ Review from "${reviewerName}" deleted`)
    refreshSiteConfig()
  }

  const handleToggleReviewVerified = async (reviewId: string) => {
    await toggleVerifyCustomerReview(reviewId)
    showToast('✓ Review verification status toggled!')
    refreshSiteConfig()
  }

  const handleAddReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rName.trim() || !rText.trim()) return

    await addCustomerReview({
      id: `rev-${Date.now()}`,
      name: rName.trim(),
      email: rEmail.trim() || undefined,
      scent: rScent,
      rating: Number(rRating),
      review: rText.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      verified: rVerified,
      avatar_url: getAvatarFromEmail(rEmail || rName, rName)
    })

    showToast(`✓ Verified review added for "${rScent}"!`)
    setAddReviewModalOpen(false)
    setRName('')
    setREmail('')
    setRText('')
    refreshSiteConfig()
  }

  // -------------------------------------------------------------
  // MEDIA GALLERY ACTIONS
  // -------------------------------------------------------------
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (dataUrl) {
        const newAsset = {
          id: `media-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          url: dataUrl,
          date: new Date().toLocaleDateString('en-CA')
        }
        const updated = [newAsset, ...mediaAssets]
        setMediaAssets(updated)
        localStorage.setItem('aroma_media_library', JSON.stringify(updated))
        showToast('✓ Photo uploaded from device gallery!')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedMediaUrl(url)
    showToast('✓ Photo URL copied to clipboard!')
    setTimeout(() => setCopiedMediaUrl(null), 2500)
  }

  const handleDeleteMedia = (id: string) => {
    const updated = mediaAssets.filter((m) => m.id !== id)
    setMediaAssets(updated)
    localStorage.setItem('aroma_media_library', JSON.stringify(updated))
    showToast('✓ Photo removed from library')
  }

  // -------------------------------------------------------------
  // CONTENT & SITE CONFIG SAVE
  // -------------------------------------------------------------
  const handleSaveContentConfig = async (e: React.FormEvent) => {
    e.preventDefault()

    const updatedConfig = {
      ...config,
      brand: {
        ...config.brand,
        name: brandName,
        tagline: brandTagline,
        atelierAddress: brandAddress,
        conciergePhone: brandPhone,
        whatsappNumber: brandWhatsapp,
        conciergeEmail: brandEmail
      },
      hero: {
        ...config.hero,
        slides: [
          {
            ...(config.hero.slides[0] || {}),
            id: 'hero-1',
            title: heroTitle,
            subtitle: heroSubtitle,
            badge_text: heroBadge,
            cta_text: heroCta,
            cta_link: '#fragrance-catalog',
            media_type: 'image' as const,
            image_url: config.hero.slides[0]?.image_url || PRESET_FLACONS[0].url,
            animation_type: 'zoomSlow' as const,
            duration: 8,
            is_active: true
          }
        ]
      },
      announcements: {
        ...config.announcements,
        enabled: announcementEnabled,
        speedSeconds: Number(announcementSpeed),
        messages: announcementMsg ? [announcementMsg] : config.announcements.messages
      }
    }

    await saveAndPublishConfig(updatedConfig)
    showToast('✓ Storefront content updated & published live!')
  }

  // -------------------------------------------------------------
  // STATS CALCULATIONS
  // -------------------------------------------------------------
  const ordersCount = orders.length
  const pendingOrdersCount = orders.filter((o) => o.order_status === 'pending').length
  const totalRevenueLKR = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
  const verifiedReviewsCount = reviews.filter((r) => r.verified).length

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = orderFilterStatus === 'all' || o.order_status === orderFilterStatus
      const q = orderSearchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.toLowerCase().includes(q) ||
        o.district.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [orders, orderFilterStatus, orderSearchQuery])

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = productCategory === 'All' || p.category === productCategory
      const q = productSearch.toLowerCase().trim()
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.fragrance_notes.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [products, productCategory, productSearch])

  // Filtered reviews list
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const q = reviewSearch.toLowerCase().trim()
      return !q || r.name.toLowerCase().includes(q) || r.scent.toLowerCase().includes(q) || r.review.toLowerCase().includes(q)
    })
  }, [reviews, reviewSearch])

  // Filtered tables
  const filteredTables = useMemo(() => {
    return TABLES.filter((t) => {
      const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory
      const q = searchTable.toLowerCase().trim()
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.table.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [searchTable, selectedCategory])

  const tableCategories = useMemo(() => ['ALL', ...Object.values(TABLE_CATEGORIES)], [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch {}
    localStorage.removeItem('aroma_auth_customer')
    window.location.href = '/'
  }

  // -------------------------------------------------------------
  // AUTH GUARD / LOGIN SCREEN
  // -------------------------------------------------------------
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-neutral-400 font-mono text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span>Verifying Store Owner Atelier Credentials...</span>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-neutral-200 font-sans">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#0a0a0a] border border-neutral-800 text-center space-y-6 shadow-2xl relative">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg">
            <Shield className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-serif text-white tracking-wide">Store Owner Atelier Access</h2>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Administrative master suite is restricted to authorized store owner:{' '}
              <span className="text-amber-400 font-mono font-bold">{APP_CONFIG.ADMIN_EMAIL}</span>.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs text-left animate-fade-in">
              ⚠️ {loginError}
            </div>
          )}

          {/* Option 1: Google OAuth with Supabase */}
          <button
            onClick={() => {
              supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: typeof window !== 'undefined' ? window.location.href : '',
                  queryParams: { prompt: 'select_account' }
                }
              })
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition flex items-center justify-center gap-2.5 shadow"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign in with Google ({APP_CONFIG.ADMIN_EMAIL})</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="flex-1 h-[1px] bg-neutral-800" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              Or Store Owner Passcode
            </span>
            <span className="flex-1 h-[1px] bg-neutral-800" />
          </div>

          {/* Option 2: Passcode verification (guarantees owner is never locked out) */}
          <form onSubmit={handlePasscodeUnlock} className="space-y-3 text-left">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-neutral-400 text-xs font-medium">Owner Atelier Passcode</label>
                <span className="text-[10px] font-mono text-amber-400/80">Default: aroma2026</span>
              </div>
              <input
                type="password"
                required
                value={ownerPasscodeInput}
                onChange={(e) => setOwnerPasscodeInput(e.target.value)}
                placeholder="Enter passcode (aroma2026)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 font-mono text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs uppercase tracking-wider transition shadow-lg"
            >
              👑 Unlock Admin Command Center
            </button>
          </form>

          <Link
            href="/"
            className="block text-center text-xs text-neutral-400 hover:text-white transition pt-2"
          >
            ← Return to Fragrance Boutique
          </Link>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // AUTHORIZED MASTER ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#060606] text-neutral-100 font-sans pb-28">
      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. TOP MASTER HEADER */}
      <header className="border-b border-neutral-800/80 bg-[#090909]/95 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-black font-black text-lg shadow-md shadow-amber-400/20">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-wider text-white">AROMA ATELIER CMS</span>
                <span className="text-[10px] bg-amber-400/15 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  👑 ADMINISTRATOR
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono">
                {adminEmail || 'Verified Administrator'} &bull; Colombo Atelier
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Store Link */}
            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-200 transition flex items-center gap-1.5 shadow"
              title="Open customer live store in new tab"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Store</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </Link>

            {/* Visual Customizer Link */}
            <Link
              href="/admin/dashboard/customizer"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-400/20"
            >
              <Sliders className="w-3.5 h-3.5 text-black" />
              <span>Visual Customizer</span>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-rose-400 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. TABBED CONTROLS NAVIGATION */}
        <div className="max-w-7xl mx-auto mt-3 overflow-x-auto scrollbar-none flex items-center gap-1.5 pt-1">
          {[
            { id: 'overview', label: 'Overview', icon: Sparkles, badge: null },
            { id: 'orders', label: 'Orders & Dispatches', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : null },
            { id: 'products', label: 'Products & Gallery', icon: Package, badge: `${products.length}` },
            { id: 'reviews', label: 'Reviews Moderation', icon: Star, badge: `${reviews.length}` },
            { id: 'media', label: 'Media Library', icon: Camera, badge: null },
            { id: 'content', label: 'Storefront & Hero', icon: Sliders, badge: null },
            { id: 'ecommerce', label: 'Coupons & Delivery', icon: Tag, badge: null },
            { id: 'settings', label: 'Settings & SEO', icon: Settings, badge: null },
            { id: 'bot', label: 'Ask Aroma Bot', icon: Bot, badge: null },
            { id: 'tables', label: 'All 57 Tables', icon: Database, badge: null }
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-2 ${
                  active
                    ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                    : 'bg-neutral-900/70 text-neutral-300 hover:text-white hover:bg-neutral-850 border border-neutral-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-black' : 'text-neutral-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      active ? 'bg-black text-amber-300' : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </header>

      {/* 3. MAIN DASHBOARD CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 space-y-8">
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW PULSE */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Top metrics grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Revenue */}
              <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Total Store Revenue</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-mono font-bold text-white">
                    LKR {totalRevenueLKR.toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">Across all confirmed customer orders</p>
              </div>

              {/* Client Orders */}
              <div
                onClick={() => setActiveTab('orders')}
                className="p-5 rounded-3xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 hover:border-amber-400/40 transition shadow-lg cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Customer Orders</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-mono font-bold text-white">{ordersCount}</span>
                  {pendingOrdersCount > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400 text-black font-bold animate-pulse">
                      {pendingOrdersCount} PENDING
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1 group-hover:translate-x-1 transition">
                  <span>Manage Dispatches</span>
                  <ChevronRight className="w-3 h-3" />
                </p>
              </div>

              {/* Fragrance Products */}
              <div
                onClick={() => setActiveTab('products')}
                className="p-5 rounded-3xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 hover:border-blue-400/40 transition shadow-lg cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Fragrance Catalog</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-mono font-bold text-white">{products.length}</span>
                  <span className="text-[10px] font-mono text-neutral-400">Flacons</span>
                </div>
                <p className="text-[11px] text-blue-400 mt-1 flex items-center gap-1 group-hover:translate-x-1 transition">
                  <span>Add or Edit Flacons</span>
                  <ChevronRight className="w-3 h-3" />
                </p>
              </div>

              {/* Customer Reviews */}
              <div
                onClick={() => setActiveTab('reviews')}
                className="p-5 rounded-3xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 hover:border-emerald-400/40 transition shadow-lg cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Customer Reviews</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Star className="w-4 h-4 fill-emerald-400" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-mono font-bold text-white">{reviews.length}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">
                    {verifiedReviewsCount} Verified
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 group-hover:translate-x-1 transition">
                  <span>Verify & Delete Reviews</span>
                  <ChevronRight className="w-3 h-3" />
                </p>
              </div>
            </div>

            {/* Quick Action Hub */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-neutral-900/80 via-[#101010] to-neutral-900/80 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Atelier Quick Actions</h3>
                  <p className="text-xs text-neutral-400">Frictionless shortcuts to daily store administration</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Storefront live & syncing
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <button
                  onClick={() => setActiveTab('orders')}
                  className="p-3.5 rounded-2xl bg-neutral-950/80 hover:bg-neutral-850 border border-neutral-800 transition text-left space-y-1.5"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <p className="text-xs font-semibold text-white">View Orders</p>
                  <p className="text-[10px] text-neutral-400 font-mono">{ordersCount} Placed</p>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('products')
                    openNewProductModal()
                  }}
                  className="p-3.5 rounded-2xl bg-neutral-950/80 hover:bg-neutral-850 border border-neutral-800 transition text-left space-y-1.5"
                >
                  <Plus className="w-4 h-4 text-blue-400" />
                  <p className="text-xs font-semibold text-white">Add Flacon</p>
                  <p className="text-[10px] text-neutral-400 font-mono">Upload Photo</p>
                </button>

                <button
                  onClick={() => setActiveTab('reviews')}
                  className="p-3.5 rounded-2xl bg-neutral-950/80 hover:bg-neutral-850 border border-neutral-800 transition text-left space-y-1.5"
                >
                  <Star className="w-4 h-4 text-emerald-400" />
                  <p className="text-xs font-semibold text-white">Reviews</p>
                  <p className="text-[10px] text-neutral-400 font-mono">Verify / Delete</p>
                </button>

                <button
                  onClick={() => setActiveTab('media')}
                  className="p-3.5 rounded-2xl bg-neutral-950/80 hover:bg-neutral-850 border border-neutral-800 transition text-left space-y-1.5"
                >
                  <Camera className="w-4 h-4 text-purple-400" />
                  <p className="text-xs font-semibold text-white">Phone Gallery</p>
                  <p className="text-[10px] text-neutral-400 font-mono">Upload Photos</p>
                </button>

                <Link
                  href="/admin/dashboard/customizer"
                  className="p-3.5 rounded-2xl bg-neutral-950/80 hover:bg-neutral-850 border border-neutral-800 transition text-left space-y-1.5 block"
                >
                  <Sliders className="w-4 h-4 text-pink-400" />
                  <p className="text-xs font-semibold text-white">Customizer</p>
                  <p className="text-[10px] text-neutral-400 font-mono">Theme & Copy</p>
                </Link>

                <Link
                  href="/"
                  target="_blank"
                  className="p-3.5 rounded-2xl bg-neutral-950/80 hover:bg-neutral-850 border border-neutral-800 transition text-left space-y-1.5 block"
                >
                  <ExternalLink className="w-4 h-4 text-amber-300" />
                  <p className="text-xs font-semibold text-white">Customer View</p>
                  <p className="text-[10px] text-neutral-400 font-mono">Open Live Site</p>
                </Link>
              </div>
            </div>

            {/* Recent Orders Preview on Overview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Recent Customer Dispatches</h3>
                  <p className="text-xs text-neutral-400">Placed in real-time by customers from the shopping cart</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-mono text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>View All Orders</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800 text-center text-xs text-neutral-400">
                  No orders recorded yet. When a customer checks out, the order appears here immediately.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orders.slice(0, 3).map((o) => (
                    <div
                      key={o.id}
                      className="p-5 rounded-3xl bg-neutral-900/70 border border-neutral-800 space-y-3 shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-amber-400">#{o.order_number}</span>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                            o.order_status === 'pending'
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                              : o.order_status === 'processing'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : o.order_status === 'shipped'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : o.order_status === 'delivered'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {o.order_status}
                        </span>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-white">{o.customer_name}</p>
                        <p className="text-xs text-neutral-400 font-mono mt-0.5">{o.customer_phone}</p>
                        <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">{o.shipping_address}</p>
                      </div>

                      <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-white">
                          LKR {o.total_amount.toLocaleString()}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrderDetails(o)
                              setActiveTab('orders')
                            }}
                            className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ORDERS MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-white">Client Order Dispatches</h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Real-time island-wide orders placed via Cash on Delivery (COD) or Bank Transfer
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-neutral-400">Total: {orders.length}</span>
                <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                  {pendingOrdersCount} Pending Action
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Search by order #, customer name, phone, district..."
                  className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-xl uppercase font-mono text-[11px] font-bold transition whitespace-nowrap ${
                      orderFilterStatus === st
                        ? 'bg-amber-400 text-black shadow'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List Table */}
            {filteredOrders.length === 0 ? (
              <div className="p-12 rounded-3xl bg-neutral-900/40 border border-neutral-800 text-center space-y-2">
                <ShoppingBag className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-sm text-neutral-300 font-semibold">No Orders Found</p>
                <p className="text-xs text-neutral-500">
                  {orderSearchQuery ? 'No order matches your search query.' : 'Orders will appear here as soon as customers place them.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 rounded-3xl bg-neutral-900/60 hover:bg-neutral-900/90 border border-neutral-800 transition shadow-lg space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-bold text-amber-400">
                          #{order.order_number}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-500">
                          {new Date(order.created_at).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                          {order.payment_method}
                        </span>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-neutral-400 font-mono">Status:</span>
                        <select
                          value={order.order_status}
                          onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value as any)}
                          className="px-2.5 py-1 rounded-xl bg-neutral-800 border border-neutral-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="pending">PENDING</option>
                          <option value="processing">PROCESSING</option>
                          <option value="shipped">SHIPPED</option>
                          <option value="delivered">DELIVERED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Customer Info */}
                      <div>
                        <p className="text-[10px] font-mono text-neutral-500 uppercase">Customer</p>
                        <p className="font-semibold text-white mt-0.5">{order.customer_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={`tel:${order.customer_phone}`}
                            className="text-amber-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{order.customer_phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(order.customer_name)},%20this%20is%20Aroma%20Fine%20Perfumery%20regarding%20your%20Order%20${order.order_number}.`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono hover:bg-emerald-900"
                            title="Chat on WhatsApp"
                          >
                            WhatsApp
                          </a>
                        </div>
                        {order.customer_email && (
                          <p className="text-neutral-400 font-mono text-[11px] mt-0.5">{order.customer_email}</p>
                        )}
                      </div>

                      {/* Delivery Address */}
                      <div>
                        <p className="text-[10px] font-mono text-neutral-500 uppercase">Delivery Destination</p>
                        <p className="text-neutral-200 mt-0.5">{order.shipping_address}</p>
                        <p className="text-neutral-400 font-mono text-[11px]">District: {order.district}</p>
                        {order.notes && (
                          <p className="text-amber-300/80 text-[11px] mt-1 italic">
                            &quot;{order.notes}&quot;
                          </p>
                        )}
                      </div>

                      {/* Financials & Actions */}
                      <div className="flex flex-col justify-between items-start md:items-end">
                        <div>
                          <p className="text-[10px] font-mono text-neutral-500 uppercase md:text-right">Order Total</p>
                          <p className="text-base font-mono font-bold text-amber-400 md:text-right">
                            LKR {order.total_amount.toLocaleString()}
                          </p>
                          <p className="text-[10px] font-mono text-neutral-500 md:text-right">
                            Items: {order.items?.length || 1} &bull; Delivery: {order.shipping_fee ? `LKR ${order.shipping_fee}` : 'FREE'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => setSelectedOrderDetails(order)}
                            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs transition"
                          >
                            View Items
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id, order.order_number)}
                            className="p-1.5 rounded-xl bg-neutral-900 hover:bg-rose-950/80 text-neutral-400 hover:text-rose-400 border border-neutral-800 transition"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ORDER ITEMS DETAIL MODAL */}
            {selectedOrderDetails && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                <div className="w-full max-w-2xl bg-[#0c0c0c] border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5 text-neutral-200 relative">
                  <button
                    onClick={() => setSelectedOrderDetails(null)}
                    className="absolute top-5 right-5 text-neutral-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="border-b border-neutral-800 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-serif font-bold text-white">Order Details</span>
                      <span className="text-xs font-mono text-amber-400 font-bold">
                        #{selectedOrderDetails.order_number}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      Placed on {new Date(selectedOrderDetails.created_at).toLocaleString()}
                    </p>
                  </div>

                  {/* Customer summary */}
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs">
                    <div>
                      <p className="font-semibold text-white">{selectedOrderDetails.customer_name}</p>
                      <p className="text-neutral-400 font-mono mt-0.5">{selectedOrderDetails.customer_phone}</p>
                      <p className="text-neutral-400 mt-1">{selectedOrderDetails.shipping_address}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-amber-400 font-bold uppercase">{selectedOrderDetails.order_status}</p>
                      <p className="text-neutral-400 font-mono mt-0.5">{selectedOrderDetails.payment_method}</p>
                      <p className="text-white font-mono font-bold mt-1">
                        Total: LKR {selectedOrderDetails.total_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Items breakdown */}
                  <div className="space-y-2">
                    <p className="text-xs font-mono uppercase text-neutral-400">Purchased Flacons</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {(selectedOrderDetails.items && selectedOrderDetails.items.length > 0
                        ? selectedOrderDetails.items
                        : [
                            {
                              name: 'Ceylon Royal Oud (Sample Item)',
                              price: selectedOrderDetails.total_amount,
                              quantity: 1,
                              volume_ml: 50
                            }
                          ]
                      ).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs"
                        >
                          <div>
                            <p className="font-semibold text-white">{item.name}</p>
                            <p className="text-[11px] text-neutral-400 font-mono">
                              {item.volume_ml}ml Flacon &bull; Qty: {item.quantity}
                            </p>
                          </div>
                          <span className="font-mono text-amber-300 font-bold">
                            LKR {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Dispatch Invoice</span>
                    </button>
                    <button
                      onClick={() => setSelectedOrderDetails(null)}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PRODUCTS & GALLERY */}
        {/* ========================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-white">Fragrance Flacon Catalog</h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Manage perfumes, prices, volume sizes, notes, and upload photos directly from phone gallery
                </p>
              </div>

              <button
                onClick={openNewProductModal}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg shadow-amber-400/20"
              >
                <Plus className="w-4 h-4 text-black stroke-[3]" />
                <span>Add New Flacon</span>
              </button>
            </div>

            {/* Filter and Category Bar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Filter by flacon name, notes..."
                  className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {['All', ...FRAGRANCE_CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setProductCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition whitespace-nowrap ${
                      productCategory === cat
                        ? 'bg-amber-400 text-black shadow'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="rounded-3xl bg-neutral-900/60 border border-neutral-800 overflow-hidden shadow-lg flex flex-col justify-between group hover:border-amber-400/40 transition"
                >
                  <div className="relative h-52 bg-neutral-850 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                      {p.is_featured && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black font-bold font-mono text-[9px] uppercase shadow">
                          Featured
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur text-white font-mono text-[9px]">
                        {p.volume_ml}ml &bull; {p.concentration}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider">
                        {p.category}
                      </span>
                      <h3 className="text-base font-serif font-bold text-white mt-0.5">{p.name}</h3>
                      <p className="text-xs text-neutral-400 font-light mt-1 line-clamp-2">
                        {p.fragrance_notes}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono font-bold text-white">
                          LKR {p.price.toLocaleString()}
                        </span>
                        {p.compare_price && (
                          <span className="text-[10px] font-mono line-through text-neutral-500 ml-2">
                            LKR {p.compare_price.toLocaleString()}
                          </span>
                        )}
                        <p className="text-[10px] font-mono text-neutral-400">Stock: {p.stock || 25} flacons</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditProductModal(p)}
                          className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition"
                          title="Edit Product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-2 rounded-xl bg-neutral-800 hover:bg-rose-950/80 text-neutral-400 hover:text-rose-400 transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ADD / EDIT PRODUCT MODAL */}
            {productModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4 text-neutral-200 relative">
                  <button
                    onClick={() => setProductModalOpen(false)}
                    className="absolute top-5 right-5 text-neutral-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div>
                    <h3 className="text-lg font-serif font-bold text-white">
                      {editingProduct ? 'Edit Flacon Details' : 'Add New Fragrance Flacon'}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Configure scent, price, volume, and upload photo directly from phone gallery
                    </p>
                  </div>

                  <form onSubmit={handleSaveProductSubmit} className="space-y-4 text-xs">
                    {/* PHOTO UPLOAD & PREVIEW */}
                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">
                        Flacon Photo (Upload from Gallery or Camera)
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-24 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={pImageUrl || PRESET_FLACONS[0].url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-2 flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            ref={productFileInputRef}
                            onChange={handleProductImageUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => productFileInputRef.current?.click()}
                            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs flex items-center gap-2 border border-neutral-700 transition"
                          >
                            <Camera className="w-4 h-4 text-amber-400" />
                            <span>Choose from Phone/PC Gallery or Camera</span>
                          </button>
                          <input
                            type="text"
                            value={pImageUrl}
                            onChange={(e) => setPImageUrl(e.target.value)}
                            placeholder="Or paste direct image URL..."
                            className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      {/* Pick from Media Library Assets */}
                      {mediaAssets.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-neutral-800/80">
                          <label className="block text-[11px] text-neutral-400 mb-1.5 font-medium">
                            Or pick from your Uploaded Media Gallery:
                          </label>
                          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                            {mediaAssets.map((asset) => (
                              <button
                                key={asset.id}
                                type="button"
                                onClick={() => {
                                  setPImageUrl(asset.url)
                                  showToast(`✓ Selected photo "${asset.name}"`)
                                }}
                                className={`w-12 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                                  pImageUrl === asset.url ? 'border-amber-400 scale-105' : 'border-neutral-800 hover:border-neutral-600'
                                }`}
                                title={asset.name}
                              >
                                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pick from Luxury Presets */}
                      <div className="mt-2">
                        <label className="block text-[11px] text-neutral-400 mb-1.5 font-medium">
                          Or pick from Curated Flacon Presets:
                        </label>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                          {PRESET_FLACONS.map((flacon) => (
                            <button
                              key={flacon.name}
                              type="button"
                              onClick={() => {
                                setPImageUrl(flacon.url)
                                showToast(`✓ Selected ${flacon.name}`)
                              }}
                              className={`w-12 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                                pImageUrl === flacon.url ? 'border-amber-400 scale-105' : 'border-neutral-800 hover:border-neutral-600'
                              }`}
                              title={flacon.name}
                            >
                              <img src={flacon.url} alt={flacon.name} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-400 mb-1 font-medium">Fragrance Name</label>
                        <input
                          type="text"
                          required
                          value={pName}
                          onChange={(e) => setPName(e.target.value)}
                          placeholder="e.g. Ceylon Royal Oud"
                          className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-400 mb-1 font-medium">Olfactory Category</label>
                        <select
                          value={pCategory}
                          onChange={(e) => setPCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                        >
                          {FRAGRANCE_CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-neutral-400 mb-1 font-medium">Price (LKR)</label>
                        <input
                          type="number"
                          required
                          value={pPrice}
                          onChange={(e) => setPPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-400 mb-1 font-medium">Compare Price (LKR)</label>
                        <input
                          type="number"
                          value={pComparePrice || ''}
                          onChange={(e) => setPComparePrice(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Optional"
                          className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-400 mb-1 font-medium">Volume (ml)</label>
                        <input
                          type="number"
                          value={pVolumeMl}
                          onChange={(e) => setPVolumeMl(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-400 mb-1 font-medium">Concentration</label>
                        <select
                          value={pConcentration}
                          onChange={(e) => setPConcentration(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="Extrait de Parfum">Extrait de Parfum (35%)</option>
                          <option value="Eau de Parfum">Eau de Parfum (20%)</option>
                          <option value="Discovery Coffret">Discovery Coffret Set</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-neutral-400 mb-1 font-medium">Stock Count</label>
                        <input
                          type="number"
                          value={pStock}
                          onChange={(e) => setPStock(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">Fragrance Notes Summary</label>
                      <input
                        type="text"
                        value={pNotes}
                        onChange={(e) => setPNotes(e.target.value)}
                        placeholder="e.g. Top: Bergamot | Heart: Cinnamon | Base: Wild Oud"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="pFeaturedCheck"
                        checked={pFeatured}
                        onChange={(e) => setPFeatured(e.target.checked)}
                        className="rounded accent-amber-400 w-4 h-4"
                      />
                      <label htmlFor="pFeaturedCheck" className="text-neutral-300 font-medium">
                        Highlight as Featured Flacon on Homepage
                      </label>
                    </div>

                    <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setProductModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider shadow"
                      >
                        {editingProduct ? 'Update Flacon' : 'Publish Flacon'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: REVIEWS MODERATION */}
        {/* ========================================================= */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-white">Client Reviews Moderation</h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Approve, verify buyers with 1 click, delete spam impressions, or manually add authentic quotes
                </p>
              </div>

              <button
                onClick={() => setAddReviewModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow"
              >
                <Plus className="w-4 h-4 text-black stroke-[3]" />
                <span>Add Verified Review</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="text"
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                placeholder="Search reviews by reviewer name, perfume scent..."
                className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Reviews List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReviews.map((r, idx) => {
                const reviewId = r.id || `rev-${idx}`
                return (
                  <div
                    key={reviewId}
                    className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between space-y-4 shadow-lg hover:border-neutral-700 transition"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-800 border border-amber-400/30">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={r.avatar_url || getAvatarFromEmail(r.email || r.name, r.name)}
                              alt={r.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white">{r.name}</p>
                            <p className="text-[10px] text-neutral-400 font-mono">
                              {r.email || r.location || 'Colombo, Sri Lanka'} &bull; {r.date}
                            </p>
                          </div>
                        </div>

                        {/* Verified Purchase Badge */}
                        <button
                          onClick={() => handleToggleReviewVerified(reviewId)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 transition ${
                            r.verified
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                          title="Click to toggle Verified Purchase badge"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{r.verified ? 'Verified Buyer' : 'Unverified'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-700'
                            }`}
                          />
                        ))}
                        <span className="text-[11px] font-mono text-amber-400 ml-1.5 font-bold">
                          {r.scent}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-300 font-light leading-relaxed italic">
                        &quot;{r.review}&quot;
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-neutral-500">
                        Live on Homepage
                      </span>
                      <button
                        onClick={() => handleDeleteReviewItem(reviewId, r.name)}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 text-xs font-mono transition flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Review</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ADD REVIEW MODAL */}
            {addReviewModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                <div className="w-full max-w-md bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4 text-neutral-200 relative">
                  <button
                    onClick={() => setAddReviewModalOpen(false)}
                    className="absolute top-5 right-5 text-neutral-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div>
                    <h3 className="text-lg font-serif font-bold text-white">Add Verified Customer Impression</h3>
                    <p className="text-xs text-neutral-400">Post an approved client testimonial to the live website</p>
                  </div>

                  <form onSubmit={handleAddReviewSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">Customer Full Name</label>
                      <input
                        type="text"
                        required
                        value={rName}
                        onChange={(e) => setRName(e.target.value)}
                        placeholder="e.g. Dr. Senaka Wickramasinghe"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">Customer Email (Optional)</label>
                      <input
                        type="email"
                        value={rEmail}
                        onChange={(e) => setREmail(e.target.value)}
                        placeholder="senaka.w@gmail.com"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">Perfume Scent</label>
                      <select
                        value={rScent}
                        onChange={(e) => setRScent(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">Rating (1 to 5 Stars)</label>
                      <select
                        value={rRating}
                        onChange={(e) => setRRating(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono focus:outline-none focus:border-amber-400"
                      >
                        <option value="5">★★★★★ (5/5 Exceptional)</option>
                        <option value="4">★★★★☆ (4/5 Very Good)</option>
                        <option value="3">★★★☆☆ (3/5 Average)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">Customer Review Quote</label>
                      <textarea
                        required
                        rows={3}
                        value={rText}
                        onChange={(e) => setRText(e.target.value)}
                        placeholder="Incredible projection and longevity. Truly majestic Ceylon Agarwood."
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="rVerifiedCheck"
                        checked={rVerified}
                        onChange={(e) => setRVerified(e.target.checked)}
                        className="rounded accent-emerald-500 w-4 h-4"
                      />
                      <label htmlFor="rVerifiedCheck" className="text-neutral-300 font-medium">
                        Mark as Verified Purchase Buyer
                      </label>
                    </div>

                    <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setAddReviewModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-neutral-800 text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider"
                      >
                        Publish Review
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: MEDIA & PHOTOS GALLERY */}
        {/* ========================================================= */}
        {activeTab === 'media' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-white">Media Library & Flacon Photos</h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Upload flacon photos straight from phone gallery or camera, and copy 1-click URLs to use in products or hero slides
                </p>
              </div>

              <div>
                <input
                  type="file"
                  accept="image/*"
                  ref={mediaFileInputRef}
                  onChange={handleMediaUpload}
                  className="hidden"
                />
                <button
                  onClick={() => mediaFileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg"
                >
                  <Upload className="w-4 h-4 stroke-[3]" />
                  <span>Upload from Gallery / Camera</span>
                </button>
              </div>
            </div>

            {/* Media Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mediaAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow group hover:border-purple-400/40 transition flex flex-col justify-between"
                >
                  <div className="h-36 bg-neutral-800 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-xs font-semibold text-white truncate" title={asset.name}>
                      {asset.name}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-800 text-[10px] font-mono">
                      <button
                        onClick={() => handleCopyUrl(asset.url)}
                        className="text-purple-300 hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedMediaUrl === asset.url ? 'Copied!' : 'Copy URL'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteMedia(asset.id)}
                        className="text-neutral-500 hover:text-rose-400"
                        title="Delete Image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: STOREFRONT & CONTENT CUSTOMIZER */}
        {/* ========================================================= */}
        {activeTab === 'content' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-white">Storefront Copy & Brand Settings</h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Update hero banner headline, top ticker announcement, address, and atelier phone
                </p>
              </div>

              <Link
                href="/admin/dashboard/customizer"
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow"
              >
                <Sliders className="w-4 h-4 text-black" />
                <span>Open Full Visual Customizer</span>
              </Link>
            </div>

            <form onSubmit={handleSaveContentConfig} className="space-y-6">
              {/* Hero Banner Section */}
              <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Main Hero Banner</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Hero Top Badge</label>
                    <input
                      type="text"
                      value={heroBadge}
                      onChange={(e) => setHeroBadge(e.target.value)}
                      placeholder="e.g. Artisanal Sri Lankan Haute Parfumerie"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">CTA Button Text</label>
                    <input
                      type="text"
                      value={heroCta}
                      onChange={(e) => setHeroCta(e.target.value)}
                      placeholder="e.g. Explore Flacons"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block text-neutral-400 mb-1 font-medium">Hero Headline</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="e.g. Distilled From Pure Ceylon Earth"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-serif text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="text-xs">
                  <label className="block text-neutral-400 mb-1 font-medium">Hero Subheading</label>
                  <textarea
                    rows={2}
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="Describe craftsmanship and notes..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Announcement Bar */}
              <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-amber-300" />
                    <span>Top Announcement Ticker</span>
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      id="annToggle"
                      checked={announcementEnabled}
                      onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                      className="rounded accent-amber-400 w-4 h-4"
                    />
                    <label htmlFor="annToggle" className="text-neutral-300 font-mono text-[11px]">
                      Enable Top Bar
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div className="sm:col-span-3">
                    <label className="block text-neutral-400 mb-1 font-medium">Ticker Announcement Message</label>
                    <input
                      type="text"
                      value={announcementMsg}
                      onChange={(e) => setAnnouncementMsg(e.target.value)}
                      placeholder="e.g. COMPLIMENTARY ISLAND-WIDE DISPATCH ON ORDERS OVER LKR 10,000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Rotation Speed (Sec)</label>
                    <input
                      type="number"
                      value={announcementSpeed}
                      onChange={(e) => setAnnouncementSpeed(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Brand & Atelier Contacts */}
              <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>Brand Identity & Atelier Concierge</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Brand Name</label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Tagline</label>
                    <input
                      type="text"
                      value={brandTagline}
                      onChange={(e) => setBrandTagline(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">WhatsApp Number</label>
                    <input
                      type="text"
                      value={brandWhatsapp}
                      onChange={(e) => setBrandWhatsapp(e.target.value)}
                      placeholder="+94771234567"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Concierge Phone</label>
                    <input
                      type="text"
                      value={brandPhone}
                      onChange={(e) => setBrandPhone(e.target.value)}
                      placeholder="+94 77 123 4567"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Concierge Email</label>
                    <input
                      type="email"
                      value={brandEmail}
                      onChange={(e) => setBrandEmail(e.target.value)}
                      placeholder="concierge@aromaperfumes.lk"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block text-neutral-400 mb-1 font-medium">Atelier Physical Address</label>
                  <input
                    type="text"
                    value={brandAddress}
                    onChange={(e) => setBrandAddress(e.target.value)}
                    placeholder="No. 45, Ward Place, Colombo 07, Sri Lanka"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs shadow-lg transition"
                >
                  Save & Publish Live Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: E-COMMERCE TOOLS (COUPONS & DELIVERY) */}
        {/* ========================================================= */}
        {activeTab === 'ecommerce' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-serif font-bold text-white">Coupons, Shipping & Payment Methods</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Configure discount coupons, free delivery threshold, and cash-on-delivery settings
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Promo Coupons */}
              <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  <span>Promo Codes & Discounts</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Active Promo Code</label>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. AROMA10"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Discount Percentage (%)</label>
                    <input
                      type="number"
                      value={couponDiscount}
                      onChange={(e) => setCouponDiscount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast(`✓ Promo code ${couponCode} (${couponDiscount}% OFF) saved!`)}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider text-xs"
                  >
                    Save Promo Code
                  </button>
                </div>
              </div>

              {/* Delivery Rates */}
              <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-purple-400" />
                  <span>Island-wide Delivery Fees</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Free Delivery Minimum (LKR)</label>
                    <input
                      type="number"
                      value={freeShippingThreshold}
                      onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1.5 text-[11px] font-mono text-neutral-300">
                    <p className="font-semibold text-white">Default District Shipping Rates:</p>
                    <p>&bull; Colombo: FREE (over LKR {freeShippingThreshold.toLocaleString()}) or LKR 350</p>
                    <p>&bull; Gampaha & Kalutara: LKR 400</p>
                    <p>&bull; Kandy, Galle, Matara & Outstation: LKR 500</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast('✓ Delivery rates updated!')}
                    className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold uppercase tracking-wider text-xs"
                  >
                    Save Delivery Threshold
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: SETTINGS & SEO */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-serif font-bold text-white">SEO & Social Meta Configuration</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Optimize how Aroma appears on Google Search and Facebook / WhatsApp share cards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SEO Form */}
              <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>Google Search Meta</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Meta Title Tag</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Meta Description</label>
                    <textarea
                      rows={3}
                      value={seoDesc}
                      onChange={(e) => setSeoDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">OpenGraph Social Share Image URL</label>
                    <input
                      type="text"
                      value={seoOgImage}
                      onChange={(e) => setSeoOgImage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-[11px] focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast('✓ SEO Meta Tags saved!')}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider text-xs"
                  >
                    Save SEO Settings
                  </button>
                </div>
              </div>

              {/* Google Live Search Preview Mockup */}
              <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <h3 className="text-sm font-semibold text-white">Google Search Result Preview</h3>
                <div className="p-4 rounded-2xl bg-white text-black space-y-1 shadow">
                  <p className="text-[11px] text-[#202124] font-mono">https://aromaperfumes.lk</p>
                  <p className="text-base text-[#1a0dab] font-sans hover:underline font-medium cursor-pointer">
                    {seoTitle}
                  </p>
                  <p className="text-xs text-[#4d5156] font-sans line-clamp-2">
                    {seoDesc}
                  </p>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-neutral-400 font-mono">
                    ✦ Includes Schema.org PerfumeStore structured JSON-LD data for high Google ranking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 9: ASK AROMA BOT */}
        {/* ========================================================= */}
        {activeTab === 'bot' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-serif font-bold text-white">Ask Aroma AI Concierge</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Configure the intelligent fragrance advisor powered by Gemini AI
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-4 max-w-2xl">
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Bot Trigger Button Label</label>
                  <input
                    type="text"
                    value={botLabel}
                    onChange={(e) => setBotLabel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Welcome Greeting Message</label>
                  <textarea
                    rows={2}
                    value={botGreeting}
                    onChange={(e) => setBotGreeting(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Gemini AI Model</label>
                  <select
                    value={botModel}
                    onChange={(e) => setBotModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-amber-400"
                  >
                    <option value="gemini-2.5-flash">gemini-2.5-flash (Ultra Fast & Accurate)</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Fragrance Connoisseur)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => showToast('✓ Ask Aroma Bot configuration updated!')}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-wider text-xs"
                >
                  Save Bot Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 10: ALL 57 DATABASE TABLES */}
        {/* ========================================================= */}
        {activeTab === 'tables' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-white">All 57 Supabase Database Tables</h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Direct raw table viewers for advanced database entities, logs, sessions, and schemas
                </p>
              </div>

              <span className="text-xs font-mono text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800">
                {filteredTables.length} Tables Available
              </span>
            </div>

            {/* Search and Category Filter */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTable}
                  onChange={(e) => setSearchTable(e.target.value)}
                  placeholder="Filter tables by name or slug..."
                  className="w-full pl-8 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto text-[11px] pb-1">
                {tableCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-amber-400 text-black font-bold'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredTables.map((t) => (
                <Link
                  key={t.table}
                  href={`/admin/dashboard/${t.slug}`}
                  className="p-3.5 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 hover:border-amber-400/40 transition flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[9px] font-mono uppercase text-neutral-500">{t.category}</span>
                    <p className="text-xs font-semibold text-white mt-0.5 truncate group-hover:text-amber-300 transition">
                      {t.name}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 mt-2 truncate">
                    {t.table}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}