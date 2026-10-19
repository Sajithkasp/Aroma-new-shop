'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { AROMA_FRAGRANCES, FRAGRANCE_CATEGORIES, Fragrance } from '@/lib/aromaData'
import { supabase, uploadImageToMediaBucket, getMediaBucketFiles } from '@/lib/supabase'
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
  Camera,
  X,
  Layers,
  Sparkles
} from 'lucide-react'

interface MediaFileItem {
  id: string
  name: string
  url: string
  created_at?: string | null
  size?: number
}

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Fragrance[]>(AROMA_FRAGRANCES)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null)

  // Product Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Fragrance | null>(null)
  const [saving, setSaving] = useState(false)

  // Media bucket gallery state
  const [mediaGalleryOpen, setMediaGalleryOpen] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<MediaFileItem[]>([])
  const [loadingMedia, setLoadingMedia] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [galleryTargetMode, setGalleryTargetMode] = useState<'primary' | 'gallery'>('primary')
  const [galleryImages, setGalleryImages] = useState<string[]>([])

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

  // Helper toast
  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  // Fetch Supabase products dynamically
  const fetchSupabaseProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false })

      if (!error && data && data.length > 0) {
        const mapped: Fragrance[] = data.map((row: any, idx: number) => {
          const fallback = AROMA_FRAGRANCES[idx % AROMA_FRAGRANCES.length]

          let extraData: any = {}
          if (row.seo_description) {
            try {
              extraData = JSON.parse(row.seo_description)
            } catch {}
          }

          return {
            id: String(row.id),
            name: row.name || fallback.name,
            slug: row.slug || fallback.slug,
            subtitle: extraData.subtitle || row.description?.slice(0, 50) || fallback.subtitle,
            category: extraData.category || row.category_id || fallback.category,
            concentration: (extraData.concentration as any) || (row.type_id as any) || fallback.concentration,
            concentration_pct: extraData.concentration_pct || (row.volume_ml === 50 ? 35 : 30),
            price: Number(row.price || fallback.price),
            compare_price: extraData.compare_price ? Number(extraData.compare_price) : fallback.compare_price,
            volume_ml: Number(extraData.volume_ml || row.volume_ml || 50),
            volume_options: [10, 50, 100],
            gender: (extraData.gender as any) || (row.gender as any) || fallback.gender,
            image_url: row.image_url || fallback.image_url,
            gallery: [row.image_url || fallback.image_url],
            description: row.description || fallback.description,
            fragrance_notes: extraData.notes || row.fragrance_notes || fallback.fragrance_notes,
            notes_top: extraData.notes_top || fallback.notes_top,
            notes_heart: extraData.notes_heart || fallback.notes_heart,
            notes_base: extraData.notes_base || fallback.notes_base,
            longevity: extraData.longevity || fallback.longevity,
            sillage: extraData.sillage || fallback.sillage,
            season: fallback.season,
            is_featured: row.featured === 1 || row.is_featured === true || fallback.is_featured,
            is_best_seller: fallback.is_best_seller,
            rating: fallback.rating,
            reviews_count: fallback.reviews_count,
            stock: Number(row.stock || 25)
          }
        })
        setProducts(mapped)
        if (typeof window !== 'undefined') {
          localStorage.setItem('aroma_custom_products', JSON.stringify(mapped))
        }
      } else {
        const local = typeof window !== 'undefined' ? localStorage.getItem('aroma_custom_products') : null
        if (local) {
          setProducts(JSON.parse(local))
        }
      }
    } catch (e) {
      console.error('Error fetching products from Supabase:', e)
      const local = typeof window !== 'undefined' ? localStorage.getItem('aroma_custom_products') : null
      if (local) {
        setProducts(JSON.parse(local))
      }
    }
  }

  useEffect(() => {
    fetchSupabaseProducts()
  }, [])

  // Load images from Supabase 'media' bucket
  const openMediaGallery = async (mode: 'primary' | 'gallery' = 'primary') => {
    setGalleryTargetMode(mode)
    setMediaGalleryOpen(true)
    setLoadingMedia(true)
    try {
      const files = await getMediaBucketFiles()
      setMediaFiles(files)
    } catch (e) {
      console.error('Failed to load media bucket:', e)
    } finally {
      setLoadingMedia(false)
    }
  }

  // Handle direct upload to Supabase 'media' bucket for primary image
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      showToast('⏳ Uploading image directly to Supabase media bucket...')

      const uploaded = await uploadImageToMediaBucket(file, 'product')
      setImageUrl(uploaded.publicUrl)
      showToast('✓ Photo saved to Supabase media bucket successfully!')
    } catch (err: any) {
      console.error('Upload to media bucket error:', err)
      // Local preview fallback
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        if (dataUrl) setImageUrl(dataUrl)
      }
      reader.readAsDataURL(file)
      showToast('⚠️ Notice: ' + (err?.message || 'Check storage permissions. Fallback image loaded.'))
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle direct upload to Supabase 'media' bucket for additional gallery images
  const handleGalleryFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setUploadingGallery(true)
      showToast(`⏳ Uploading ${files.length} photo(s) to Supabase 'media' bucket...`)

      const newUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const uploaded = await uploadImageToMediaBucket(file, 'gallery')
        newUrls.push(uploaded.publicUrl)
      }
      setGalleryImages((prev) => [...prev, ...newUrls])
      showToast(`✓ Added ${newUrls.length} image(s) to Supabase 'media' bucket!`)
    } catch (err: any) {
      console.error('Upload to media bucket error:', err)
      showToast('⚠️ Notice: ' + (err?.message || 'Check storage permissions.'))
    } finally {
      setUploadingGallery(false)
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = ''
    }
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
    setGalleryImages([])
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
    setGalleryImages(p.gallery && p.gallery.length > 1 ? p.gallery.slice(1) : [])
    setDescription(p.description)
    setFragranceNotes(p.fragrance_notes)
    setNotesTop(p.notes_top?.join(', ') || 'Calabrian Bergamot, Pink Peppercorn')
    setNotesHeart(p.notes_heart?.join(', ') || 'Ceylon Cinnamon Bark, Taif Rose')
    setNotesBase(p.notes_base?.join(', ') || 'Aged Agarwood Oud, Golden Ambergris')
    setStock(p.stock || 25)
    setIsFeatured(p.is_featured)
    setIsBestSeller(p.is_best_seller)
    setModalOpen(true)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    const fullGallery = Array.from(
      new Set(
        [
          imageUrl || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=85',
          ...galleryImages
        ].filter(Boolean)
      )
    )

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
      gallery: fullGallery,
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

    // Save to Supabase
    try {
      const payload: any = {
        name: productObj.name,
        slug: productObj.slug,
        description: productObj.description,
        price: Number(productObj.price),
        stock: Number(productObj.stock),
        image_url: productObj.image_url,
        is_active: 1,
        featured: productObj.is_featured ? 1 : 0,
        seo_description: JSON.stringify({
          notes: productObj.fragrance_notes,
          notes_top: productObj.notes_top,
          notes_heart: productObj.notes_heart,
          notes_base: productObj.notes_base,
          subtitle: productObj.subtitle,
          category: productObj.category,
          concentration: productObj.concentration,
          concentration_pct: productObj.concentration_pct,
          volume_ml: productObj.volume_ml,
          gender: productObj.gender,
          compare_price: productObj.compare_price,
          gallery: fullGallery
        })
      }

      let savedId: number | null = null
      if (editingProduct?.id && !editingProduct.id.startsWith('prod-')) {
        const { data: updateRes } = await supabase
          .from('products')
          .update(payload)
          .eq('id', Number(editingProduct.id))
          .select()
        if (updateRes && updateRes[0]) savedId = updateRes[0].id
        showToast(`✓ "${name}" updated in Supabase live catalog!`)
      } else {
        const { data: insertRes } = await supabase
          .from('products')
          .insert([payload])
          .select()
        if (insertRes && insertRes[0]) {
          savedId = insertRes[0].id
          productObj.id = String(savedId)
        }
        showToast(`✓ "${name}" published directly to Supabase live catalog!`)
      }

      // Also record into product_images table if exists
      if (savedId) {
        try {
          await supabase.from('product_images').delete().eq('product_id', savedId)
          const imgRows = fullGallery.map((url, idx) => ({
            product_id: savedId,
            image_url: url,
            is_primary: idx === 0 ? 1 : 0
          }))
          await supabase.from('product_images').insert(imgRows)
        } catch {}
      }
    } catch (err: any) {
      console.error('Supabase product save error:', err)
      showToast('⚠️ Saved locally. Note: ' + (err?.message || 'Database sync check.'))
    } finally {
      setSaving(false)
    }

    // Update local state and trigger live sync
    let updatedList: Fragrance[]
    if (editingProduct) {
      updatedList = products.map((p) => (p.id === editingProduct.id ? productObj : p))
    } else {
      updatedList = [productObj, ...products]
    }
    setProducts(updatedList)
    if (typeof window !== 'undefined') {
      localStorage.setItem('aroma_custom_products', JSON.stringify(updatedList))
      window.dispatchEvent(new CustomEvent('aroma_products_sync', { detail: updatedList }))
    }
    setModalOpen(false)
  }

  const handleDeleteProduct = async (p: Fragrance) => {
    if (!window.confirm(`Delete fragrance "${p.name}" from catalog?`)) return

    try {
      if (!p.id.startsWith('prod-')) {
        await supabase.from('products').delete().eq('id', Number(p.id))
      }
    } catch (e) {
      console.error('Failed to delete from Supabase:', e)
    }

    const updated = products.filter((item) => item.id !== p.id)
    setProducts(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('aroma_custom_products', JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('aroma_products_sync', { detail: updated }))
    }
    showToast(`✓ "${p.name}" removed from catalog`)
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fragrance_notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory
    return matchesSearch && matchesCat
  })

  return (
    <div className="min-h-screen bg-[#070707] text-neutral-100 font-sans p-4 md:p-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl bg-amber-400 text-black font-semibold text-xs shadow-2xl flex items-center gap-2 animate-fade-in">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition font-mono mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Main Admin Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-serif text-white tracking-wide">Fragrance Catalog Studio</h1>
              <p className="text-xs text-neutral-400">
                Live Supabase Synchronization &bull; Connected to &apos;media&apos; Storage Bucket
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openMediaGallery('primary')}
            className="px-4 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-300 flex items-center gap-1.5 transition"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Media Bucket Library</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition shadow-lg shadow-amber-400/20"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Add New Fragrance</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search & Category Filter Bar */}
        <div className="p-4 rounded-3xl bg-[#0c0c0c] border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by fragrance name, note, or oud..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
            {['All', ...FRAGRANCE_CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition whitespace-nowrap ${
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

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-3xl bg-[#0c0c0c] border border-neutral-800 hover:border-amber-400/40 transition duration-300 flex flex-col justify-between group shadow-xl"
            >
              <div className="space-y-3">
                {/* Photo & Badges */}
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-950 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=85'
                    }}
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
              <div className="pt-3 mt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                <Link
                  href={`/product/${p.slug || p.id}`}
                  target="_blank"
                  className="p-2 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 text-xs transition"
                  title="View Product Details Page"
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
                    className="p-1.5 rounded-xl bg-neutral-800/60 hover:bg-rose-900/40 text-neutral-400 hover:text-rose-300 transition"
                    title="Delete fragrance"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PRODUCT CREATE/EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0d0d0d] border border-neutral-800 rounded-3xl p-6 shadow-2xl relative text-neutral-200 my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif text-white mb-1">
              {editingProduct ? `Edit Fragrance &bull; ${editingProduct.name}` : 'Add New Artisanal Fragrance'}
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              Saved directly to Supabase with instant synchronization to the customer storefront.
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* IMAGE UPLOAD STRIP (WITH SUPABASE MEDIA BUCKET) */}
              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Product Image (Supabase &apos;media&apos; Bucket)</span>
                  </label>
                  {uploadingImage && (
                    <span className="text-[11px] font-mono text-amber-400 animate-pulse">
                      Uploading to bucket...
                    </span>
                  )}
                </div>

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
                        disabled={uploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow disabled:opacity-60"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Upload from Device Gallery</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openMediaGallery('primary')}
                        className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs transition flex items-center gap-1.5 border border-neutral-700"
                      >
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span>Choose from Media Bucket</span>
                      </button>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-500 font-mono block">Active Supabase image URL:</span>
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://yucrijohsscyfnarhkml.supabase.co/storage/v1/object/public/media/..."
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-[11px] focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ADDITIONAL FLACON GALLERY PHOTOS (SUPABASE 'media' BUCKET) */}
              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>Flacon Gallery Photos ({galleryImages.length} additional)</span>
                  </label>
                  {uploadingGallery && (
                    <span className="text-[11px] font-mono text-amber-400 animate-pulse">
                      Uploading to &apos;media&apos; bucket...
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  ref={galleryFileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleGalleryFilesChange}
                  className="hidden"
                />

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={uploadingGallery}
                    onClick={() => galleryFileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-semibold text-xs transition flex items-center gap-1.5 border border-amber-400/30 disabled:opacity-60"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload Extra Photos to Media Bucket</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openMediaGallery('gallery')}
                    className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs transition flex items-center gap-1.5 border border-neutral-700"
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pick from Media Bucket</span>
                  </button>
                </div>

                {galleryImages.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-2">
                    {galleryImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-square rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setGalleryImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition"
                          title="Remove photo from gallery"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-500 font-mono italic">
                    No extra gallery photos yet. Upload additional photos to show multiple angles on the customer product detail page.
                  </p>
                )}
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
                  <label className="block text-neutral-400 mb-1 font-medium">Compare Price (LKR)</label>
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
                <label className="block text-neutral-400 mb-1 font-medium">Product Story &amp; Description</label>
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
                disabled={saving || uploadingImage}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg transition mt-4 disabled:opacity-60"
              >
                {saving
                  ? 'Saving to Supabase Database...'
                  : editingProduct
                  ? 'Save Product Changes'
                  : 'Publish Fragrance to Storefront'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MEDIA BUCKET GALLERY PICKER MODAL */}
      {mediaGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#0c0c0c] border border-neutral-800 rounded-3xl p-6 shadow-2xl relative text-neutral-200">
            <button
              onClick={() => setMediaGalleryOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif text-white">Supabase &apos;media&apos; Storage Bucket</h3>
                <p className="text-xs text-neutral-400">
                  Select any flacon photo stored in your Supabase bucket with 1-click
                </p>
              </div>
            </div>

            {loadingMedia ? (
              <div className="py-16 text-center text-xs font-mono text-neutral-400 flex flex-col items-center gap-3">
                <span className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>Scanning Supabase &apos;media&apos; bucket...</span>
              </div>
            ) : mediaFiles.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6 max-h-[60vh] overflow-y-auto pr-1">
                {mediaFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => {
                      if (galleryTargetMode === 'gallery') {
                        setGalleryImages((prev) => [...prev, file.url])
                        showToast(`✓ Added "${file.name}" to fragrance gallery`)
                      } else {
                        setImageUrl(file.url)
                        showToast(`✓ Selected "${file.name}" as primary photo`)
                      }
                      setMediaGalleryOpen(false)
                    }}
                    className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition p-1 bg-neutral-900/60 ${
                      (galleryTargetMode === 'primary' && imageUrl === file.url) ||
                      (galleryTargetMode === 'gallery' && galleryImages.includes(file.url))
                        ? 'border-amber-400 ring-2 ring-amber-400/40'
                        : 'border-neutral-800 hover:border-amber-400/40'
                    }`}
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-neutral-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    </div>
                    <div className="mt-1.5 px-1 pb-1">
                      <p className="text-[10px] font-mono text-neutral-300 truncate">{file.name}</p>
                    </div>
                    {imageUrl === file.url && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-neutral-400 space-y-3">
                <p>No images found in Supabase &apos;media&apos; bucket yet.</p>
                <button
                  onClick={() => {
                    setMediaGalleryOpen(false)
                    fileInputRef.current?.click()
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-black font-semibold text-xs"
                >
                  Upload First Image to &apos;media&apos; Bucket
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
