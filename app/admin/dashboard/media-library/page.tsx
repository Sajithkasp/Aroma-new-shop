'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Image as ImageIcon,
  Upload,
  Camera,
  Trash2,
  Copy,
  Check,
  ArrowLeft,
  Search,
  ExternalLink,
  Plus
} from 'lucide-react'

interface MediaAsset {
  id: string
  name: string
  url: string
  date: string
  category: string
}

const DEFAULT_MEDIA: MediaAsset[] = [
  {
    id: 'm-1',
    name: 'Ceylon Royal Oud Flacon',
    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1200&auto=format&fit=crop&q=85',
    date: '2026-10-18',
    category: 'Product'
  },
  {
    id: 'm-2',
    name: 'Taif Rose & Cinnamon Essence',
    url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=1200&auto=format&fit=crop&q=85',
    date: '2026-10-18',
    category: 'Product'
  },
  {
    id: 'm-3',
    name: 'Atelier Artisan Distillation',
    url: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=1200&auto=format&fit=crop&q=85',
    date: '2026-10-18',
    category: 'Brand Story'
  },
  {
    id: 'm-4',
    name: 'Spice Route Bourbon Flacon',
    url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1200&auto=format&fit=crop&q=85',
    date: '2026-10-18',
    category: 'Product'
  },
  {
    id: 'm-5',
    name: 'Galle Fort Sea Spray',
    url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=1200&auto=format&fit=crop&q=85',
    date: '2026-10-18',
    category: 'Product'
  }
]

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState<MediaAsset[]>(DEFAULT_MEDIA)
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('aroma_media_library')
      if (stored) {
        setAssets(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
  }, [])

  const saveAssets = (newAssets: MediaAsset[]) => {
    setAssets(newAssets)
    try {
      localStorage.setItem('aroma_media_library', JSON.stringify(newAssets))
    } catch {
      // ignore
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (dataUrl) {
        const newAsset: MediaAsset = {
          id: `media-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          url: dataUrl,
          date: new Date().toLocaleDateString('en-CA'),
          category: 'Uploaded Photo'
        }
        const updated = [newAsset, ...assets]
        saveAssets(updated)
        setToastMsg('✓ Photo uploaded from device gallery!')
        setTimeout(() => setToastMsg(null), 3000)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCopyUrl = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.url)
    setCopiedId(asset.id)
    setToastMsg(`✓ URL copied for "${asset.name}"`)
    setTimeout(() => {
      setCopiedId(null)
      setToastMsg(null)
    }, 2500)
  }

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Delete photo "${name}"?`)) return
    const updated = assets.filter((a) => a.id !== id)
    saveAssets(updated)
    setToastMsg('✓ Photo deleted')
    setTimeout(() => setToastMsg(null), 2500)
  }

  const filtered = assets.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  )

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
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                  <span>Media & Asset Library</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[10px] font-mono font-bold">
                  DIRECT GALLERY UPLOAD
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Upload photos directly from your phone gallery or computer, copy URLs, and use across products and hero slides.
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
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-amber-400/20"
            >
              <Camera className="w-4 h-4" />
              <span>Upload from Phone Gallery</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* SEARCH & UPLOAD BOX */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images by name or category..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
          <span className="text-xs font-mono text-neutral-400 self-center">
            {assets.length} Assets in Atelier Library
          </span>
        </div>

        {/* GALLERY GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group p-3 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 hover:border-amber-400/40 transition flex flex-col justify-between space-y-2 shadow-lg"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-neutral-950 relative border border-neutral-800/80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur text-[9px] font-mono text-amber-300 border border-amber-400/20">
                  {item.category}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium text-white truncate" title={item.name}>
                  {item.name}
                </p>
                <p className="text-[10px] font-mono text-neutral-500 mt-0.5">{item.date}</p>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-1 text-xs">
                <button
                  onClick={() => handleCopyUrl(item)}
                  className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-mono transition flex items-center justify-center gap-1 ${
                    copiedId === item.id
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                  }`}
                  title="Copy direct image URL"
                >
                  {copiedId === item.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === item.id ? 'Copied' : 'Copy URL'}</span>
                </button>

                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Delete image"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
