'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { AROMA_FRAGRANCES, FRAGRANCE_CATEGORIES, Fragrance } from '@/lib/aromaData'
import { supabase } from '@/lib/supabase'
import {
  Package,
  Plus,
  Search,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Check,
  Trash2,
  Edit,
  ExternalLink,
  Flame,
  Star,
  Sliders,
  DollarSign,
  Sparkles,
  Camera
} from 'lucide-react'

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Fragrance[]>(AROMA_FRAGRANCES)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Product Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Fragrance | null>(null)

  // Form Fields
  const [name, setName] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [category, setCategory] = useState('Oud & Woody')
  const [concentration, setConcentration] = useState<Fragrance['concentration']>('Extrait de Parfum')
  const [concentrationPct, setConcentrationPct] = useState(35)
  const [price, setPrice] = useState(18500)
  const [comparePrice, setComparePrice] = useState<number | undefined>(22000)
  const [volumeMl, setVolumeMl] = useState(50)
  const [gender, setGender] = useState<Fragrance['gender']>('Unisex')
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')
  const [fragranceNotes, setFragranceNotes] = useState('')
  const [notesTop, setNotesTop] = useState('Calabrian Bergamot, Pink Peppercorn')
  const [notesHeart, setNotesHeart] = useState('Ceylon Cinnamon Bark, Taif Rose')
  const [notesBase, setNotesBase] = useState('Aged Agarwood Oud, Golden Ambergris')
  const [longevity, setLongevity] = useState('16+ Hours')
  const [sillage, setSillage] = useState<Fragrance['sillage']>('Intense / Enormous')
  const [stock, setStock] = useState(25)
  const [isFeatured, setIsFeatured] = useState(true)
  const [isBestSeller, setIsBestSeller] = useState(false)

  // Fetch Supabase products or merge with local
  useEffect(() => {
    const fetchSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: false })

        if (!error && data && data.length > 0) {
          const mapped: Fragrance[] = data.map((row: any, idx: number) => {
            const fallback = AROMA_FRAGRANCES[idx % AROMA_FRAGRANCES.length]
            return {
              id: String(row.id),
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
          // Check local stored products
          const local = localStorage.getItem('aroma_custom_products')
          if (local) {
            setProducts(JSON.parse(local))
          }
        }
      } catch {
        const local = localStorage.getItem('aroma_custom_products')
        if (local) {
          setProducts(JSON.parse(local))
        }
      }
    }

    fetchSupabase()
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  // Handle image upload from device gallery / camera / file picker
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (dataUrl) {
        setImageUrl(dataUrl)
        showToast('✓ Photo loaded from device gallery!')
      }
    }
    reader.readAsDataURL(file)
  }

  const openCreateModal = () => {
    setEditingProduct(null)
    setName('')
    setSubtitle('Handcrafted Ceylon Extrait de Parfum')
    setCategory('Oud & Woody')
    setConcentration('Extrait de Parfum')
    setConcentrationPct(35)
    setPrice(18500)
    setComparePrice(22000)
    setVolumeMl(50)
    setGender('Unisex')
    setImageUrl('https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=85')
    setDescription('Handcrafted with authentic wild Ceylon agarwood and organic spice essences.')
    setFragranceNotes('Top: Bergamot | Heart: Ceylon Cinnamon | Base: Wild Oud')
    setStock(25)
    setIsFeatured(true)
    setIsBestSeller(false)
    setModalOpen(true)
  }

  const openEditModal = (p: Fragrance) => {
    setEditingProduct(p)
    setName(p.name)
    setSubtitle(p.subtitle)
    setCategory(p.category)
    setConcentration(p.concentration)
    setConcentrationPct(p.concentration_pct || 35)
    setPrice(p.price)
    setComparePrice(p.compare_price)
    setVolumeMl(p.volume_ml)
    setGender(p.gender)
    setImageUrl(p.image_url)
    setDescription(p.description)
    setFragranceNotes(p.fragrance_notes)
    setNotesTop(p.notes_top?.join(', ') || '')
    setNotesHeart(p.notes_heart?.join(', ') || '')
    setNotesBase(p.notes_base?.join(', ') || '')
    setStock(p.stock || 25)
    setIsFeatured(p.is_featured)
    setIsBestSeller(p.is_best_seller)
    setModalOpen(true)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    const productObj: Fragrance = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: name.trim(),
      slug: editingProduct ? editingProduct.slug : slug,
      subtitle: subtitle.trim(),
      category,
      concentration,
      concentration_pct: concentrationPct,
      price: Number(price),
      compare_price: comparePrice ? Number(comparePrice) : undefined,
      volume_ml: Number(volumeMl),
      volume_options: [10, 50, 100],
      gender,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=85',
      gallery: [imageUrl || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=85'],
      description: description.trim(),
      fragrance_notes: fragranceNotes.trim(),
      notes_top: notesTop.split(',').map((s) => s.trim()).filter(Boolean),
      notes_heart: notesHeart.split(',').map((s) => s.trim()).filter(Boolean),
      notes_base: notesBase.split(',').map((s) => s.trim()).filter(Boolean),
      longevity,
      sillage,
      season: 'All Seasons',
      is_featured: isFeatured,
      is_best_seller: isBestSeller,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviews_count: editingProduct ? editingProduct.reviews_count : 12,
      stock: Number(stock)
    }

    let updatedList: Fragrance[]
    if (editingProduct) {
      updatedList = products.map((p) => (p.id === editingProduct.id ? productObj : p))
      showToast(`✓ "${name}" updated successfully!`)
    } else {
      updatedList = [productObj, ...products]
      showToast(`✓ "${name}" added to catalog!`)
    }

    setProducts(updatedList)
    localStorage.setItem('aroma_custom_products', JSON.stringify(updatedList))
    setModalOpen(false)

    // Sync to Supabase
    try {
      await supabase.from('products').upsert({
        id: productObj.id.startsWith('prod-') ? undefined : Number(productObj.id),
        name: productObj.name,
        slug: productObj.slug,
        description: productObj.description,
        price: productObj.price,
        compare_price: productObj.compare_price,
        volume_ml: productObj.volume_ml,
        gender: productObj.gender,
        image_url: productObj.image_url,
        stock: productObj.stock,
        is_featured: productObj.is_featured,
        fragrance_notes: productObj.fragrance_notes
      })
    } catch {
      // ignore
    }
  }

  const handleDeleteProduct = async (p: Fragrance) => {
    if (!window.confirm(`Delete fragrance "${p.name}" from catalog?`)) return

    const updated = products.filter((item) => item.id !== p.id)
    setProducts(updated)
    localStorage.setItem('aroma_custom_products', JSON.stringify(updated))
    showToast(`✓ "${p.name}" removed from catalog`)

    try {
      await supabase.from('products').delete().eq('id', p.id)
    } catch {
      // ignore
    }
  }

  // Filtered products
  const filtered = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q) ||
      p.fragrance_notes.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)

    return matchesCat && matchesSearch
  })

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
                  <Package className="w-5 h-5 text-amber-400" />
                  <span>Fragrance Products & Catalog Hub</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[10px] font-mono font-bold">
                  DIRECT GALLERY UPLOAD
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Manage flacons, prices, stock levels, olfactory notes, and upload photos directly from your phone gallery.
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
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-amber-400/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Fragrance</span>
            </button>
            <Link
              href="/#fragrance-catalog"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-mono transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* FILTERS & SEARCH */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {['All', ...FRAGRANCE_CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-black font-bold'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by title, notes, oud..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-3xl bg-neutral-900/50 hover:bg-neutral-900/80 border border-neutral-800 transition shadow-lg flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Photo & Badges */}
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-950 relative border border-neutral-800/80">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {p.is_best_seller && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-mono font-bold flex items-center gap-1 shadow">
                        <Flame className="w-3 h-3 fill-current" />
                        BEST SELLER
                      </span>
                    )}
                    {p.is_featured && (
                      <span className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur text-amber-300 text-[9px] font-mono border border-amber-400/30">
                        FEATURED
                      </span>
                    )}
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur text-white text-[10px] font-mono">
                    Stock: {p.stock}
                  </span>
                </div>

                {/* Details */}
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider font-semibold">
                    {p.category} &bull; {p.gender}
                  </span>
                  <h3 className="text-base font-semibold text-white mt-0.5 truncate">{p.name}</h3>
                  <p className="text-[11px] text-neutral-400 line-clamp-1">{p.subtitle}</p>
                </div>

                {/* Notes */}
                <p className="text-[10px] font-mono text-neutral-400 line-clamp-2 bg-neutral-950/60 p-2 rounded-xl border border-neutral-800/80">
                  {p.fragrance_notes}
                </p>

                {/* Price */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-base font-mono font-bold text-amber-300">
                      LKR {p.price.toLocaleString()}
                    </span>
                    {p.compare_price && (
                      <span className="text-xs font-mono text-neutral-500 line-through ml-2">
                        LKR {p.compare_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">{p.volume_ml}ml</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                <Link
                  href={`/product/${p.slug}`}
                  target="_blank"
                  className="p-2 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 text-xs transition"
                  title="Preview on site"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(p)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono transition flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3 text-amber-400" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p)}
                    className="p-1.5 rounded-xl text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0d0d0d] border border-neutral-800 rounded-3xl p-6 shadow-2xl relative text-neutral-200 my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white"
            >
              &times;
            </button>

            <h3 className="text-xl font-serif text-white mb-1">
              {editingProduct ? `Edit Fragrance &bull; ${editingProduct.name}` : 'Add New Artisanal Fragrance'}
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              Fill in product information and choose a photograph directly from your gallery.
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* IMAGE UPLOAD STRIP */}
              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                <label className="block text-xs font-semibold text-white">Flacon Photograph (Gallery / Camera)</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Image Preview */}
                  <div className="w-24 h-28 rounded-2xl overflow-hidden bg-neutral-950 border border-amber-400/40 shrink-0 relative flex items-center justify-center">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-neutral-600" />
                    )}
                  </div>

                  <div className="space-y-2 flex-1 w-full">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Upload from Phone Gallery / Files</span>
                      </button>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-500 font-mono block">Or paste direct photo URL:</span>
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-[11px] focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Fragrance Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ceylon Royal Oud"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Subtitle / Edition</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Distilled Wild Agarwood & Ceylon Cinnamon"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Category, Concentration, Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                  >
                    {FRAGRANCE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Concentration</label>
                  <select
                    value={concentration}
                    onChange={(e) => setConcentration(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Extrait de Parfum">Extrait de Parfum (35%)</option>
                    <option value="Eau de Parfum">Eau de Parfum (25%)</option>
                    <option value="Parfum Cologne">Parfum Cologne (20%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Pour Homme">Pour Homme (Men)</option>
                    <option value="Pour Femme">Pour Femme (Women)</option>
                  </select>
                </div>
              </div>

              {/* Price, Compare Price, Volume, Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Price (LKR) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Compare (LKR)</label>
                  <input
                    type="number"
                    value={comparePrice || ''}
                    onChange={(e) => setComparePrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 22000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Volume (ml)</label>
                  <input
                    type="number"
                    value={volumeMl}
                    onChange={(e) => setVolumeMl(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Stock Count</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Product Story & Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the artisan distilling process, raw agarwood, and emotional sillage..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Olfactory Notes */}
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Notes Summary Line</label>
                <input
                  type="text"
                  value={fragranceNotes}
                  onChange={(e) => setFragranceNotes(e.target.value)}
                  placeholder="Top: Bergamot, Pepper | Heart: Cinnamon, Rose | Base: Oud, Amber"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Badges Toggles */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-400 bg-neutral-900 border-neutral-800 focus:ring-0"
                  />
                  <span className="text-neutral-300">Show in Featured Collection</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-400 bg-neutral-900 border-neutral-800 focus:ring-0"
                  />
                  <span className="text-neutral-300">Mark as Best Seller Flacon</span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg transition mt-4"
              >
                {editingProduct ? 'Save Product Changes' : 'Publish Fragrance to Storefront'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
