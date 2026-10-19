'use client'

import { useState } from 'react'
import { Fragrance } from '@/lib/aromaData'
import { useCart } from '@/lib/cartContext'
import { X, Star, Clock, Wind, Check, Droplets, ExternalLink, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

interface FragranceModalProps {
  fragrance: Fragrance | null
  onClose: () => void
}

export default function FragranceModal({ fragrance, onClose }: FragranceModalProps) {
  const { addToCart } = useCart()
  const [selectedVolume, setSelectedVolume] = useState<number>(fragrance?.volume_ml || 50)
  const [activeImage, setActiveImage] = useState<string>(fragrance?.image_url || '')
  const [added, setAdded] = useState(false)

  if (!fragrance) return null

  // Calculate price based on bottle size
  let calculatedPrice = fragrance.price
  if (selectedVolume === 10) {
    calculatedPrice = Math.round(fragrance.price * 0.32)
  } else if (selectedVolume === 100) {
    calculatedPrice = Math.round(fragrance.price * 1.75)
  }

  const handleAddToCart = () => {
    addToCart({
      id: `${fragrance.id}-${selectedVolume}ml`,
      name: `${fragrance.name} (${selectedVolume}ml)`,
      price: calculatedPrice,
      volume_ml: selectedVolume,
      image_url: activeImage || fragrance.image_url,
      concentration: fragrance.concentration
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-fade-in">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-[#0c0c0c] border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl z-10 text-neutral-100 flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 border border-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT: Product Visuals */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-neutral-950/60 border-b md:border-b-0 md:border-r border-neutral-800">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-900 relative shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage || fragrance.image_url}
              alt={fragrance.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur border border-white/10 text-amber-300 text-[10px] font-mono px-3 py-1 rounded-full uppercase tracking-wider">
              {fragrance.concentration} · {fragrance.concentration_pct}%
            </div>
          </div>

          {/* Thumbnail strip if available */}
          {fragrance.gallery && fragrance.gallery.length > 1 && (
            <div className="flex gap-2 mt-4">
              {fragrance.gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border transition ${
                    activeImage === img ? 'border-amber-400' : 'border-neutral-800 opacity-60'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-neutral-900 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
            <span>Hand-blended in Sri Lanka</span>
            <Link
              href="/admin/dashboard/products"
              className="text-amber-400/80 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Edit in Admin</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* RIGHT: Olfactory Specs & Purchasing */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[85vh]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400 font-semibold">
                {fragrance.category}
              </span>
              <span className="text-neutral-600">•</span>
              <div className="flex items-center text-amber-400 text-xs">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="ml-1 font-mono text-[11px] text-neutral-300">
                  {fragrance.rating} ({fragrance.reviews_count} reviews)
                </span>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-serif text-white tracking-tight">
              {fragrance.name}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">{fragrance.subtitle}</p>

            <p className="mt-4 text-xs md:text-sm text-neutral-300 leading-relaxed font-light">
              {fragrance.description}
            </p>

            {/* OLFACTORY PYRAMID */}
            <div className="mt-6 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs space-y-3">
              <h4 className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-amber-400" />
                Olfactory Notes Pyramid
              </h4>

              {fragrance.notes_top && fragrance.notes_top.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-mono text-neutral-500 block">Top Notes (0 - 30m)</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {fragrance.notes_top.map((n, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-200 text-[11px]">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {fragrance.notes_heart && fragrance.notes_heart.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-mono text-neutral-500 block">Heart Notes (30m - 4h)</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {fragrance.notes_heart.map((n, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-900/40 text-amber-200 text-[11px]">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {fragrance.notes_base && fragrance.notes_base.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-mono text-neutral-500 block">Base Notes (4h - 16h+)</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {fragrance.notes_base.map((n, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-200 text-[11px]">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* METRICS: Longevity & Sillage */}
            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-mono text-neutral-500">Longevity</p>
                  <p className="font-semibold text-neutral-200">{fragrance.longevity}</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 flex items-center gap-3">
                <Wind className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-mono text-neutral-500">Sillage</p>
                  <p className="font-semibold text-neutral-200">{fragrance.sillage}</p>
                </div>
              </div>
            </div>

            {/* BOTTLE SIZE OPTIONS */}
            <div className="mt-6">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                Select Bottle Volume:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 50, 100].map((vol) => (
                  <button
                    key={vol}
                    onClick={() => setSelectedVolume(vol)}
                    className={`py-2 px-3 rounded-xl border text-xs text-center transition ${
                      selectedVolume === vol
                        ? 'border-amber-400 bg-amber-400/10 text-white font-bold'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <p className="font-mono text-xs">{vol}ml Flacon</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      {vol === 10 ? 'Travel Spray' : vol === 50 ? 'Signature' : 'Grand Reserve'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS & PRICING */}
          <div className="mt-8 pt-5 border-t border-neutral-800">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Investment</span>
                <span className="text-2xl font-mono font-bold text-amber-300">
                  LKR {calculatedPrice.toLocaleString()}
                </span>
                {fragrance.compare_price && selectedVolume === 50 && (
                  <span className="ml-2 text-xs font-mono text-neutral-500 line-through">
                    LKR {fragrance.compare_price.toLocaleString()}
                  </span>
                )}
              </div>

              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-900 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                In Stock &bull; Ready to Dispatch
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs rounded-xl shadow-xl transition flex items-center justify-center gap-2"
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>Added to Fragrance Bag!</span>
                </>
              ) : (
                <>
                  <Droplets className="w-4 h-4 text-black" />
                  <span>Add {selectedVolume}ml to Fragrance Bag</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
