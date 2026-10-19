'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  SiteConfig,
  getStoredSiteConfig,
  saveAndPublishConfig,
  DEFAULT_SITE_CONFIG,
  HeroSlideConfig
} from '@/lib/siteConfigStore'
import {
  ChevronDown,
  ChevronUp,
  Check,
  RotateCcw,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Sliders,
  Palette,
  Megaphone,
  Shield,
  HelpCircle,
  Triangle,
  Award,
  Crown
} from 'lucide-react'

// Live Preview of the customer page inside the editor
import CustomerHomePage from '@/app/(customer)/page'
import { CartProvider } from '@/lib/cartContext'

export default function ThemeCustomizerPage() {
  const [config, setConfig] = useState<SiteConfig>(getStoredSiteConfig)
  const [activeSection, setActiveSection] = useState<string>('hero')
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [savedStatus, setSavedStatus] = useState<string | null>(null)
  const [selectedSlideIdx, setSelectedSlideIdx] = useState<number>(0)

  // Save changes to localStorage, Supabase, and broadcast to store
  const handleSave = async () => {
    setSavedStatus('Saving...')
    const res = await saveAndPublishConfig(config)
    if (res.success) {
      setSavedStatus('✓ Published Live!')
      setTimeout(() => setSavedStatus(null), 3500)
    } else {
      setSavedStatus('Saved Locally')
      setTimeout(() => setSavedStatus(null), 3500)
    }
  }

  const handleReset = () => {
    if (window.confirm('Reset all site customizations to factory luxury defaults?')) {
      setConfig(DEFAULT_SITE_CONFIG)
      saveAndPublishConfig(DEFAULT_SITE_CONFIG)
      setSavedStatus('✓ Reset to Defaults')
      setTimeout(() => setSavedStatus(null), 3000)
    }
  }

  // Hero Slide Management
  const handleAddSlide = () => {
    const newSlide: HeroSlideConfig = {
      id: `slide-${Date.now()}`,
      title: 'NEW LUXURY\nFLACON EDITION',
      subtitle: 'HANDCRAFTED EXTRAIT DE PARFUM',
      badge_text: 'NEW 2026 RELEASE',
      description: 'A bespoke artisanal distillation featuring Ceylon precious resins and organic spice essences.',
      media_type: 'image',
      image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1600&auto=format&fit=crop&q=85',
      cta_text: 'Explore Scent',
      cta_link: '#fragrance-catalog',
      animation_type: 'zoomSlow',
      duration: 6,
      is_active: true
    }

    const updated = {
      ...config,
      hero: {
        slides: [...config.hero.slides, newSlide]
      }
    }
    setConfig(updated)
    setSelectedSlideIdx(updated.hero.slides.length - 1)
  }

  const handleDeleteSlide = (idx: number) => {
    if (config.hero.slides.length <= 1) {
      alert('You must keep at least 1 slide.')
      return
    }
    const updatedSlides = config.hero.slides.filter((_, i) => i !== idx)
    setConfig({
      ...config,
      hero: { slides: updatedSlides }
    })
    setSelectedSlideIdx(Math.max(0, idx - 1))
  }

  const handleMoveSlide = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= config.hero.slides.length) return
    const slides = [...config.hero.slides]
    const temp = slides[idx]
    slides[idx] = slides[targetIdx]
    slides[targetIdx] = temp
    setConfig({
      ...config,
      hero: { slides }
    })
    setSelectedSlideIdx(targetIdx)
  }

  const activeSlide = config.hero.slides[selectedSlideIdx] || config.hero.slides[0]

  return (
    <div className="h-screen flex flex-col bg-[#050505] text-neutral-100 overflow-hidden font-sans">
      {/* 1. TOP HEADER / ACTIONS */}
      <header className="h-14 border-b border-neutral-800 bg-[#0a0a0a] px-5 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1.5 transition"
          >
            <span>← Admin Dashboard</span>
          </Link>
          <span className="text-neutral-700">|</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h1 className="text-sm font-bold tracking-wide text-white">
              SHOPIFY-STYLE VISUAL THEME CUSTOMIZER
            </h1>
            <span className="text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-amber-300 px-2 py-0.5 rounded-full">
              NO-CODE LIVE STUDIO
            </span>
          </div>
        </div>

        {/* Center: Device Viewport Switcher */}
        <div className="hidden md:flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1 text-xs">
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition ${
              deviceMode === 'desktop' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition ${
              deviceMode === 'tablet' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition ${
              deviceMode === 'mobile' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {savedStatus && (
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-900 px-2.5 py-1 rounded-md animate-fade-in flex items-center gap-1">
              <Check className="w-3 h-3" />
              {savedStatus}
            </span>
          )}

          <button
            onClick={handleReset}
            className="p-2 text-neutral-400 hover:text-rose-300 hover:bg-neutral-900 rounded-lg transition text-xs"
            title="Reset to Factory Defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <Link
            href="/"
            target="_blank"
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs rounded-lg flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview Store</span>
          </Link>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-amber-400/10 transition"
          >
            Save & Publish
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE: SIDEBAR + LIVE PREVIEW */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: NO-CODE SECTIONS INSPECTOR (Shopify Style) */}
        <aside className="w-[430px] border-r border-neutral-800 bg-[#090909] flex flex-col shrink-0 overflow-y-auto z-20">
          <div className="p-4 border-b border-neutral-800/80 bg-neutral-950/60 sticky top-0 z-10 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Storefront Sections</p>
              <p className="text-xs text-neutral-300 mt-0.5">Click any section to customize in real time</p>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
              Instant Sync
            </span>
          </div>

          <div className="p-4 space-y-2.5">
            {/* 1. ANNOUNCEMENT BAR */}
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
              <button
                onClick={() => setActiveSection(activeSection === 'announcement' ? '' : 'announcement')}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-neutral-900/80 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Megaphone className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-white">Announcement Ticker</span>
                </div>
                {activeSection === 'announcement' ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>

              {activeSection === 'announcement' && (
                <div className="p-4 pt-1 border-t border-neutral-800/80 space-y-3 text-xs animate-fade-in">
                  <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.announcements.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          announcements: { ...config.announcements, enabled: e.target.checked }
                        })
                      }
                      className="accent-amber-400"
                    />
                    <span>Show Announcement Banner at Top</span>
                  </label>

                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1 font-mono">Rotation Speed (seconds):</label>
                    <input
                      type="number"
                      min={2}
                      max={20}
                      value={config.announcements.speedSeconds}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          announcements: { ...config.announcements, speedSeconds: Number(e.target.value) }
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1 font-mono">Ticker Messages:</label>
                    {config.announcements.messages.map((msg, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={msg}
                          onChange={(e) => {
                            const updated = [...config.announcements.messages]
                            updated[idx] = e.target.value
                            setConfig({
                              ...config,
                              announcements: { ...config.announcements, messages: updated }
                            })
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                        />
                        <button
                          onClick={() => {
                            const updated = config.announcements.messages.filter((_, i) => i !== idx)
                            setConfig({
                              ...config,
                              announcements: { ...config.announcements, messages: updated }
                            })
                          }}
                          className="p-1.5 text-neutral-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        setConfig({
                          ...config,
                          announcements: {
                            ...config.announcements,
                            messages: [...config.announcements.messages, '✦ NEW LUXURY HARVEST AVAILABLE ✦']
                          }
                        })
                      }
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 mt-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Announcement Message
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. HERO SLIDER STUDIO (User's flagship component) */}
            <div className="border border-amber-500/30 rounded-xl overflow-hidden bg-neutral-900/60 shadow-lg">
              <button
                onClick={() => setActiveSection(activeSection === 'hero' ? '' : 'hero')}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-neutral-900/80 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">Hero Slider Studio</span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {config.hero.slides.length} Luxury Slides Configured
                    </span>
                  </div>
                </div>
                {activeSection === 'hero' ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>

              {activeSection === 'hero' && (
                <div className="p-4 pt-1 border-t border-neutral-800/80 space-y-4 text-xs animate-fade-in">
                  {/* Slide Tabs */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono text-neutral-400">Select Slide to Edit:</span>
                      <button
                        onClick={handleAddSlide}
                        className="text-[11px] font-semibold text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Slide</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {config.hero.slides.map((s, idx) => (
                        <button
                          key={s.id || idx}
                          onClick={() => setSelectedSlideIdx(idx)}
                          className={`p-2 rounded-xl border text-left transition relative overflow-hidden ${
                            selectedSlideIdx === idx
                              ? 'border-amber-400 bg-amber-400/10 text-white'
                              : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <p className="font-mono text-[10px] font-bold truncate">0{idx + 1}. {s.badge_text || 'Slide'}</p>
                          <p className="text-[10px] truncate mt-0.5 text-neutral-500">{s.title.replace('\n', ' ')}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Slide Edit Form */}
                  {activeSlide && (
                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
                        <span className="font-mono text-[11px] font-bold text-amber-300">
                          Editing Slide 0{selectedSlideIdx + 1}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveSlide(selectedSlideIdx, 'up')}
                            disabled={selectedSlideIdx === 0}
                            className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                            title="Move slide up"
                          >
                            <MoveUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleMoveSlide(selectedSlideIdx, 'down')}
                            disabled={selectedSlideIdx === config.hero.slides.length - 1}
                            className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                            title="Move slide down"
                          >
                            <MoveDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteSlide(selectedSlideIdx)}
                            className="p-1 text-neutral-500 hover:text-red-400 ml-1"
                            title="Delete slide"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Badge Text */}
                      <div>
                        <label className="block text-[11px] font-mono text-neutral-400 mb-1">Badge Text (Top Pill):</label>
                        <input
                          type="text"
                          value={activeSlide.badge_text}
                          onChange={(e) => {
                            const updated = [...config.hero.slides]
                            updated[selectedSlideIdx].badge_text = e.target.value
                            setConfig({ ...config, hero: { slides: updated } })
                          }}
                          placeholder="e.g. HANDCRAFTED IN SRI LANKA"
                          className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs font-mono"
                        />
                      </div>

                      {/* Main Title */}
                      <div>
                        <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                          Headline (Use Enter for multi-line split):
                        </label>
                        <textarea
                          rows={2}
                          value={activeSlide.title}
                          onChange={(e) => {
                            const updated = [...config.hero.slides]
                            updated[selectedSlideIdx].title = e.target.value
                            setConfig({ ...config, hero: { slides: updated } })
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs font-serif"
                        />
                      </div>

                      {/* Subtitle */}
                      <div>
                        <label className="block text-[11px] font-mono text-neutral-400 mb-1">Subtitle:</label>
                        <input
                          type="text"
                          value={activeSlide.subtitle}
                          onChange={(e) => {
                            const updated = [...config.hero.slides]
                            updated[selectedSlideIdx].subtitle = e.target.value
                            setConfig({ ...config, hero: { slides: updated } })
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-[11px] font-mono text-neutral-400 mb-1">Story / Description:</label>
                        <textarea
                          rows={2}
                          value={activeSlide.description}
                          onChange={(e) => {
                            const updated = [...config.hero.slides]
                            updated[selectedSlideIdx].description = e.target.value
                            setConfig({ ...config, hero: { slides: updated } })
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs font-light"
                        />
                      </div>

                      {/* Media URL */}
                      <div>
                        <label className="block text-[11px] font-mono text-neutral-400 mb-1">Slide Image URL:</label>
                        <input
                          type="text"
                          value={activeSlide.image_url}
                          onChange={(e) => {
                            const updated = [...config.hero.slides]
                            updated[selectedSlideIdx].image_url = e.target.value
                            setConfig({ ...config, hero: { slides: updated } })
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs font-mono"
                        />
                        {/* Preset quick image buttons */}
                        <div className="flex gap-1.5 mt-1.5">
                          {[
                            { name: 'Oud Dark', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1600&auto=format&fit=crop&q=85' },
                            { name: 'Spices Noir', url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=1600&auto=format&fit=crop&q=85' },
                            { name: 'Ocean Mist', url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1600&auto=format&fit=crop&q=85' }
                          ].map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => {
                                const updated = [...config.hero.slides]
                                updated[selectedSlideIdx].image_url = preset.url
                                setConfig({ ...config, hero: { slides: updated } })
                              }}
                              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-neutral-400"
                            >
                              + {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* CTA Button Text & Link */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-mono text-neutral-400 mb-1">Button Text:</label>
                          <input
                            type="text"
                            value={activeSlide.cta_text}
                            onChange={(e) => {
                              const updated = [...config.hero.slides]
                              updated[selectedSlideIdx].cta_text = e.target.value
                              setConfig({ ...config, hero: { slides: updated } })
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-neutral-400 mb-1">Button Link:</label>
                          <input
                            type="text"
                            value={activeSlide.cta_link}
                            onChange={(e) => {
                              const updated = [...config.hero.slides]
                              updated[selectedSlideIdx].cta_link = e.target.value
                              setConfig({ ...config, hero: { slides: updated } })
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs font-mono"
                          />
                        </div>
                      </div>

                      {/* Timing & Animation */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-900">
                        <div>
                          <label className="block text-[11px] font-mono text-neutral-400 mb-1">Duration (s):</label>
                          <input
                            type="number"
                            min={3}
                            max={20}
                            value={activeSlide.duration}
                            onChange={(e) => {
                              const updated = [...config.hero.slides]
                              updated[selectedSlideIdx].duration = Number(e.target.value)
                              setConfig({ ...config, hero: { slides: updated } })
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-neutral-400 mb-1">Animation:</label>
                          <select
                            value={activeSlide.animation_type}
                            onChange={(e) => {
                              const updated = [...config.hero.slides]
                              updated[selectedSlideIdx].animation_type = e.target.value as any
                              setConfig({ ...config, hero: { slides: updated } })
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs"
                          >
                            <option value="zoomSlow">Ken Burns Zoom</option>
                            <option value="fadeUp">Smooth Fade</option>
                            <option value="slideIn">Slide In</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. VALUE BADGES & PILLARS */}
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
              <button
                onClick={() => setActiveSection(activeSection === 'pillars' ? '' : 'pillars')}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-neutral-900/80 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-white">Value & Trust Pillars</span>
                </div>
                {activeSection === 'pillars' ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>

              {activeSection === 'pillars' && (
                <div className="p-4 pt-1 border-t border-neutral-800/80 space-y-3 text-xs animate-fade-in">
                  {config.trustPillars.map((p, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
                      <p className="font-mono text-[10px] text-amber-300">Pillar #{idx + 1}</p>
                      <input
                        type="text"
                        value={p.title}
                        onChange={(e) => {
                          const updated = [...config.trustPillars]
                          updated[idx].title = e.target.value
                          setConfig({ ...config, trustPillars: updated })
                        }}
                        className="w-full px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-white text-xs font-semibold"
                      />
                      <input
                        type="text"
                        value={p.description}
                        onChange={(e) => {
                          const updated = [...config.trustPillars]
                          updated[idx].description = e.target.value
                          setConfig({ ...config, trustPillars: updated })
                        }}
                        className="w-full px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. SCENT QUIZ SETTINGS */}
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
              <button
                onClick={() => setActiveSection(activeSection === 'quiz' ? '' : 'quiz')}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-neutral-900/80 transition"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-white">Scent Matcher Quiz</span>
                </div>
                {activeSection === 'quiz' ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>

              {activeSection === 'quiz' && (
                <div className="p-4 pt-1 border-t border-neutral-800/80 space-y-3 text-xs animate-fade-in">
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1 font-mono">Quiz Section Title:</label>
                    <input
                      type="text"
                      value={config.scentQuiz.title}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          scentQuiz: { ...config.scentQuiz, title: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-serif"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1 font-mono">Sub-headline Description:</label>
                    <textarea
                      rows={2}
                      value={config.scentQuiz.description}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          scentQuiz: { ...config.scentQuiz, description: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 5. SCENT PYRAMID MASTERCLASS */}
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
              <button
                onClick={() => setActiveSection(activeSection === 'pyramid' ? '' : 'pyramid')}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-neutral-900/80 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Triangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-white">Olfactory Pyramid Section</span>
                </div>
                {activeSection === 'pyramid' ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>

              {activeSection === 'pyramid' && (
                <div className="p-4 pt-1 border-t border-neutral-800/80 space-y-3 text-xs animate-fade-in">
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1 font-mono">Headline:</label>
                    <input
                      type="text"
                      value={config.scentPyramid.title}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          scentPyramid: { ...config.scentPyramid, title: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                    />
                  </div>

                  {/* Top Notes */}
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                    <p className="font-mono text-[10px] text-amber-300">Phase 01: Top Notes</p>
                    <input
                      type="text"
                      value={config.scentPyramid.topNotes.join(', ')}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          scentPyramid: {
                            ...config.scentPyramid,
                            topNotes: e.target.value.split(',').map((s) => s.trim())
                          }
                        })
                      }
                      placeholder="Calabrian Bergamot, Pink Peppercorn..."
                      className="w-full px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-white text-xs mt-1"
                    />
                  </div>

                  {/* Heart Notes */}
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                    <p className="font-mono text-[10px] text-amber-300">Phase 02: Heart Notes</p>
                    <input
                      type="text"
                      value={config.scentPyramid.heartNotes.join(', ')}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          scentPyramid: {
                            ...config.scentPyramid,
                            heartNotes: e.target.value.split(',').map((s) => s.trim())
                          }
                        })
                      }
                      placeholder="Ceylon Cinnamon, Taif Rose..."
                      className="w-full px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-white text-xs mt-1"
                    />
                  </div>

                  {/* Base Notes */}
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                    <p className="font-mono text-[10px] text-amber-300">Phase 03: Base Notes</p>
                    <input
                      type="text"
                      value={config.scentPyramid.baseNotes.join(', ')}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          scentPyramid: {
                            ...config.scentPyramid,
                            baseNotes: e.target.value.split(',').map((s) => s.trim())
                          }
                        })
                      }
                      placeholder="Aged Oud, Golden Ambergris..."
                      className="w-full px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-white text-xs mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 6. CRAFTSMANSHIP & ATELIER STORY */}
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
              <button
                onClick={() => setActiveSection(activeSection === 'craft' ? '' : 'craft')}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-neutral-900/80 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-white">Ceylon Story & Craft</span>
                </div>
                {activeSection === 'craft' ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>

              {activeSection === 'craft' && (
                <div className="p-4 pt-1 border-t border-neutral-800/80 space-y-3 text-xs animate-fade-in">
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1 font-mono">Title:</label>
                    <input
                      type="text"
                      value={config.craftsmanship.title}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          craftsmanship: { ...config.craftsmanship, title: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-serif"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1 font-mono">Paragraph 1:</label>
                    <textarea
                      rows={2}
                      value={config.craftsmanship.p1}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          craftsmanship: { ...config.craftsmanship, p1: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-light"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1 font-mono">Atelier Photo URL:</label>
                    <input
                      type="text"
                      value={config.craftsmanship.imageUrl}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          craftsmanship: { ...config.craftsmanship, imageUrl: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 7. VIP CONNOISSEUR CLUB */}
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
              <button
                onClick={() => setActiveSection(activeSection === 'vip' ? '' : 'vip')}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-neutral-900/80 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-white">VIP Club & Promo Vouchers</span>
                </div>
                {activeSection === 'vip' ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>

              {activeSection === 'vip' && (
                <div className="p-4 pt-1 border-t border-neutral-800/80 space-y-3 text-xs animate-fade-in">
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1 font-mono">Promo Voucher Code:</label>
                    <input
                      type="text"
                      value={config.vipCircle.promoCode}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          vipCircle: { ...config.vipCircle, promoCode: e.target.value }
                        })
                      }
                      placeholder="e.g. AROMA10"
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-mono font-bold uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1 font-mono">Discount Percentage (%):</label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={config.vipCircle.discountPercent}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          vipCircle: { ...config.vipCircle, discountPercent: Number(e.target.value) }
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 8. STORE BRANDING & CONCIERGE */}
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
              <button
                onClick={() => setActiveSection(activeSection === 'brand' ? '' : 'brand')}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-neutral-900/80 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-white">Brand & Atelier Concierge</span>
                </div>
                {activeSection === 'brand' ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>

              {activeSection === 'brand' && (
                <div className="p-4 pt-1 border-t border-neutral-800/80 space-y-3 text-xs animate-fade-in">
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1 font-mono">Brand Name:</label>
                    <input
                      type="text"
                      value={config.brand.name}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          brand: { ...config.brand, name: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1 font-mono">Colombo Atelier Address:</label>
                    <input
                      type="text"
                      value={config.brand.atelierAddress}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          brand: { ...config.brand, atelierAddress: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1 font-mono">WhatsApp Hotline:</label>
                    <input
                      type="text"
                      value={config.brand.whatsappNumber}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          brand: { ...config.brand, whatsappNumber: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1 font-mono">Concierge Email:</label>
                    <input
                      type="text"
                      value={config.brand.conciergeEmail}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          brand: { ...config.brand, conciergeEmail: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 9. NAVIGATION MENU LINKS */}
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
              <button
                onClick={() => setActiveSection(activeSection === 'nav' ? '' : 'nav')}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-neutral-900/80 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-white">Header Navigation Links</span>
                </div>
                {activeSection === 'nav' ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>

              {activeSection === 'nav' && (
                <div className="p-4 pt-1 border-t border-neutral-800/80 space-y-3 text-xs animate-fade-in">
                  <p className="text-[11px] text-neutral-400">
                    Customize every link title and destination URL in the main header:
                  </p>
                  {(config.navigation?.items || []).map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-amber-300">Link #{idx + 1}</span>
                        <button
                          onClick={() => {
                            const updated = config.navigation.items.filter((_, i) => i !== idx)
                            setConfig({ ...config, navigation: { items: updated } })
                          }}
                          className="text-neutral-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => {
                            const updated = [...config.navigation.items]
                            updated[idx] = { ...updated[idx], label: e.target.value }
                            setConfig({ ...config, navigation: { items: updated } })
                          }}
                          placeholder="Link Label"
                          className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-white text-xs"
                        />
                        <input
                          type="text"
                          value={item.href}
                          onChange={(e) => {
                            const updated = [...config.navigation.items]
                            updated[idx] = { ...updated[idx], href: e.target.value }
                            setConfig({ ...config, navigation: { items: updated } })
                          }}
                          placeholder="Link URL"
                          className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const updated = [...(config.navigation?.items || []), { label: 'New Link', href: '#fragrance-catalog' }]
                      setConfig({ ...config, navigation: { items: updated } })
                    }}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Navigation Link</span>
                  </button>
                </div>
              )}
            </div>

            {/* 10. REVIEWS & CUSTOMER TESTIMONIALS */}
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
              <button
                onClick={() => setActiveSection(activeSection === 'reviews' ? '' : 'reviews')}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-neutral-900/80 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-white">Client Reviews & Avatars</span>
                </div>
                {activeSection === 'reviews' ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>

              {activeSection === 'reviews' && (
                <div className="p-4 pt-1 border-t border-neutral-800/80 space-y-3 text-xs animate-fade-in">
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1 font-mono">Section Headline:</label>
                    <input
                      type="text"
                      value={config.testimonials.title}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          testimonials: { ...config.testimonials, title: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1 font-mono">Button Text:</label>
                    <input
                      type="text"
                      value={config.testimonials.writeReviewBtnText || 'Write a Fragrance Review'}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          testimonials: { ...config.testimonials, writeReviewBtnText: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                    />
                  </div>

                  <p className="text-[11px] font-mono text-neutral-400 uppercase pt-2">
                    Verified Reviews ({config.testimonials.items.length}):
                  </p>
                  {config.testimonials.items.slice(0, 5).map((t, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[10px] text-amber-300 font-bold">{t.name}</span>
                        <span className="text-[10px] text-neutral-500">{t.rating} Stars &bull; {t.scent}</span>
                      </div>
                      <input
                        type="text"
                        value={t.review}
                        onChange={(e) => {
                          const updated = [...config.testimonials.items]
                          updated[idx] = { ...updated[idx], review: e.target.value }
                          setConfig({ ...config, testimonials: { ...config.testimonials, items: updated } })
                        }}
                        className="w-full px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 11. SEO & SEARCH ENGINE METADATA */}
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
              <button
                onClick={() => setActiveSection(activeSection === 'seo' ? '' : 'seo')}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-neutral-900/80 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-white">SEO & Social Meta</span>
                </div>
                {activeSection === 'seo' ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>

              {activeSection === 'seo' && (
                <div className="p-4 pt-1 border-t border-neutral-800/80 space-y-3 text-xs animate-fade-in">
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1 font-mono">Meta Title (Google Snippet):</label>
                    <input
                      type="text"
                      value={config.seo?.metaTitle || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          seo: { ...config.seo, metaTitle: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1 font-mono">Meta Description:</label>
                    <textarea
                      rows={2}
                      value={config.seo?.metaDescription || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          seo: { ...config.seo, metaDescription: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1 font-mono">Keywords (Comma-separated):</label>
                    <input
                      type="text"
                      value={config.seo?.keywords || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          seo: { ...config.seo, keywords: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT CANVAS: LIVE INTERACTIVE PREVIEW */}
        <main className="flex-1 bg-[#050505] overflow-y-auto flex flex-col items-center p-4 md:p-6 relative">
          <div
            className={`transition-all duration-300 w-full overflow-hidden rounded-2xl border border-neutral-800 bg-black shadow-2xl ${
              deviceMode === 'mobile'
                ? 'max-w-[390px] min-h-[844px] border-4 border-neutral-700 shadow-amber-500/5 my-4'
                : deviceMode === 'tablet'
                ? 'max-w-[768px] min-h-[900px] border-2 border-neutral-700 my-4'
                : 'max-w-full min-h-full'
            }`}
          >
            {/* Live Customer Page inside CartProvider with instant visual reactivity */}
            <CartProvider>
              <CustomerHomePage />
            </CartProvider>
          </div>
        </main>
      </div>
    </div>
  )
}
