'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AROMA_FRAGRANCES, Fragrance } from '@/lib/aromaData'
import { useCart } from '@/lib/cartContext'
import { useSiteConfig, getAvatarFromEmail, addCustomerReview } from '@/lib/siteConfigStore'
import { supabase } from '@/lib/supabase'
import {
  Star,
  ShieldCheck,
  Truck,
  Flame,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Check,
  Clock,
  Wind
} from 'lucide-react'

export default function ProductDetailClient({ slug }: { slug: string }) {
  const { config } = useSiteConfig()
  const { addToCart, openCart } = useCart()

  const fallbackFragrance =
    AROMA_FRAGRANCES.find((f) => f.slug === slug || f.id === slug) || AROMA_FRAGRANCES[0]

  const [fragrance, setFragrance] = useState<Fragrance>(fallbackFragrance)
  const [selectedVolume, setSelectedVolume] = useState<number>(50)
  const [added, setAdded] = useState(false)
  const [activeImageIdx, setActiveImageIdx] = useState(0)

  // Review modal inside product page
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewName, setReviewName] = useState('')
  const [reviewEmail, setReviewEmail] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  // Fetch product dynamically from Supabase if added in admin
  useEffect(() => {
    const fetchRemoteProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`slug.eq.${slug},id.eq.${slug}`)
          .single()

        if (!error && data) {
          setFragrance({
            id: String(data.id),
            name: data.name,
            slug: data.slug || String(data.id),
            subtitle: data.description?.slice(0, 50) || fallbackFragrance.subtitle,
            category: data.category_id || fallbackFragrance.category,
            concentration: (data.type_id as any) || fallbackFragrance.concentration,
            concentration_pct: data.volume_ml === 50 ? 35 : 30,
            price: Number(data.price),
            compare_price: data.compare_price ? Number(data.compare_price) : undefined,
            volume_ml: Number(data.volume_ml || 50),
            volume_options: [10, 50, 100],
            gender: (data.gender as any) || 'Unisex',
            image_url: data.image_url || fallbackFragrance.image_url,
            gallery: [data.image_url || fallbackFragrance.image_url],
            description: data.description || fallbackFragrance.description,
            fragrance_notes: data.fragrance_notes || fallbackFragrance.fragrance_notes,
            notes_top: fallbackFragrance.notes_top,
            notes_heart: fallbackFragrance.notes_heart,
            notes_base: fallbackFragrance.notes_base,
            longevity: fallbackFragrance.longevity,
            sillage: fallbackFragrance.sillage,
            season: fallbackFragrance.season,
            is_featured: data.is_featured ?? true,
            is_best_seller: fallbackFragrance.is_best_seller,
            rating: 5.0,
            reviews_count: 15,
            stock: Number(data.stock || 25)
          })
        }
      } catch {
        // use fallback
      }
    }

    fetchRemoteProduct()
  }, [slug, fallbackFragrance])

  useEffect(() => {
    // Pre-fill user data if available
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

  // Volume price calculation
  const currentPrice =
    selectedVolume === 10
      ? Math.round(fragrance.price * 0.28)
      : selectedVolume === 100
      ? Math.round(fragrance.price * 1.75)
      : fragrance.price

  const images = [fragrance.image_url, ...(fragrance.gallery || [])]

  const handleAddToCart = () => {
    addToCart({
      id: fragrance.id,
      name: fragrance.name,
      price: currentPrice,
      volume_ml: selectedVolume,
      image_url: fragrance.image_url,
      concentration: fragrance.concentration
    })
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      openCart()
    }, 400)
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewName || !reviewText) return

    await addCustomerReview({
      name: reviewName,
      email: reviewEmail,
      location: 'Sri Lanka',
      scent: fragrance.name,
      rating: reviewRating,
      review: reviewText,
      date: 'Just now',
      verified: true
    })

    setReviewSubmitted(true)
    setTimeout(() => {
      setShowReviewModal(false)
      setReviewSubmitted(false)
      setReviewText('')
    }, 1500)
  }

  // Filter reviews matching this fragrance or general reviews
  const productReviews = config.testimonials.items.filter(
    (r) =>
      r.scent?.toLowerCase().includes(fragrance.name.toLowerCase()) ||
      fragrance.name.toLowerCase().includes(r.scent?.toLowerCase() || '')
  )
  const displayReviews = productReviews.length > 0 ? productReviews : config.testimonials.items

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 py-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-8 text-xs font-mono text-neutral-400">
          <Link
            href="/#fragrance-catalog"
            className="flex items-center gap-2 hover:text-amber-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Fragrance Catalog</span>
          </Link>
          <div className="flex items-center gap-2 text-[11px]">
            <span>Catalog</span>
            <span>/</span>
            <span>{fragrance.category}</span>
            <span>/</span>
            <span className="text-amber-400">{fragrance.name}</span>
          </div>
        </div>

        {/* Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column: Visual Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 relative shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[activeImageIdx] || fragrance.image_url}
                alt={fragrance.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {fragrance.is_best_seller && (
                  <span className="bg-amber-400 text-black text-xs font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    Best Seller Flacon
                  </span>
                )}
                <span className="bg-black/80 backdrop-blur border border-white/10 text-white text-xs font-mono px-3 py-1 rounded-full">
                  {fragrance.concentration_pct}% Extrait de Parfum
                </span>
              </div>
            </div>

            {/* Thumbnail switcher */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-20 h-24 rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                      activeImageIdx === idx ? 'border-amber-400' : 'border-neutral-800 opacity-60'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Olfactory & Purchasing Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-amber-400 font-semibold">
                  {fragrance.category} &bull; {fragrance.gender}
                </span>
                <span className="text-neutral-700">|</span>
                <div className="flex items-center text-amber-400 text-xs">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="ml-1 text-white font-mono">{fragrance.rating}</span>
                  <span className="ml-1 text-neutral-500">({fragrance.reviews_count} reviews)</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-serif font-light text-white tracking-tight">
                {fragrance.name}
              </h1>
              <p className="text-sm font-mono text-amber-300 mt-1 uppercase tracking-widest">
                {fragrance.subtitle}
              </p>
            </div>

            <p className="text-neutral-300 text-sm leading-relaxed font-light">
              {fragrance.description}
            </p>

            {/* Price Display */}
            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-baseline justify-between">
              <div>
                <p className="text-[11px] font-mono text-neutral-400 uppercase">
                  Hand-Poured Flacon ({selectedVolume}ml)
                </p>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-2xl font-mono font-bold text-amber-300">
                    LKR {currentPrice.toLocaleString()}
                  </span>
                  {fragrance.compare_price && (
                    <span className="text-xs font-mono text-neutral-500 line-through">
                      LKR {Math.round(fragrance.compare_price * (selectedVolume / 50)).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-900 px-3 py-1 rounded-full">
                In Stock &bull; Ready to Dispatch
              </span>
            </div>

            {/* Flacon Volume Selector */}
            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2.5">
                Select Flacon Volume:
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { ml: 10, label: 'Travel Atomizer', sub: 'Compact Macerated Spray' },
                  { ml: 50, label: 'Signature Flacon', sub: 'Standard Artisan Bottle' },
                  { ml: 100, label: 'Connoisseur Reserve', sub: 'Collector Double Volume' }
                ].map((vol) => (
                  <button
                    key={vol.ml}
                    onClick={() => setSelectedVolume(vol.ml)}
                    className={`p-3 rounded-2xl border text-left transition ${
                      selectedVolume === vol.ml
                        ? 'border-amber-400 bg-amber-400/10 text-white'
                        : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <p className="font-mono text-xs font-bold">{vol.ml}ml</p>
                    <p className="text-[11px] text-white mt-0.5">{vol.label}</p>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{vol.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-4 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xl ${
                  added ? 'bg-emerald-500 text-black' : 'bg-amber-400 hover:bg-amber-300 text-black'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag &bull; LKR {currentPrice.toLocaleString()}</span>
                  </>
                )}
              </button>
            </div>

            {/* Scent Pyramid Notes */}
            <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Olfactory Architecture</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800">
                  <p className="text-[10px] font-mono text-amber-400 uppercase">Top Notes</p>
                  <p className="font-medium text-white mt-1">{fragrance.notes_top.join(', ')}</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">First 30 minutes</p>
                </div>
                <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800">
                  <p className="text-[10px] font-mono text-amber-400 uppercase">Heart Notes</p>
                  <p className="font-medium text-white mt-1">{fragrance.notes_heart.join(', ')}</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">True soul & Ceylon character</p>
                </div>
                <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800">
                  <p className="text-[10px] font-mono text-amber-400 uppercase">Base Notes</p>
                  <p className="font-medium text-white mt-1">{fragrance.notes_base.join(', ')}</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">14+ hour lasting trail</p>
                </div>
              </div>

              {/* Longevity & Sillage Meters */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-800/80 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-neutral-500 text-[10px] block">Longevity on Skin:</span>
                    <span className="text-white font-semibold">{fragrance.longevity}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-neutral-500 text-[10px] block">Sillage & Trail:</span>
                    <span className="text-white font-semibold">{fragrance.sillage}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Points */}
            <div className="grid grid-cols-2 gap-3 text-xs text-neutral-400 pt-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>100% Authentic Hand-Distilled Oil</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Express 48h Island Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews for this Fragrance */}
        <div className="mt-20 pt-12 border-t border-neutral-900">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-amber-400 block mb-1">
                Verified Customer Reviews
              </span>
              <h2 className="text-2xl md:text-3xl font-serif text-white">
                Client Impressions on {fragrance.name}
              </h2>
            </div>

            <button
              onClick={() => setShowReviewModal(true)}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-300 text-xs font-mono rounded-full transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>Write a Review</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayReviews.map((r, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(r.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed font-light italic">
                    &ldquo;{r.review}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-400/40 bg-neutral-800 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.avatar_url || getAvatarFromEmail(r.email, r.name)}
                      alt={r.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{r.name}</p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
                      <span>{r.location || 'Sri Lanka'}</span>
                      <span>&bull;</span>
                      <span className="text-emerald-400">Verified Buyer</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-600">{r.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WRITE REVIEW MODAL */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 shadow-2xl relative text-neutral-200">
              <button
                onClick={() => setShowReviewModal(false)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-white"
              >
                &times;
              </button>

              <h3 className="text-lg font-serif text-white mb-1">
                Review &bull; {fragrance.name}
              </h3>
              <p className="text-xs text-neutral-400 mb-5">
                Share your olfactory experience with fellow fragrance lovers.
              </p>

              {reviewSubmitted ? (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-serif text-white">Thank You For Your Review</p>
                  <p className="text-xs text-neutral-400 mt-1">Your feedback has been verified and published.</p>
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
                          className={`p-1.5 rounded-lg border transition ${
                            reviewRating >= star
                              ? 'text-amber-400 border-amber-400/40 bg-amber-400/10'
                              : 'text-neutral-600 border-neutral-800 bg-neutral-900'
                          }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

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

                  {/* Avatar preview from email */}
                  {reviewEmail && (
                    <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-400/40 bg-neutral-800 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getAvatarFromEmail(reviewEmail, reviewName)}
                          alt="Reviewer Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-[11px] text-white font-medium">Client Picture</p>
                        <p className="text-[10px] text-neutral-400 font-mono">
                          Linked to {reviewEmail}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Your Review Thoughts *</label>
                    <textarea
                      required
                      rows={3}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Describe the projection, lasting time on skin, and how the notes evolve..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg transition"
                  >
                    Publish Verified Review
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
