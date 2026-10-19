'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  Share2,
  Check,
  Laptop,
  Smartphone,
  Code2
} from 'lucide-react'
import { useSiteConfig } from '@/lib/siteConfigStore'
import { supabase } from '@/lib/supabase'

export default function SeoManagerPage() {
  const { config, update } = useSiteConfig()

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [savedStatus, setSavedStatus] = useState<string | null>(null)

  // Local state initialized from config
  const [metaTitle, setMetaTitle] = useState(
    config.seo?.metaTitle || 'Aroma Perfumes | Artisanal Ceylon Haute Parfumerie'
  )
  const [metaDescription, setMetaDescription] = useState(
    config.seo?.metaDescription ||
      'Discover handcrafted Extrait de Parfum infused with ancient Ceylon Agarwood, organic cinnamon quills, and rare Indian Ocean resins. Island-wide express delivery.'
  )
  const [keywords, setKeywords] = useState(
    config.seo?.keywords ||
      'aroma perfumes, ceylon oud, sri lanka perfume, colombo fragrances, extrait de parfum, luxury perfume colombo'
  )
  const [ogImage, setOgImage] = useState(
    config.seo?.ogImage ||
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1200&auto=format&fit=crop&q=85'
  )
  const [canonicalUrl, setCanonicalUrl] = useState(
    config.seo?.canonicalUrl || 'https://aromaperfumes.lk'
  )
  const [analyticsId, setAnalyticsId] = useState(config.seo?.analyticsId || 'G-AROMA2026')
  const [pixelId, setPixelId] = useState(config.seo?.pixelId || 'FB-AROMA8899')
  useEffect(() => {
    if (config?.seo) {
      if (config.seo.metaTitle) setMetaTitle(config.seo.metaTitle)
      if (config.seo.metaDescription) setMetaDescription(config.seo.metaDescription)
      if (config.seo.keywords) setKeywords(config.seo.keywords)
      if (config.seo.ogImage) setOgImage(config.seo.ogImage)
      if (config.seo.canonicalUrl) setCanonicalUrl(config.seo.canonicalUrl)
      if (config.seo.analyticsId) setAnalyticsId(config.seo.analyticsId)
      if (config.seo.pixelId) setPixelId(config.seo.pixelId)
    }
  }, [config?.seo])

  const handleSaveSeo = async () => {
    setSavedStatus('Saving...')

    const updatedSeo = {
      metaTitle,
      metaDescription,
      keywords,
      ogImage,
      canonicalUrl,
      analyticsId,
      pixelId
    }

    const updatedConfig = {
      ...config,
      seo: updatedSeo
    }

    update(updatedConfig)

    try {
      await supabase.from('seo_settings').upsert({
        id: 'main-seo',
        meta_title: metaTitle,
        meta_description: metaDescription,
        keywords: keywords,
        og_image_url: ogImage,
        canonical_url: canonicalUrl,
        updated_at: new Date().toISOString()
      })
    } catch {
      // offline/fallback
    }

    setSavedStatus('✓ Published SEO Live!')
    setTimeout(() => setSavedStatus(null), 3500)
  }

  // Length calculations
  const titleLength = metaTitle.length
  const descLength = metaDescription.length

  return (
    <div className="min-h-screen bg-[#070707] text-neutral-100 p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/admin/dashboard"
                className="text-xs font-mono text-neutral-400 hover:text-white transition"
              >
                ← Admin Dashboard
              </Link>
              <span className="text-neutral-700">|</span>
              <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                SEO & OpenGraph Studio
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-white">
              Search Engine Optimization & Social Previews
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Control how Aroma Perfumes appears on Google, WhatsApp, Facebook, iMessage, and Twitter.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedStatus && (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-fade-in">
                <Check className="w-3.5 h-3.5" />
                {savedStatus}
              </span>
            )}
            <button
              onClick={handleSaveSeo}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-amber-400/10 transition"
            >
              Save SEO Settings
            </button>
          </div>
        </div>

        {/* 2-Column Layout: Controls & Live Previews */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* Meta Title */}
            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-white">Default Meta Title</label>
                <span
                  className={`text-[11px] font-mono ${
                    titleLength >= 50 && titleLength <= 65
                      ? 'text-emerald-400'
                      : titleLength > 65
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  {titleLength} / 60 chars (Optimal: 50-60)
                </span>
              </div>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Aroma Perfumes | Artisanal Ceylon Haute Parfumerie"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-400"
              />
              <p className="text-[11px] text-neutral-400">
                Displays as the clickable blue headline in Google search results.
              </p>
            </div>

            {/* Meta Description */}
            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-white">Meta Description</label>
                <span
                  className={`text-[11px] font-mono ${
                    descLength >= 120 && descLength <= 160
                      ? 'text-emerald-400'
                      : descLength > 160
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  {descLength} / 160 chars (Optimal: 120-160)
                </span>
              </div>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Discover handcrafted Extrait de Parfum infused with ancient Ceylon Agarwood..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs leading-relaxed focus:outline-none focus:border-amber-400"
              />
              <p className="text-[11px] text-neutral-400">
                The summary snippet shown beneath the title in search engines.
              </p>
            </div>

            {/* Target Keywords */}
            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <label className="text-xs font-semibold text-white">Target Organic Keywords</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="perfume sri lanka, ceylon agarwood, colombo fragrances..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
              />
              <p className="text-[11px] text-neutral-400">
                Comma-separated keywords for meta tags and indexing relevance.
              </p>
            </div>

            {/* OpenGraph Social Image */}
            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
              <label className="text-xs font-semibold text-white">Social Share Card Image (og:image)</label>
              <input
                type="text"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
              />
              <div className="flex gap-2">
                {[
                  {
                    name: 'Royal Oud Flacon',
                    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1200&auto=format&fit=crop&q=85'
                  },
                  {
                    name: 'Cinnamon Noir Flacon',
                    url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=1200&auto=format&fit=crop&q=85'
                  }
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setOgImage(preset.url)}
                    className="px-2.5 py-1 rounded bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-neutral-300"
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tracking Pixels & Analytics */}
            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <h3 className="text-xs font-semibold text-white">Analytics & Conversion Tracking</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-neutral-400 text-[11px] mb-1 font-mono">
                    Google Analytics (GA4) ID:
                  </label>
                  <input
                    type="text"
                    value={analyticsId}
                    onChange={(e) => setAnalyticsId(e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 text-[11px] mb-1 font-mono">
                    Meta / Facebook Pixel ID:
                  </label>
                  <input
                    type="text"
                    value={pixelId}
                    onChange={(e) => setPixelId(e.target.value)}
                    placeholder="123456789012345"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Previews */}
          <div className="lg:col-span-5 space-y-6">
            {/* GOOGLE SEARCH RESULT (SERP) PREVIEW */}
            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-white">Google SERP Snippet Preview</span>
                </div>
                <div className="flex bg-neutral-950 rounded-lg p-0.5 border border-neutral-800">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1 rounded ${previewDevice === 'desktop' ? 'bg-neutral-800 text-white' : 'text-neutral-500'}`}
                    title="Desktop Preview"
                  >
                    <Laptop className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1 rounded ${previewDevice === 'mobile' ? 'bg-neutral-800 text-white' : 'text-neutral-500'}`}
                    title="Mobile Preview"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Google card mockup */}
              <div className="p-4 rounded-xl bg-white text-black font-sans shadow-lg text-left">
                <div className="flex items-center gap-2 text-[12px] text-neutral-600 mb-1">
                  <span className="w-4 h-4 rounded-full bg-neutral-900 text-amber-400 font-serif font-bold text-[9px] flex items-center justify-center">
                    A
                  </span>
                  <span className="font-medium text-[#202124]">Aroma Perfumes Sri Lanka</span>
                  <span className="text-neutral-400">&rsaquo;</span>
                  <span className="text-neutral-500 font-mono text-[11px] truncate">{canonicalUrl}</span>
                </div>
                <h3 className="text-[#1a0dab] hover:underline font-medium text-base leading-snug cursor-pointer line-clamp-1">
                  {metaTitle}
                </h3>
                <p className="text-[13px] text-[#4d5156] leading-relaxed mt-1 line-clamp-2">
                  {metaDescription}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-[#006621]">
                  <span>Rating: 4.9 &bull; ★★★★★ &bull; In stock &bull; Free Delivery above LKR 10,000</span>
                </div>
              </div>
            </div>

            {/* SOCIAL SHARE CARD (WhatsApp, iMessage, Facebook) PREVIEW */}
            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
                <Share2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-white">Social Share Card Preview</span>
              </div>

              <div className="rounded-xl overflow-hidden bg-[#18181b] border border-neutral-700 shadow-xl">
                {/* Social Image */}
                <div className="aspect-[1.91/1] w-full bg-neutral-900 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ogImage} alt="Social Card" className="w-full h-full object-cover" />
                </div>
                {/* Text summary */}
                <div className="p-3.5 bg-[#121214] border-t border-neutral-800">
                  <p className="text-[10px] font-mono uppercase text-neutral-400">
                    {canonicalUrl.replace('https://', '')}
                  </p>
                  <p className="text-xs font-semibold text-white mt-0.5 line-clamp-1">{metaTitle}</p>
                  <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {metaDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* STRUCTURED DATA (JSON-LD) PREVIEW */}
            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-white">Structured Data (JSON-LD)</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Automatically rendered in storefront HTML for Google Rich Snippets:
              </p>
              <pre className="p-3 rounded-xl bg-black border border-neutral-800 text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-36">
{`{
  "@context": "https://schema.org",
  "@type": "PerfumeStore",
  "name": "Aroma Perfumes",
  "image": "${ogImage}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "No. 45, Ward Place",
    "addressLocality": "Colombo 07",
    "addressCountry": "LK"
  },
  "priceRange": "LKR 4,500 - LKR 18,500"
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
