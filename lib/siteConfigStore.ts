'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface HeroSlideConfig {
  id: string
  title: string
  subtitle: string
  badge_text: string
  description: string
  media_type: 'image' | 'video'
  image_url: string
  video_url?: string
  mobile_image_url?: string
  cta_text: string
  cta_link: string
  animation_type: 'zoomSlow' | 'fadeUp' | 'slideIn'
  duration: number
  is_active: boolean
}

export interface ReviewItem {
  id?: string
  name: string
  email?: string
  avatar_url?: string
  location?: string
  scent: string
  rating: number
  review: string
  date: string
  verified?: boolean
}

export interface NavLinkItem {
  label: string
  href: string
}

export interface SiteConfig {
  brand: {
    name: string
    subtitle: string
    tagline: string
    accentColor: 'amber' | 'emerald' | 'rose' | 'noir'
    conciergePhone: string
    conciergeEmail: string
    atelierAddress: string
    whatsappNumber: string
    copyrightText: string
  }
  navigation: {
    items: NavLinkItem[]
  }
  announcements: {
    enabled: boolean
    speedSeconds: number
    messages: string[]
  }
  hero: {
    slides: HeroSlideConfig[]
  }
  trustPillars: {
    title: string
    description: string
    badge: string
  }[]
  catalogSection: {
    badge: string
    title: string
    description: string
    ctaText: string
    ctaLink: string
  }
  scentQuiz: {
    badge: string
    title: string
    description: string
    ctaText: string
  }
  scentPyramid: {
    badge: string
    title: string
    description: string
    topTitle: string
    topDesc: string
    topNotes: string[]
    heartTitle: string
    heartDesc: string
    heartNotes: string[]
    baseTitle: string
    baseDesc: string
    baseNotes: string[]
  }
  craftsmanship: {
    badge: string
    title: string
    storyHeadline: string
    p1: string
    p2: string
    stat1Number: string
    stat1Label: string
    stat2Number: string
    stat2Label: string
    stat3Number: string
    stat3Label: string
    imageUrl: string
    ctaText: string
    ctaLink: string
  }
  testimonials: {
    badge: string
    title: string
    description: string
    writeReviewBtnText: string
    items: ReviewItem[]
  }
  vipCircle: {
    headline: string
    subhead: string
    promoCode: string
    discountPercent: number
    ctaText: string
  }
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string
    ogImage: string
    canonicalUrl: string
    analyticsId?: string
    pixelId?: string
  }
}

