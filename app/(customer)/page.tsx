'use client'

import { useState, useEffect } from 'react'
import HeroLive from '@/app/components/HeroLive'
import ScentFinder from '@/app/components/ScentFinder'
import FragranceModal from '@/app/components/FragranceModal'
import { AROMA_FRAGRANCES, FRAGRANCE_CATEGORIES, Fragrance } from '@/lib/aromaData'
import { useCart } from '@/lib/cartContext'
import { useSiteConfig, DEFAULT_SITE_CONFIG, getAvatarFromEmail, addCustomerReview } from '@/lib/siteConfigStore'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  Sparkles,
  Star,
  Eye,
  Check,
  ShieldCheck,
  Truck,
  Droplets,
  ArrowRight,
  SlidersHorizontal,
  Flame,
  Plus
} from 'lucide-react'

export default function CustomerHomePage() {
  const { config } = useSiteConfig()
  const [products, setProducts] = useState<Fragrance[]>(AROMA_FRAGRANCES)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedGender, setSelectedGender] = useState('All')
  const [sortBy, setSortBy] = useState('featured')
  const [selectedFragrance, setSelectedFragrance] = useState<Fragrance | null>(null)
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({})
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)

  // Review submission state
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewName, setReviewName] = useState('')
  const [reviewEmail, setReviewEmail] = useState('')
  const [reviewScent, setReviewScent] = useState('Ceylon Royal Oud')
  const [reviewText, setReviewText] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)

  const { addToCart, openCart } = useCart()

  // Pre-fill user details if logged in
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aroma_auth_customer')
      if (stored) {
        const u = JSON.parse(stored)
        setReviewName(u.name || '')
        setReviewEmail(u.email || '')
      }
    } catch {
      // ignore
    }
  }, [])

  // Fetch live products from Supabase if table has data
  useEffect(() => {
    const fetchSupabaseProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .limit(20)

        if (!error && data && data.length > 0) {
          const mapped: Fragrance[] = data.map((row: any, idx: number) => {
            const fallback = AROMA_FRAGRANCES[idx % AROMA_FRAGRANCES.length]
            return {
              id: String(row.id || fallback.id),
              name: row.name || fallback.name,
              slug: row.slug || fallback.slug,
              subtitle: row.description?.slice(0, 50) || fallback.subtitle,
              category: row.category_id || fallback.category,
              concentration: (row.type_id as any) || fallback.concentration,
              concentration_pct: row.volume_ml === 50 ? 35 : 30,
              price: Number(row.price || fallback.price),
              compare_price: row.compare_price ? Number(row.compare_price) : fallback.compare_price,
              volume_ml: Number(row.volume_ml || 50),
              volume_options: [10, 50, 100],
              gender: (row.gender as any) || fallback.gender,
              image_url: row.image_url || fallback.image_url,
              gallery: [row.image_url || fallback.image_url],
              description: row.description || fallback.description,
              fragrance_notes: row.fragrance_notes || fallback.fragrance_notes,
              notes_top: fallback.notes_top,
              notes_heart: fallback.notes_heart,
              notes_base: fallback.notes_base,
              longevity: fallback.longevity,
              sillage: fallback.sillage,
              season: fallback.season,
              is_featured: row.is_featured ?? fallback.is_featured,
              is_best_seller: fallback.is_best_seller,
              rating: fallback.rating,
              reviews_count: fallback.reviews_count,
              stock: Number(row.stock || 25)
            }
          })
          setProducts(mapped)
        } else {
          setProducts(AROMA_FRAGRANCES)
        }
      } catch {
        setProducts(AROMA_FRAGRANCES)
      }
    }

    fetchSupabaseProducts()
  }, [])

  // Filter & sort logic
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
    const matchesGender = selectedGender === 'All' || p.gender === selectedGender
    return matchesCategory && matchesGender
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price
    if (sortBy === 'price-high') return b.price - a.price
    if (sortBy === 'rating') return b.rating - a.rating
    return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)
  })

  const handleQuickAdd = (p: Fragrance) => {
    addToCart({
      id: p.id,
      name: p.name,
      price: p.price,
      volume_ml: p.volume_ml,
      image_url: p.image_url,
      concentration: p.concentration
    })
    setAddedIds((prev) => ({ ...prev, [p.id]: true }))
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [p.id]: false }))
      openCart()
    }, 600)
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail) return
    setNewsletterSubscribed(true)
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewName || !reviewText) return

    await addCustomerReview({
      name: reviewName,
      email: reviewEmail,
      location: 'Colombo, Sri Lanka',
      scent: reviewScent,
      rating: reviewRating,
      review: reviewText,
      date: 'Just now',
      verified: true
    })

    setReviewSuccess(true)
    setTimeout(() => {
      setReviewModalOpen(false)
      setReviewSuccess(false)
      setReviewText('')
    }, 1500)
  }

  const pillars = config?.trustPillars || DEFAULT_SITE_CONFIG.trustPillars
  const pyramid = config?.scentPyramid || DEFAULT_SITE_CONFIG.scentPyramid
  const craft = config?.craftsmanship || DEFAULT_SITE_CONFIG.craftsmanship
  const vip = config?.vipCircle || DEFAULT_SITE_CONFIG.vipCircle
  const brand = config?.brand || DEFAULT_SITE_CONFIG.brand
  const testimonials = config?.testimonials?.items || DEFAULT_SITE_CONFIG.testimonials.items

  return (
    <div className="bg-[#050505] text-white">
      {/* 1. HERO SLIDER (Real-time dynamic component synchronized with siteConfig) */}
      <HeroLive />

      {/* 2. PILLARS OF ARTISAN EXCELLENCE */}
      <section className="border-y border-neutral-900 bg-[#080808]/80 py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          {pillars.map((pill, idx) => (
            <div key={idx} className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-neutral-900/30 border border-neutral-900">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300 shrink-0">
                {idx === 0 ? <Droplets className="w-5 h-5" /> : idx === 1 ? <Sparkles className="w-5 h-5" /> : idx === 2 ? <Truck className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-semibold text-white tracking-wide">{pill.title}</p>
                <p className="text-neutral-400 text-[11px] mt-0.5">{pill.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CURATED FRAGRANCE CATALOG SECTION */}
      <section id="fragrance-catalog" className="max-w-7xl mx-auto px-6 py-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-[1px] w-6 bg-amber-400" />
              <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-amber-300 font-semibold">
                {config?.catalogSection?.badge || 'Curated Haute Parfumerie'}
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-light text-white tracking-tight">
              {config?.catalogSection?.title || 'The Artisan Collection'}
            </h2>
            <p className="mt-2 text-xs md:text-sm text-neutral-400 max-w-lg">
              {config?.catalogSection?.description || 'Each bottle is hand-distilled, numbered, and bottled in Colombo using ancient maceration traditions.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#scent-finder"
              className="px-5 py-2.5 rounded-full bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-xs font-mono text-amber-300 flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Take Scent Finder Quiz</span>
            </a>
          </div>
        </div>

        {/* Filters and Controls Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-10 pb-6 border-b border-neutral-900">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {FRAGRANCE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider uppercase whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/10'
                    : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gender & Sorting */}
          <div className="flex items-center gap-3 self-end lg:self-auto text-xs font-mono">
            {/* Gender Toggle */}
            <div className="flex bg-neutral-900 p-1 rounded-full border border-neutral-800">
              {['All', 'Unisex', 'Pour Homme', 'Pour Femme'].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGender(g)}
                  className={`px-3 py-1 rounded-full text-[11px] transition ${
                    selectedGender === g
                      ? 'bg-neutral-800 text-white font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1.5 bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800">
              <SlidersHorizontal className="w-3 h-3 text-amber-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-[11px] text-neutral-300 focus:outline-none cursor-pointer"
              >
                <option value="featured" className="bg-neutral-900 text-white">Featured</option>
                <option value="price-low" className="bg-neutral-900 text-white">Price: Low to High</option>
                <option value="price-high" className="bg-neutral-900 text-white">Price: High to Low</option>
                <option value="rating" className="bg-neutral-900 text-white">Customer Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="group relative rounded-3xl bg-neutral-900/40 hover:bg-neutral-900/80 border border-neutral-800/80 hover:border-amber-400/40 p-4 transition-all duration-300 flex flex-col justify-between shadow-xl"
            >
              {/* Image & Badges */}
              <div>
                <Link href={`/product/${p.slug || p.id}`} className="block">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-950 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=85'
                      }}
                    />

                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {p.is_best_seller && (
                        <span className="bg-amber-400 text-black text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <Flame className="w-3 h-3 fill-current" />
                          Best Seller
                        </span>
                      )}
                      <span className="bg-black/70 backdrop-blur border border-white/10 text-white text-[10px] font-mono px-2.5 py-0.5 rounded-full">
                        {p.concentration}
                      </span>
                    </div>

                    {/* Quick View Overlay Button */}
                    <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setSelectedFragrance(p)
                        }}
                        className="flex-1 py-2.5 bg-black/80 hover:bg-black backdrop-blur border border-white/20 text-white rounded-xl text-xs font-mono font-medium transition flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Notes</span>
                      </button>
                    </div>
                  </div>
                </Link>

                {/* Fragrance Details */}
                <div className="mt-4 px-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1">
                    <span>{p.category}</span>
                    <div className="flex items-center text-amber-400">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="ml-1 text-neutral-300">{p.rating}</span>
                    </div>
                  </div>

                  <Link href={`/product/${p.slug || p.id}`}>
                    <h3 className="text-lg font-serif font-light text-white group-hover:text-amber-300 cursor-pointer transition">
                      {p.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-neutral-400 font-light mt-1 line-clamp-2">
                    {p.subtitle || p.description}
                  </p>

                  {/* Key Notes Chips */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(p.notes_top?.slice(0, 2) || []).concat(p.notes_base?.slice(0, 1) || []).map((note, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-800/80 text-neutral-300"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Add to Cart */}
              <div className="mt-5 pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono text-neutral-500 uppercase">Flacon 50ml</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-mono font-bold text-amber-300">
                      LKR {p.price.toLocaleString()}
                    </span>
                    {p.compare_price && (
                      <span className="text-xs font-mono text-neutral-500 line-through">
                        LKR {p.compare_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleQuickAdd(p)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5 shadow-md ${
                    addedIds[p.id]
                      ? 'bg-emerald-500 text-black'
                      : 'bg-white hover:bg-neutral-200 text-black'
                  }`}
                >
                  {addedIds[p.id] ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Droplets className="w-3.5 h-3.5" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. INTERACTIVE SCENT FINDER QUIZ */}
      <ScentFinder onSelectFragrance={setSelectedFragrance} />

      {/* 5. OLFACTORY PYRAMID MASTERCLASS */}
      <section className="border-t border-neutral-900 bg-gradient-to-b from-[#080808] to-[#050505] py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-amber-400 font-semibold block mb-2">
              {pyramid.badge || 'The Architecture of Scent'}
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-light text-white">
              {pyramid.title || 'The Ceylon Olfactory Pyramid'}
            </h2>
            <p className="mt-3 text-xs md:text-sm text-neutral-400">
              {pyramid.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Tier */}
            <div className="p-8 rounded-3xl bg-neutral-900/50 border border-neutral-800 text-center relative overflow-hidden">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block mb-2">
                Phase 01 &bull; 0 to 30 Minutes
              </span>
              <h3 className="text-2xl font-serif text-white">{pyramid.topTitle}</h3>
              <p className="mt-3 text-xs text-neutral-400 leading-relaxed font-light">
                {pyramid.topDesc}
              </p>
              <div className="mt-6 pt-6 border-t border-neutral-800/80 flex flex-wrap justify-center gap-2">
                {(pyramid.topNotes || []).map((n) => (
                  <span key={n} className="px-3 py-1 rounded-full bg-neutral-800 text-xs text-neutral-300">
                    {n}
                  </span>
                ))}
              </div>
            </div>

            {/* Heart Tier */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-amber-950/20 to-neutral-900/60 border border-amber-500/30 text-center relative overflow-hidden shadow-xl">
              <div className="inline-block px-3 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                Artisan Core
              </div>
              <h3 className="text-2xl font-serif text-white">{pyramid.heartTitle}</h3>
              <p className="mt-3 text-xs text-neutral-300 leading-relaxed font-light">
                {pyramid.heartDesc}
              </p>
              <div className="mt-6 pt-6 border-t border-neutral-800/80 flex flex-wrap justify-center gap-2">
                {(pyramid.heartNotes || []).map((n) => (
                  <span key={n} className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-900 text-xs text-amber-200">
                    {n}
                  </span>
                ))}
              </div>
            </div>

            {/* Base Tier */}
            <div className="p-8 rounded-3xl bg-neutral-900/50 border border-neutral-800 text-center relative overflow-hidden">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block mb-2">
                Phase 03 &bull; 4 to 18+ Hours
              </span>
              <h3 className="text-2xl font-serif text-white">{pyramid.baseTitle}</h3>
              <p className="mt-3 text-xs text-neutral-400 leading-relaxed font-light">
                {pyramid.baseDesc}
              </p>
              <div className="mt-6 pt-6 border-t border-neutral-800/80 flex flex-wrap justify-center gap-2">
                {(pyramid.baseNotes || []).map((n) => (
                  <span key={n} className="px-3 py-1 rounded-full bg-neutral-800 text-xs text-neutral-300">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SRI LANKAN CRAFTSMANSHIP & ATELIER STORY */}
      <section id="craftsmanship" className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-neutral-900 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={craft.imageUrl || "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=1200&auto=format&fit=crop&q=85"}
              alt="Artisanal Ceylon Distillation"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="font-mono text-[11px] text-amber-300 uppercase tracking-widest">
                Colombo Perfumery Atelier
              </p>
              <h4 className="text-xl font-serif text-white mt-1">
                {craft.storyHeadline || 'Centuries of Spice Heritage Married with French Haute Parfumerie'}
              </h4>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-[1px] w-6 bg-amber-400" />
              <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-amber-300 font-semibold">
                {craft.badge || 'Our Story & Philosophy'}
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-light text-white tracking-tight leading-tight">
              {craft.title}
            </h2>
            <p className="mt-5 text-neutral-300 text-sm leading-relaxed font-light">
              {craft.p1}
            </p>
            <p className="mt-4 text-neutral-400 text-xs leading-relaxed font-light">
              {craft.p2}
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-neutral-900 text-center font-mono">
              <div className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <span className="text-2xl font-bold text-amber-300 block">{craft.stat1Number}</span>
                <span className="text-[10px] text-neutral-400 uppercase mt-0.5 block">{craft.stat1Label}</span>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <span className="text-2xl font-bold text-amber-300 block">{craft.stat2Number}</span>
                <span className="text-[10px] text-neutral-400 uppercase mt-0.5 block">{craft.stat2Label}</span>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <span className="text-2xl font-bold text-amber-300 block">{craft.stat3Number}</span>
                <span className="text-[10px] text-neutral-400 uppercase mt-0.5 block">{craft.stat3Label}</span>
              </div>
            </div>

            <div className="mt-8">
              <a
                href={craft.ctaLink || `https://wa.me/${brand.whatsappNumber?.replace(/\+/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-semibold uppercase tracking-wider transition shadow-lg"
              >
                <span>{craft.ctaText || 'Visit Colombo Atelier'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 7. VERIFIED REVIEWS & TESTIMONIALS (With Customer Name & Picture from Email) */}
      <section id="testimonials" className="border-t border-neutral-900 bg-[#080808] py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-amber-400 font-semibold block mb-2">
                {config?.testimonials?.badge || 'Connoisseur Impressions'}
              </span>
              <h2 className="text-3xl md:text-5xl font-serif font-light text-white">
                {config?.testimonials?.title || 'Words From Fragrance Enthusiasts'}
              </h2>
              <p className="mt-2 text-xs text-neutral-400 max-w-lg">
                {config?.testimonials?.description || 'Verified experiences from clients across Sri Lanka and international collectors.'}
              </p>
            </div>

            <button
              onClick={() => setReviewModalOpen(true)}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase tracking-wider rounded-full transition shadow-lg shadow-amber-400/10 flex items-center gap-2 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{config?.testimonials?.writeReviewBtnText || 'Write a Fragrance Review'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800 flex flex-col justify-between hover:border-neutral-700 transition"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs md:text-sm text-neutral-300 leading-relaxed font-light italic">
                    &ldquo;{t.review}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center gap-3">
                  {/* Customer Image derived from their email or Google profile */}
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-amber-400/40 bg-neutral-800 shrink-0 shadow">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.avatar_url || getAvatarFromEmail(t.email, t.name)}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs truncate">{t.name}</p>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
                      <span>{t.location || 'Sri Lanka'}</span>
                      <span>&bull;</span>
                      <span className="text-emerald-400">Verified Client</span>
                    </div>
                    <p className="text-amber-400/90 text-[10px] font-mono truncate mt-0.5">{t.scent}</p>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-600 shrink-0">{t.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. WRITE REVIEW MODAL */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="w-full max-w-lg bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl relative text-neutral-200">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white text-lg"
            >
              &times;
            </button>

            <h3 className="text-xl font-serif text-white mb-1">
              Submit Your Client Impression
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              Your feedback is celebrated by our master distillers and published with your verified client avatar.
            </p>

            {reviewSuccess ? (
              <div className="p-8 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-serif text-white">Review Published Successfully</h4>
                <p className="text-xs text-neutral-400 mt-2">
                  Thank you, {reviewName}. Your impression is now featured with your verified client profile avatar.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                {/* Star rating selector */}
                <div>
                  <label className="block text-neutral-400 mb-1.5 font-medium">Your Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className={`p-2 rounded-xl border transition ${
                          reviewRating >= star
                            ? 'text-amber-400 border-amber-400/40 bg-amber-400/10'
                            : 'text-neutral-600 border-neutral-800 bg-neutral-900'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                    <span className="text-xs font-mono text-amber-300 ml-2">
                      {reviewRating} of 5 Stars
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="e.g. Kavindi Senaratne"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Your Email *</label>
                    <input
                      type="email"
                      required
                      value={reviewEmail}
                      onChange={(e) => setReviewEmail(e.target.value)}
                      placeholder="e.g. kavindi@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Avatar Preview from Email */}
                {reviewEmail && (
                  <div className="p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-amber-400/40 bg-neutral-800 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getAvatarFromEmail(reviewEmail, reviewName)}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-white font-medium">Client Picture from Email</p>
                      <p className="text-[11px] text-neutral-400 font-mono">
                        This avatar will display alongside your verified review.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Fragrance Reviewed</label>
                  <select
                    value={reviewScent}
                    onChange={(e) => setReviewScent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.name} className="bg-neutral-900 text-white">
                        {p.name} &bull; {p.category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Your Review Thoughts *</label>
                  <textarea
                    required
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Describe the projection, lasting time on skin, and how the notes evolve over hours..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg transition"
                >
                  Publish Verified Impression
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 9. VIP CONNOISSEUR CLUB / NEWSLETTER */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="rounded-3xl bg-gradient-to-r from-neutral-900 via-[#141414] to-neutral-900 border border-neutral-800 p-8 md:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 mx-auto mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-2xl md:text-4xl font-serif font-light text-white">
              {vip.headline || 'Join the Aroma Private Circle'}
            </h3>
            <p className="mt-3 text-xs md:text-sm text-neutral-400 font-light">
              {vip.subhead} (Use code <code className="font-mono text-amber-300">{vip.promoCode}</code> for {vip.discountPercent}% OFF).
            </p>

            {newsletterSubscribed ? (
              <div className="mt-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-900 text-emerald-300 text-xs font-mono">
                ✦ Welcome to the Private Circle! Your promo code is <strong className="text-white">{vip.promoCode}</strong> ({vip.discountPercent}% OFF at checkout).
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="mt-8 flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email for private access..."
                  className="flex-1 px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg transition whitespace-nowrap"
                >
                  {vip.ctaText || 'Join Circle'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 10. LUXURY FOOTER */}
      <footer className="border-t border-neutral-900 bg-[#040404] text-neutral-400 text-xs py-16 px-6 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-black font-serif font-black flex items-center justify-center text-sm">
                {brand.name?.charAt(0) || 'A'}
              </div>
              <span className="text-xl font-serif tracking-[0.2em] font-light text-white">
                {brand.name}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed font-light text-neutral-500">
              {brand.tagline}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[10px] font-mono text-neutral-400">
                Haute Parfumerie &bull; Distilled in Sri Lanka
              </span>
            </div>
          </div>

          {/* Catalog Links */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-white mb-3">Fragrance Families</h4>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#fragrance-catalog" className="hover:text-amber-300">Ceylon Royal Oud (Extrait)</a></li>
              <li><a href="#fragrance-catalog" className="hover:text-amber-300">Midnight Cinnamon Noir</a></li>
              <li><a href="#fragrance-catalog" className="hover:text-amber-300">Aqua de Ceylon Marine</a></li>
              <li><a href="#fragrance-catalog" className="hover:text-amber-300">Ceylon Santal Reserve</a></li>
              <li><a href="#fragrance-catalog" className="hover:text-amber-300">Discovery Coffret Flight</a></li>
            </ul>
          </div>

          {/* Quick Concierge */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-white mb-3">Atelier Concierge</h4>
            <ul className="space-y-2 text-[11px]">
              <li>{brand.atelierAddress}</li>
              <li>WhatsApp: {brand.whatsappNumber}</li>
              <li>Email: {brand.conciergeEmail}</li>
              <li>Island-wide 48-Hour Dispatch</li>
              <li>Cash on Delivery & Bank Transfer</li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-white mb-3">Customer Care</h4>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#fragrance-catalog" className="hover:text-amber-300">Browse Catalog</a></li>
              <li><a href="#scent-finder" className="hover:text-amber-300">Scent Matcher Quiz</a></li>
              <li><a href="#testimonials" className="hover:text-amber-300">Client Reviews</a></li>
              <li><a href="#craftsmanship" className="hover:text-amber-300">Ceylon Heritage</a></li>
              <li><a href={`https://wa.me/${brand.whatsappNumber?.replace(/\+/g, '')}`} target="_blank" rel="noreferrer" className="text-amber-300 hover:underline">WhatsApp Direct Support</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-neutral-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-mono text-neutral-600">
          <p>&copy; {new Date().getFullYear()} {brand.copyrightText}</p>
          <div className="flex gap-6">
            <a href="#fragrance-catalog" className="hover:text-neutral-300">Catalog</a>
            <a href="#scent-finder" className="hover:text-neutral-300">Scent Matcher</a>
            <a href="#testimonials" className="hover:text-neutral-300">Reviews</a>
          </div>
        </div>
      </footer>

      {/* QUICK VIEW FRAGRANCE MODAL */}
      <FragranceModal
        fragrance={selectedFragrance}
        onClose={() => setSelectedFragrance(null)}
      />
    </div>
  )
}