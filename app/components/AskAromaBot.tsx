'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send, Bot, RefreshCcw } from 'lucide-react'

interface Message {
  role: 'user' | 'model'
  content: string
}

const INITIAL_SUGGESTIONS = [
  'Recommend a scent for an evening gala',
  'What makes Ceylon Royal Oud special?',
  'Best fragrance for tropical heat?',
  'Tell me about shipping & samples'
]

export default function AskAromaBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content:
        'Greetings. I am your Aroma Atelier Olfactory Sommelier. How may I guide your fragrance journey across our Ceylon handcrafted extraits today?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input
    if (!textToSend.trim() || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: textToSend }]
    setMessages(newMessages)
    if (!messageText) setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      })
      const data = await res.json()
      setMessages([...newMessages, { role: 'model', content: data.reply || 'At your service.' }])
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'model',
          content:
            'Our atelier distillers are always at your service. For instant bespoke consultations, you may also reach our Colombo atelier via WhatsApp at +94 77 123 4567.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Concierge Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-tr from-neutral-900 to-[#1c1917] border border-amber-400/50 text-amber-300 hover:text-white shadow-2xl hover:scale-105 transition-all duration-300 group flex items-center gap-2.5"
        aria-label="Open Atelier Concierge Chat"
        title="Consult Aroma Atelier Sommelier"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        </div>
        <span className="hidden md:inline font-mono text-xs uppercase tracking-widest text-amber-300 font-semibold pr-1">
          Atelier Sommelier
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-6 z-50 w-[92vw] sm:w-[390px] h-[520px] max-h-[80vh] rounded-3xl bg-[#090909] border border-neutral-800 flex flex-col shadow-2xl overflow-hidden animate-fade-in font-sans">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-neutral-950 via-[#141414] to-neutral-950 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-amber-400/40 bg-black flex items-center justify-center text-amber-300 shadow">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-serif font-medium text-white tracking-wide">
                  Atelier Olfactory Concierge
                </h4>
                <p className="text-[10px] font-mono text-neutral-400">
                  AROMA Colombo Haute Parfumerie
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setMessages([
                    {
                      role: 'model',
                      content:
                        'Greetings. I am your Aroma Atelier Olfactory Sommelier. How may I guide your fragrance journey across our Ceylon handcrafted extraits today?'
                    }
                  ])
                }
                className="p-1.5 text-neutral-500 hover:text-white transition"
                title="Reset conversation"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white transition"
                aria-label="Close concierge"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 ${
                    m.role === 'user'
                      ? 'bg-amber-400 text-black font-medium'
                      : 'bg-neutral-900/90 text-neutral-200 border border-neutral-800 leading-relaxed font-light'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 text-neutral-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span className="text-[11px] font-mono">Consulting Master Distiller notes...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Suggested Prompts (when only initial greeting) */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <p className="text-[10px] font-mono uppercase text-neutral-500 mb-1.5">
                Popular Inquiries:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {INITIAL_SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-left transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box */}
          <div className="p-3 bg-[#070707] border-t border-neutral-800 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about notes, longevity, occasions..."
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-black font-bold transition shadow"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
