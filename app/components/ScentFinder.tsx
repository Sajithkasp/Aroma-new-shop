'use client'

import { useState } from 'react'
import { AROMA_FRAGRANCES, Fragrance } from '@/lib/aromaData'
import { useCart } from '@/lib/cartContext'
import { Sparkles, Check, ArrowRight, RotateCcw, Droplets } from 'lucide-react'

const QUIZ_STEPS = [
  {
    question: '1. What olfactory mood best defines your presence?',
    options: [
      { label: 'Dark, Resinous & Regal', value: 'dark', icon: '👑', targetCategory: 'Oud & Woody' },
      { label: 'Warm, Seductive & Spiced', value: 'spicy', icon: '✨', targetCategory: 'Warm Spices' },
      { label: 'Crisp, Marine & Coastal Fresh', value: 'fresh', icon: '🌊', targetCategory: 'Fresh Aquatic' },
      { label: 'Warm Honey, Amber & Bourbon Vanilla', value: 'amber', icon: '🍯', targetCategory: 'Amber Gourmand' }
    ]
  },
  {
    question: '2. When will you predominantly wear this fragrance?',
    options: [
      { label: 'Formal Galas & Late Evenings', value: 'evening', icon: '🌙' },
      { label: 'Daily Signature for Boardroom & Office', value: 'daily', icon: '💼' },
      { label: 'Tropical Weekends & Outdoor Escapes', value: 'weekend', icon: '☀️' },
      { label: 'Intimate Dinners & Special Moments', value: 'intimate', icon: '🕯️' }
    ]
  },
  {
    question: '3. Which key Sri Lankan / artisanal note resonates with you?',
    options: [
      { label: '12-Year Aged Ceylon Agarwood (Oud)', value: 'oud', targetSlug: 'ceylon-royal-oud' },
      { label: 'Sun-dried Ceylon Cinnamon Quills & Saffron', value: 'cinnamon', targetSlug: 'midnight-cinnamon-noir' },
      { label: 'Indian Ocean Sea Spray & Sun-bleached Driftwood', value: 'aquatic', targetSlug: 'aqua-de-ceylon' },
      { label: 'Golden Ambergris & Bourbon Vanilla Pods', value: 'ambergris', targetSlug: 'golden-ambergris-extrait' }
    ]
  }
]

