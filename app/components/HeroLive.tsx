'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, Pause, Play, Sparkles } from 'lucide-react'
import { useSiteConfig } from '@/lib/siteConfigStore'

export type HeroSlide = {
  id: string
  title: string
  subtitle?: string
  badge_text?: string
  description?: string
  media_type?: 'image' | 'video'
  image_url?: string
  video_url?: string
  mobile_image_url?: string
  cta_text?: string
  cta_link?: string
  animation_type?: string
  duration?: number
  sort_order?: number
  is_active?: boolean
}

const DEFAULT_SLIDES: HeroSlide[] = [
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
    duration: 6,
    is_active: true
  }
]

export default function HeroLive() {
  const { config } = useSiteConfig()
  const [slides, setSlides] = useState<HeroSlide[]>(config?.hero?.slides || DEFAULT_SLIDES)
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [isLoaded, setIsLoaded] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartX = useRef(0)

  // React to Theme Customizer live edits
  useEffect(() => {
    if (config?.hero?.slides && config.hero.slides.length > 0) {
      setSlides(config.hero.slides as HeroSlide[])
    }
  }, [config?.hero?.slides])

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('hero_sections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (!error && data && data.length > 0) {
        setSlides(data as HeroSlide[])
        setCurrent(0)
      } else {
        // Fallback to default luxury slides if table is empty or error
        setSlides(DEFAULT_SLIDES)
      }
    } catch {
      setSlides(DEFAULT_SLIDES)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    load()
    try {
      const channel = supabase
        .channel('hero-live-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_sections' }, () => {
          load()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    } catch {
      // Supabase realtime channel fallback
    }
  }, [load])

  // Auto Play with pause support
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (paused || slides.length <= 1) return

    const duration = (slides[current]?.duration || 6) * 1000
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length)
    }, duration)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [current, paused, slides])

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  // Touch Swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) next()
      else prev()
    }
  }

  if (!isLoaded) {
    return <div className="h-[85vh] w-full bg-[#050505] animate-pulse" />
  }

  const slide = slides[current] || DEFAULT_SLIDES[0]

  return (
    <section
      className="relative h-[85vh] md:h-[92vh] w-full overflow-hidden bg-black text-white select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides Backgrounds */}
      {slides.map((s, idx) => {
        const isActive = idx === current
        const isZoom = s.animation_type?.includes('zoom') || true

        return (
          <div
            key={s.id || idx}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-[cubic-bezier(0.77,0,0.175,1)] ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {s.media_type === 'video' && s.video_url ? (
              <video
                src={s.video_url}
                poster={s.image_url}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover scale-[1.03]"
              />
            ) : s.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.mobile_image_url || s.image_url}
                alt={s.title || 'Fragrance Slide'}
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[8000ms] ${
                  isActive && isZoom ? 'scale-110' : 'scale-100'
                }`}
              />
            ) : (
              <div className="absolute inset-0 bg-[#090909]" />
            )}

            {/* Cinematic Luxury Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/30 md:via-black/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
          </div>
        )
      })}

      {/* Slide Content */}
      <div className="relative z-20 h-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 flex flex-col justify-center">
        <div className="max-w-[700px]">
          {/* Badge */}
          {slide.badge_text && (
            <div className="inline-flex items-center gap-3 mb-5 animate-fade-in">
              <span className="h-[1px] w-8 bg-amber-400/80" />
              <span className="text-[11px] font-mono tracking-[0.35em] uppercase text-amber-300 font-semibold">
                {slide.badge_text}
              </span>
            </div>
          )}

          {/* Subtitle */}
          {slide.subtitle && (
            <p className="text-[13px] md:text-sm tracking-[0.2em] uppercase text-neutral-300 mb-4 font-light">
              {slide.subtitle}
            </p>
          )}

          {/* Title */}
          <h1 className="text-[46px] md:text-[76px] lg:text-[88px] font-serif font-light leading-[0.88] tracking-[-0.03em] whitespace-pre-wrap text-white">
            {slide.title}
          </h1>

          {/* Description */}
          {slide.description && (
            <p className="mt-6 text-[15px] md:text-[17px] leading-[1.65] text-neutral-300 max-w-[560px] font-light">
              {slide.description}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href={slide.cta_link || '#fragrance-catalog'}
              className="inline-flex items-center justify-center px-8 h-12 bg-white text-black hover:bg-neutral-200 rounded-full text-xs font-semibold tracking-wider uppercase transition shadow-xl"
            >
              <span>{slide.cta_text || 'Shop Fragrance'}</span>
              <span className="ml-2">→</span>
            </a>

            <a
              href="#scent-finder"
              className="inline-flex items-center justify-center px-7 h-12 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white rounded-full text-xs font-medium tracking-wide transition"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-300" />
              <span>Scent Match Quiz</span>
            </a>

          </div>
        </div>
      </div>

      {/* Bottom Controls / Progress Bar */}
      <div className="absolute bottom-8 left-0 right-0 z-20 max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Slide Indicators */}
        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 transition-all duration-500 rounded-full ${
                idx === current ? 'w-10 bg-amber-400' : 'w-3 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
          <span className="text-[11px] font-mono text-neutral-400 ml-3">
            0{current + 1} / 0{slides.length}
          </span>
        </div>

        {/* Next / Prev / Pause buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaused(!paused)}
            className="w-10 h-10 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition"
            title={paused ? 'Play autoplay' : 'Pause autoplay'}
          >
            {paused ? <Play className="w-3.5 h-3.5 ml-0.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}