export function getAvatarFromEmail(email?: string, name?: string): string {
  if (!email && !name) {
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  }
  const cleanEmail = (email || '').trim().toLowerCase()
  const cleanName = (name || '').trim()
  const seed = encodeURIComponent(cleanEmail || cleanName || 'Aroma')
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=b8860b,d4af37,171717&textColor=ffffff`
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  brand: {
    name: 'AROMA',
    subtitle: 'FINE PERFUMERY · CEYLON',
    tagline: 'Artisanal Sri Lankan Haute Parfumerie',
    accentColor: 'amber',
    conciergePhone: '+94 77 123 4567',
    conciergeEmail: 'concierge@aroma.lk',
    atelierAddress: 'No. 45, Ward Place, Colombo 07, Sri Lanka',
    whatsappNumber: '+94771234567',
    copyrightText: 'AROMA FINE PERFUMERY SRI LANKA. ALL RIGHTS RESERVED.'
  },
  navigation: {
    items: [
      { label: 'Catalog', href: '#fragrance-catalog' },
      { label: 'Collections', href: '#fragrance-catalog' },
      { label: 'Scent Matcher', href: '#scent-finder' },
      { label: 'Craftsmanship', href: '#craftsmanship' },
      { label: 'Reviews', href: '#testimonials' }
    ]
  },
  announcements: {
    enabled: true,
    speedSeconds: 5,
    messages: [
      '✦ COMPLIMENTARY EXPRESS DELIVERY ON ALL ORDERS OVER LKR 10,000 ISLAND-WIDE ✦',
      '✦ 2 FREE BESPOKE 3ML SAMPLES INCLUDED WITH EVERY FULL-SIZE FLACON ✦',
      '✦ HAND-CRAFTED & DISTILLED IN COLOMBO, SRI LANKA · 100% CRUELTY-FREE ✦'
    ]
  },
  hero: {
    slides: [
      {
        id: 'slide-1',
        title: 'CEYLON\nROYAL OUD',
        subtitle: 'EXTRAIT DE PARFUM · 35% OIL CONCENTRATION',
        badge_text: 'HANDCRAFTED IN SRI LANKA',
        description: 'Distilled from sustainably sourced ancient Ceylon Agarwood, enriched with sun-warmed organic cinnamon bark, dark patchouli, and golden smoked amber.',
        media_type: 'image',
        image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1600&auto=format&fit=crop&q=85',
        cta_text: 'Explore Royal Oud',
        cta_link: '#fragrance-catalog',
        animation_type: 'zoomSlow',
        duration: 6,
        is_active: true
      },
      {
        id: 'slide-2',
        title: 'MIDNIGHT\nCINNAMON NOIR',
        subtitle: 'AN OLFACTORY ODE TO THE SPICE ISLAND',
        badge_text: 'PRIVATE RESERVE 2026',
        description: 'Pure organic Ceylon cinnamon quill absolute married with French damask rose, smoked Madagascar vanilla, and velvet Haitian vetiver.',
        media_type: 'image',
        image_url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=1600&auto=format&fit=crop&q=85',
        cta_text: 'Discover Noir Series',
        cta_link: '#fragrance-catalog',
        animation_type: 'zoomSlow',
        duration: 6,
        is_active: true
      },
      {
        id: 'slide-3',
        title: 'AQUA DE\nCEYLON',
        subtitle: 'CRISP OCEAN MIST & SUNLIT AMBERGRIS',
        badge_text: 'TROPICAL SIGNATURE',
        description: 'Vibrant Indian Ocean sea spray blended with crushed green bergamot, coastal driftwood, and sparkling white musk crafted for 14-hour tropical wear.',
        media_type: 'image',
        image_url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1600&auto=format&fit=crop&q=85',
        cta_text: 'Shop Summer Breeze',
        cta_link: '#fragrance-catalog',
        animation_type: 'zoomSlow',
        duration: 6,
        is_active: true
      }
    ]
  },
  trustPillars: [
    {
      title: '35% Extrait Concentration',
      description: '16+ hour guaranteed longevity on skin',
      badge: 'Extrait'
    },
    {
      title: 'Ceylon Native Botanicals',
      description: 'Organic Cinnamon & sustainably aged Oud',
      badge: 'Artisanal'
    },
    {
      title: 'Express Island Delivery',
      description: 'Free delivery for orders above LKR 10,000',
      badge: 'Courier'
    },
    {
      title: 'IFRA & Cruelty Certified',
      description: 'Crafted with the cleanest natural extracts',
      badge: 'Certified'
    }
  ],
  catalogSection: {
    badge: 'Curated Haute Parfumerie',
    title: 'The Artisan Collection',
    description: 'Each bottle is hand-distilled, numbered, and bottled in Colombo using ancient maceration traditions.',
    ctaText: 'Explore Collection',
    ctaLink: '#fragrance-catalog'
  },
  scentQuiz: {
    badge: 'Interactive Olfactory Matcher',
    title: 'Discover Your Signature Scent',
    description: 'Answer 3 brief questions to identify your harmonized Ceylon artisan fragrance persona.',
    ctaText: 'Find Your Scent'
  },
  scentPyramid: {
    badge: 'The Architecture of Scent',
    title: 'The Ceylon Olfactory Pyramid',
    description: 'Understanding how handcrafted Extrait de Parfum evolves dynamically across your skin over 24 hours.',
    topTitle: 'Top Notes (The Head)',
    topDesc: 'The immediate introduction that awakens the senses upon first mist. Highly volatile and sparkling.',
    topNotes: ['Calabrian Bergamot', 'Pink Peppercorn', 'Bitter Orange', 'Indian Ocean Spray'],
    heartTitle: 'Heart Notes (The Soul)',
    heartDesc: 'The true personality that emerges as the fragrance settles. Featuring certified organic Ceylon spices.',
    heartNotes: ['Ceylon Cinnamon Quills', 'Taif Rose', 'Green Cardamom', 'Smoked Clove'],
    baseTitle: 'Base Notes (The Memory)',
    baseDesc: 'The deepest, rich resins and woods that cling to skin and garments, creating your memorable signature trail.',
    baseNotes: ['Aged Ceylon Agarwood', 'Golden Ambergris', 'Mysore Sandalwood', 'Bourbon Vanilla']
  },
  craftsmanship: {
    badge: 'Our Story & Philosophy',
    title: "Honoring Sri Lanka's Ancient Spice Kingdom",
    storyHeadline: 'Centuries of Spice Heritage Married with French Haute Parfumerie',
    p1: 'For over two millennia, the pearl of the Indian Ocean was celebrated by Venetian merchants and Arab traders as the legendary Spice Island. At Aroma, we revive this legacy.',
    p2: 'We extract our rare wild Agarwood in small, sustainable batches from mature trees in the western foothills. Our organic cinnamon quills are distilled within 48 hours of harvest to capture volatile aromatic terpenes that commercial mass-market perfumes simply cannot replicate.',
    stat1Number: '35%',
    stat1Label: 'Pure Extrait Oil',
    stat2Number: '12 Yrs',
    stat2Label: 'Aged Oud Reserve',
    stat3Number: '100%',
    stat3Label: 'Vegan & Cruelty Free',
    imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=1200&auto=format&fit=crop&q=85',
    ctaText: 'Visit Colombo Atelier',
    ctaLink: 'https://wa.me/94771234567'
  },
  testimonials: {
    badge: 'Connoisseur Impressions',
    title: 'Words From Fragrance Enthusiasts',
    description: 'Verified experiences from clients across Sri Lanka and international collectors.',
    writeReviewBtnText: 'Write a Fragrance Review',
    items: [
      {
        name: 'Dr. Shanil Wickramasinghe',
        email: 'shanil.w@gmail.com',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        location: 'Colombo 07',
        scent: 'Ceylon Royal Oud (Extrait)',
        rating: 5,
        review: 'The longevity is unlike anything else available in Sri Lanka. 14 hours after application I was still receiving compliments during a dinner reception. True international niche quality with genuine Ceylon spice character.',
        date: '2 days ago',
        verified: true
      },
      {
        name: 'Kavindi Senaratne',
        email: 'kavindi.s@gmail.com',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        location: 'Kandy',
        scent: 'Midnight Cinnamon Noir',
        rating: 5,
        review: 'Pure luxury from the presentation box to the drydown. The cinnamon is genuine and warm, not synthetic like mass-market designer perfumes. My new signature scent.',
        date: '1 week ago',
        verified: true
      },
      {
        name: 'Thilina Perera',
        email: 'thilina.p@gmail.com',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        location: 'Galle Fort',
        scent: 'Aqua de Ceylon',
        rating: 5,
        review: 'The perfect aquatic for our tropical heat. Stays vibrant and fresh in high humidity without breaking down. Beautiful bottle design too.',
        date: '2 weeks ago',
        verified: true
      }
    ]
  },
  vipCircle: {
    headline: 'Join the Aroma Private Circle',
    subhead: 'Receive a complimentary 10% discount voucher on your first purchase and private invitations to limited harvest batches.',
    promoCode: 'AROMA10',
    discountPercent: 10,
    ctaText: 'Join Circle'
  },
  seo: {
    metaTitle: 'Aroma Perfumes | Artisanal Ceylon Haute Parfumerie',
    metaDescription: 'Discover handcrafted Extrait de Parfum infused with ancient Ceylon Agarwood, organic cinnamon quills, and rare Indian Ocean resins. Island-wide express delivery.',
    keywords: 'aroma perfumes, ceylon oud, sri lanka perfume, colombo fragrances, extrait de parfum, luxury perfume colombo',
    ogImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1200&auto=format&fit=crop&q=85',
    canonicalUrl: 'https://aromaperfumes.lk',
    analyticsId: 'G-AROMA2026',
    pixelId: 'FB-AROMA8899'
  }
}

const STORAGE_KEY = 'aroma_site_customizer_config'
const SYNC_EVENT = 'aroma_site_config_updated'

export function getStoredSiteConfig(): SiteConfig {
  if (typeof window === 'undefined') return DEFAULT_SITE_CONFIG
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        ...DEFAULT_SITE_CONFIG,
        ...parsed,
        brand: { ...DEFAULT_SITE_CONFIG.brand, ...(parsed.brand || {}) },
        navigation: { ...DEFAULT_SITE_CONFIG.navigation, ...(parsed.navigation || {}) },
        announcements: { ...DEFAULT_SITE_CONFIG.announcements, ...(parsed.announcements || {}) },
        hero: { ...DEFAULT_SITE_CONFIG.hero, ...(parsed.hero || {}) },
        catalogSection: { ...DEFAULT_SITE_CONFIG.catalogSection, ...(parsed.catalogSection || {}) },
        scentQuiz: { ...DEFAULT_SITE_CONFIG.scentQuiz, ...(parsed.scentQuiz || {}) },
        scentPyramid: { ...DEFAULT_SITE_CONFIG.scentPyramid, ...(parsed.scentPyramid || {}) },
        craftsmanship: { ...DEFAULT_SITE_CONFIG.craftsmanship, ...(parsed.craftsmanship || {}) },
        testimonials: {
          ...DEFAULT_SITE_CONFIG.testimonials,
          ...(parsed.testimonials || {}),
          items: parsed.testimonials?.items || DEFAULT_SITE_CONFIG.testimonials.items
        },
        vipCircle: { ...DEFAULT_SITE_CONFIG.vipCircle, ...(parsed.vipCircle || {}) },
        seo: { ...DEFAULT_SITE_CONFIG.seo, ...(parsed.seo || {}) }
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_SITE_CONFIG
}

export async function saveAndPublishConfig(config: SiteConfig): Promise<{ success: boolean; message: string }> {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
      window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: config }))
    }

    try {
      await supabase.from('site_settings').upsert({
        id: 'main-settings',
        brand_name: config.brand.name,
        tagline: config.brand.tagline,
        contact_phone: config.brand.conciergePhone,
        contact_email: config.brand.conciergeEmail,
        updated_at: new Date().toISOString()
      })
    } catch {
      // offline/fallback
    }

    return { success: true, message: 'Storefront updated and published live!' }
  } catch (e: any) {
    return { success: false, message: e.message || 'Failed to save configuration' }
  }
}

export async function addCustomerReview(review: ReviewItem): Promise<boolean> {
  try {
    const current = getStoredSiteConfig()
    const reviewWithAvatar: ReviewItem = {
      ...review,
      id: review.id || `rev-${Date.now()}`,
      avatar_url: review.avatar_url || getAvatarFromEmail(review.email, review.name),
      date: review.date || 'Just now',
      verified: review.verified !== undefined ? review.verified : true
    }

    const updatedConfig: SiteConfig = {
      ...current,
      testimonials: {
        ...current.testimonials,
        items: [reviewWithAvatar, ...current.testimonials.items]
      }
    }

    await saveAndPublishConfig(updatedConfig)

    try {
      await supabase.from('reviews').insert([
        {
          customer_name: review.name,
          customer_email: review.email || null,
          rating: review.rating,
          comment: review.review,
          product_id: review.scent,
          is_verified_purchase: review.verified ?? true,
          is_approved: true
        }
      ])
    } catch {
      // fallback
    }

    return true
  } catch (e) {
    console.error('Error adding customer review:', e)
    return false
  }
}

export async function deleteCustomerReview(reviewId: string): Promise<boolean> {
  try {
    const current = getStoredSiteConfig()
    const updatedItems = current.testimonials.items.filter((r) => r.id !== reviewId)
    const updatedConfig: SiteConfig = {
      ...current,
      testimonials: {
        ...current.testimonials,
        items: updatedItems
      }
    }
    await saveAndPublishConfig(updatedConfig)

    try {
      await supabase.from('reviews').delete().eq('id', reviewId)
    } catch {
      // ignore
    }
    return true
  } catch (e) {
    console.error('Error deleting review:', e)
    return false
  }
}

export async function toggleVerifyCustomerReview(reviewId: string): Promise<boolean> {
  try {
    const current = getStoredSiteConfig()
    const updatedItems = current.testimonials.items.map((r) => {
      if (r.id === reviewId) {
        return { ...r, verified: !r.verified }
      }
      return r
    })
    const updatedConfig: SiteConfig = {
      ...current,
      testimonials: {
        ...current.testimonials,
        items: updatedItems
      }
    }
    await saveAndPublishConfig(updatedConfig)
    return true
  } catch (e) {
    console.error('Error toggling review verification:', e)
    return false
  }
}

// -------------------------------------------------------------
// Placed Orders Management (Supabase + LocalStorage Fallback)
// -------------------------------------------------------------
export interface PlacedOrderItem {
  id?: string
  name: string
  price: number
  quantity: number
  volume_ml: number
  image_url?: string
}

export interface PlacedOrder {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  shipping_address: string
  district: string
  payment_method: string
  payment_status: 'pending' | 'paid' | 'awaiting_transfer'
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  discount: number
  shipping_fee: number
  total_amount: number
  notes?: string
  items: PlacedOrderItem[]
  created_at: string
}

const ORDERS_KEY = 'aroma_placed_orders'
export const ORDERS_SYNC_EVENT = 'aroma_orders_sync'

export function getStoredOrders(): PlacedOrder[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(ORDERS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }

  // Pre-seed with realistic sample orders so Store Owner sees the flow immediately
  const sampleOrders: PlacedOrder[] = [
    {
      id: 'ord-101',
      order_number: 'ARM-882194',
      customer_name: 'Dr. Senaka Wickramasinghe',
      customer_phone: '+94 77 912 3456',
      customer_email: 'senaka.w@gmail.com',
      shipping_address: 'No. 18, Guildford Crescent, Colombo 07',
      district: 'Colombo',
      payment_method: 'Cash on Delivery (COD)',
      payment_status: 'pending',
      order_status: 'processing',
      subtotal: 18500,
      discount: 0,
      shipping_fee: 0,
      total_amount: 18500,
      notes: 'Please dispatch before 4 PM. Fragile flacon.',
      items: [
        {
          name: 'Ceylon Royal Oud',
          price: 18500,
          quantity: 1,
          volume_ml: 50,
          image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=85'
        }
      ],
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'ord-102',
      order_number: 'ARM-710492',
      customer_name: 'Nimasha Fernando',
      customer_phone: '+94 71 456 7890',
      customer_email: 'nimasha.f@outlook.com',
      shipping_address: '42/1, Beach Road, Mount Lavinia',
      district: 'Colombo',
      payment_method: 'Cash on Delivery (COD)',
      payment_status: 'pending',
      order_status: 'shipped',
      subtotal: 31000,
      discount: 3100,
      shipping_fee: 0,
      total_amount: 27900,
      notes: 'Leave at security desk if unavailable.',
      items: [
        {
          name: 'Cinnamon Quills & Taif Rose',
          price: 16500,
          quantity: 1,
          volume_ml: 50,
          image_url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=85'
        },
        {
          name: 'Spice Route Bourbon',
          price: 14500,
          quantity: 1,
          volume_ml: 50,
          image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=85'
        }
      ],
      created_at: new Date(Date.now() - 3600000 * 22).toISOString()
    }
  ]

  if (typeof window !== 'undefined') {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(sampleOrders))
  }
  return sampleOrders
}

export function savePlacedOrder(order: PlacedOrder) {
  if (typeof window === 'undefined') return
  try {
    const existing = getStoredOrders()
    const updated = [order, ...existing.filter((o) => o.id !== order.id && o.order_number !== order.order_number)]
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent(ORDERS_SYNC_EVENT, { detail: updated }))
  } catch (e) {
    console.error('Error saving order locally:', e)
  }
}

export function updateOrderStatus(orderId: string, status: PlacedOrder['order_status']) {
  if (typeof window === 'undefined') return
  try {
    const existing = getStoredOrders()
    const updated = existing.map((o) => (o.id === orderId || o.order_number === orderId ? { ...o, order_status: status } : o))
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent(ORDERS_SYNC_EVENT, { detail: updated }))
  } catch (e) {
    console.error('Error updating order status:', e)
  }
}

export function deleteStoredOrder(orderId: string) {
  if (typeof window === 'undefined') return
  try {
    const existing = getStoredOrders()
    const updated = existing.filter((o) => o.id !== orderId && o.order_number !== orderId)
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent(ORDERS_SYNC_EVENT, { detail: updated }))
  } catch (e) {
    console.error('Error deleting order:', e)
  }
}

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(getStoredSiteConfig)

  useEffect(() => {
    setConfig(getStoredSiteConfig())

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setConfig(e.detail)
      }
    }

    window.addEventListener(SYNC_EVENT, handleUpdate)
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setConfig(JSON.parse(e.newValue))
        } catch {
          // ignore
        }
      }
    })

    return () => {
      window.removeEventListener(SYNC_EVENT, handleUpdate)
    }
  }, [])

  const update = useCallback((newConfig: SiteConfig) => {
    setConfig(newConfig)
    saveAndPublishConfig(newConfig)
  }, [])

  return { config, update, refresh: () => setConfig(getStoredSiteConfig()) }
}