export default function ScentFinder({ onSelectFragrance }: { onSelectFragrance?: (f: Fragrance) => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [matchedFragrance, setMatchedFragrance] = useState<Fragrance | null>(null)
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const handleSelectOption = (stepIndex: number, value: string, targetSlug?: string, targetCategory?: string) => {
    const newAnswers = { ...answers, [stepIndex]: value }
    setAnswers(newAnswers)

    if (stepIndex < QUIZ_STEPS.length - 1) {
      setCurrentStep(stepIndex + 1)
    } else {
      // Calculate match
      let match = AROMA_FRAGRANCES[0]
      if (targetSlug) {
        match = AROMA_FRAGRANCES.find((f) => f.slug === targetSlug) || match
      } else if (targetCategory) {
        match = AROMA_FRAGRANCES.find((f) => f.category === targetCategory) || match
      } else {
        const step0Val = newAnswers[0]
        if (step0Val === 'spicy') match = AROMA_FRAGRANCES[1]
        else if (step0Val === 'fresh') match = AROMA_FRAGRANCES[2]
        else if (step0Val === 'amber') match = AROMA_FRAGRANCES[4]
        else match = AROMA_FRAGRANCES[0]
      }
      setMatchedFragrance(match)
      setAdded(false)
    }
  }

  const restart = () => {
    setCurrentStep(0)
    setAnswers({})
    setMatchedFragrance(null)
    setAdded(false)
  }

  const handleAddMatchedToCart = () => {
    if (!matchedFragrance) return
    addToCart({
      id: matchedFragrance.id,
      name: matchedFragrance.name,
      price: matchedFragrance.price,
      volume_ml: matchedFragrance.volume_ml,
      image_url: matchedFragrance.image_url,
      concentration: matchedFragrance.concentration
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 3000)
  }

  return (
    <section id="scent-finder" className="max-w-5xl mx-auto px-6 py-20">
      <div className="relative rounded-[32px] bg-gradient-to-b from-[#121212] via-[#0d0d0d] to-[#070707] border border-neutral-800 p-8 md:p-14 overflow-hidden shadow-2xl">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-mono uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Olfactory Matcher</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif text-white tracking-tight">
              Discover Your Signature Scent
            </h2>
            <p className="mt-3 text-xs md:text-sm text-neutral-400">
              Answer 3 brief questions to identify your harmonized Ceylon artisan fragrance persona.
            </p>
          </div>

          {!matchedFragrance ? (
            <div className="max-w-2xl mx-auto">
              {/* Progress bar */}
              <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mb-4">
                <span>Step 0{currentStep + 1} of 0{QUIZ_STEPS.length}</span>
                <span>{Math.round(((currentStep + 1) / QUIZ_STEPS.length) * 100)}%</span>
              </div>
              <div className="w-full h-1 bg-neutral-800 rounded-full mb-8 overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / QUIZ_STEPS.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <h3 className="text-lg md:text-xl font-medium text-white mb-6">
                {QUIZ_STEPS[currentStep].question}
              </h3>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {QUIZ_STEPS[currentStep].options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      handleSelectOption(
                        currentStep,
                        opt.value,
                        (opt as any).targetSlug,
                        (opt as any).targetCategory
                      )
                    }
                    className="p-5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-400/50 text-left transition group flex items-start justify-between"
                  >
                    <div>
                      {(opt as any).icon && <span className="text-xl mb-2 block">{(opt as any).icon}</span>}
                      <p className="text-sm font-semibold text-neutral-200 group-hover:text-white">
                        {opt.label}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-1 transition shrink-0 mt-1" />
                  </button>
                ))}
              </div>

              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="mt-6 text-xs text-neutral-500 hover:text-neutral-300 transition"
                >
                  ← Previous Question
                </button>
              )}
            </div>
          ) : (
            /* RESULT CARD */
            <div className="max-w-3xl mx-auto bg-neutral-900/90 border border-amber-400/30 rounded-3xl p-6 md:p-8 animate-fade-in">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-48 h-64 rounded-2xl overflow-hidden bg-neutral-950 shrink-0 relative shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={matchedFragrance.image_url}
                    alt={matchedFragrance.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-amber-400 text-black text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                    98% MATCH
                  </div>
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-mono text-amber-300 uppercase tracking-widest">
                      Your Scent Persona Result
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif font-light text-white">
                    {matchedFragrance.name}
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">
                    {matchedFragrance.concentration} ({matchedFragrance.concentration_pct}% Concentration) · {matchedFragrance.volume_ml}ml
                  </p>

                  <p className="mt-3 text-xs md:text-sm text-neutral-300 leading-relaxed font-light">
                    {matchedFragrance.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-neutral-800 text-xs">
                    <p className="text-[11px] font-mono text-neutral-400 uppercase">Olfactory Pyramid Harmony</p>
                    <p className="text-neutral-300 mt-1 font-light text-xs">
                      {matchedFragrance.fragrance_notes}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleAddMatchedToCart}
                      className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg transition flex items-center gap-2"
                    >
                      {added ? (
                        <>
                          <Check className="w-4 h-4 text-black" />
                          <span>Added to Bag!</span>
                        </>
                      ) : (
                        <>
                          <Droplets className="w-4 h-4 text-black" />
                          <span>Add to Bag (LKR {matchedFragrance.price.toLocaleString()})</span>
                        </>
                      )}
                    </button>

                    {onSelectFragrance && (
                      <button
                        onClick={() => onSelectFragrance(matchedFragrance)}
                        className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition"
                      >
                        Inspect Scent Notes
                      </button>
                    )}

                    <button
                      onClick={restart}
                      className="px-4 py-3 text-neutral-400 hover:text-white text-xs flex items-center gap-1.5 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Quiz</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
