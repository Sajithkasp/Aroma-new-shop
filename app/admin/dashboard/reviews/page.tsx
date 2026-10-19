'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  useSiteConfig,
  addCustomerReview,
  deleteCustomerReview,
  toggleVerifyCustomerReview,
  getAvatarFromEmail,
  ReviewItem
} from '@/lib/siteConfigStore'
import { supabase } from '@/lib/supabase'
import { AROMA_FRAGRANCES } from '@/lib/aromaData'
import {
  Star,
  Trash2,
  CheckCircle,
  Plus,
  Search,
  ArrowLeft,
  Sliders,
  ShieldCheck,
  User,
  MessageSquare,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Check
} from 'lucide-react'

export default function ReviewsManagementPage() {
  const { config, refresh } = useSiteConfig()
  const [reviews, setReviews] = useState<ReviewItem[]>(config.testimonials.items)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRating, setFilterRating] = useState<number | 'all'>('all')
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all')

  // Add review modal state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newLocation, setNewLocation] = useState('Colombo, Sri Lanka')
  const [newScent, setNewScent] = useState('Ceylon Royal Oud')
  const [newRating, setNewRating] = useState(5)
  const [newReviewText, setNewReviewText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  useEffect(() => {
    if (config?.testimonials?.items) {
      setReviews(config.testimonials.items)
    }
  }, [config?.testimonials?.items])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleDelete = async (reviewId: string, name: string) => {
    if (!window.confirm(`Delete review from "${name}"? This will remove it from the live store.`)) return

    await deleteCustomerReview(reviewId)
    showToast(`✓ Review from "${name}" deleted`)
    refresh()
  }

  const handleToggleVerify = async (reviewId: string) => {
    await toggleVerifyCustomerReview(reviewId)
    showToast('✓ Review verification status updated')
    refresh()
  }

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newReviewText.trim()) return

    setIsSubmitting(true)
    const success = await addCustomerReview({
      id: `rev-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim() || undefined,
      location: newLocation.trim() || 'Sri Lanka',
      scent: newScent,
      rating: newRating,
      review: newReviewText.trim(),
      date: 'Just now',
      verified: true
    })

    setIsSubmitting(false)
    if (success) {
      showToast('✓ Verified review published to live storefront!')
      setAddModalOpen(false)
      setNewName('')
      setNewEmail('')
      setNewReviewText('')
      refresh()
    }
  }

  // Filtered list
  const filtered = reviews.filter((r) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      (r.email && r.email.toLowerCase().includes(q)) ||
      (r.scent && r.scent.toLowerCase().includes(q)) ||
      r.review.toLowerCase().includes(q)

    const matchesRating = filterRating === 'all' || r.rating === filterRating
    const matchesVerified =
      filterVerified === 'all' ||
      (filterVerified === 'verified' && r.verified) ||
      (filterVerified === 'unverified' && !r.verified)

    return matchesSearch && matchesRating && matchesVerified
  })

  // Quick stats
  const totalReviews = reviews.length
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviews).toFixed(1)
      : '5.0'
  const verifiedCount = reviews.filter((r) => r.verified).length

  return (
    <div className="min-h-screen bg-[#070707] text-neutral-100 font-sans pb-24">
      {/* HEADER */}
      <header className="border-b border-neutral-800 bg-[#0c0c0c]/90 sticky top-0 z-30 px-6 py-4 backdrop-blur">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
              title="Return to Main Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span>Customer Reviews & Testimonials Hub</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[10px] font-mono font-bold">
                  MODERATION & VERIFICATION
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Verify authentic buyer reviews, delete spam or unwanted feedback, and feature top client impressions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {toastMsg && (
              <span className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-mono animate-fade-in flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                {toastMsg}
              </span>
            )}
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-amber-400/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Review</span>
            </button>
            <Link
              href="/#testimonials"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-mono transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View on Store</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* STATS STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Total Live Reviews</p>
              <p className="text-2xl font-mono font-bold text-white mt-1">{totalReviews}</p>
              <p className="text-[10px] text-neutral-500 mt-0.5">Published on customer homepage</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Average Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-mono font-bold text-amber-400">{avgRating}</span>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-neutral-500 mt-0.5">Haute perfumery satisfaction</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Verified Buyer Badge</p>
              <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">{verifiedCount}</p>
              <p className="text-[10px] text-neutral-500 mt-0.5">Authenticity verified flacons</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Verified Filter */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1">
              <button
                onClick={() => setFilterVerified('all')}
                className={`px-3 py-1 rounded-lg transition ${
                  filterVerified === 'all' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterVerified('verified')}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
                  filterVerified === 'verified' ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800' : 'text-neutral-400'
                }`}
              >
                <CheckCircle className="w-3 h-3" />
                <span>Verified</span>
              </button>
              <button
                onClick={() => setFilterVerified('unverified')}
                className={`px-3 py-1 rounded-lg transition ${
                  filterVerified === 'unverified' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400'
                }`}
              >
                Unverified
              </button>
            </div>

            {/* Rating Filter */}
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Star Ratings</option>
              <option value="5">5 Stars only</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client name, scent, review..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* REVIEWS GRID */}
        {filtered.length === 0 ? (
          <div className="p-16 rounded-3xl bg-neutral-900/30 border border-neutral-800 text-center space-y-3">
            <Star className="w-8 h-8 text-neutral-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No Reviews Match</h3>
            <p className="text-xs text-neutral-400">
              Try adjusting your search query or filter settings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-5 rounded-3xl bg-neutral-900/50 hover:bg-neutral-900/80 border border-neutral-800 transition shadow-lg flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: Rating & Verification Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>

                    <button
                      onClick={() => handleToggleVerify(item.id || String(idx))}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition flex items-center gap-1 border ${
                        item.verified
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800 hover:bg-emerald-900'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                      }`}
                      title="Click to toggle Verified Buyer status"
                    >
                      <CheckCircle className="w-2.5 h-2.5" />
                      <span>{item.verified ? 'Verified Buyer' : 'Unverified'}</span>
                    </button>
                  </div>

                  {/* Scent Tag */}
                  {item.scent && (
                    <span className="inline-block text-[10px] font-mono text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                      Fragrance: {item.scent}
                    </span>
                  )}

                  {/* Review Text */}
                  <p className="text-xs text-neutral-300 leading-relaxed font-light italic">
                    &ldquo;{item.review}&rdquo;
                  </p>
                </div>

                {/* Footer: User Details & Delete Button */}
                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-800 border border-amber-400/40 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.avatar_url || getAvatarFromEmail(item.email, item.name)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                      <p className="text-[10px] font-mono text-neutral-500 truncate">
                        {item.location || 'Sri Lanka'} &bull; {item.date || 'Verified'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id || String(idx), item.name)}
                    className="p-2 rounded-xl text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition shrink-0"
                    title="Delete this review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ADD REVIEW MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="w-full max-w-md bg-[#0c0c0c] border border-neutral-800 rounded-3xl p-6 shadow-2xl relative text-neutral-200">
            <button
              onClick={() => setAddModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white"
            >
              &times;
            </button>

            <h3 className="text-lg font-serif text-white mb-1">Add Verified Review</h3>
            <p className="text-xs text-neutral-400 mb-5">
              Publish authentic testimonials to your storefront and product detail pages.
            </p>

            <form onSubmit={handleAddReview} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1.5 font-medium">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setNewRating(s)}
                      className={`p-1.5 rounded-lg border transition ${
                        newRating >= s
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
                <label className="block text-neutral-400 mb-1 font-medium">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ruwani Jayawardena"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Customer Email (Optional)</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. ruwani@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Fragrance Scent</label>
                <select
                  value={newScent}
                  onChange={(e) => setNewScent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                >
                  {AROMA_FRAGRANCES.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name} ({f.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Colombo 07, Sri Lanka"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Review Comment *</label>
                <textarea
                  required
                  rows={3}
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="The sillage and Ceylon Oud notes last over 16 hours..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-bold uppercase tracking-wider text-xs rounded-xl shadow transition"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Verified Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
