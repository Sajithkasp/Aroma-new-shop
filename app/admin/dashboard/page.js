'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { TABLES, TABLE_CATEGORIES } from '@/lib/adminTableConfigs'
import { supabase } from '@/lib/supabase'
import { APP_CONFIG } from '@/lib/config'
import * as Icons from 'lucide-react'

// Known tables with active data reported by user
const TABLES_WITH_DATA = new Set([
  'products',
  'product_images',
  'product_variants',
  'categories',
  'delivery_settings',
  'customers',
  'payment_methods',
  'orders',
  'pages',
  'collections',
  'navigation_menus',
  'site_settings',
  'product_types',
  'admins',
  'coupons'
])

export default function AdminDashboardPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [authorized, setAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.email?.toLowerCase().trim() === APP_CONFIG.ADMIN_EMAIL.toLowerCase().trim()) {
          setAuthorized(true)
          setCheckingAuth(false)
          return
        }

        const stored = localStorage.getItem('aroma_auth_customer')
        if (stored) {
          const u = JSON.parse(stored)
          if (u.is_verified_oauth && u.email?.toLowerCase().trim() === APP_CONFIG.ADMIN_EMAIL.toLowerCase().trim()) {
            setAuthorized(true)
          }
        }
      } catch {
        // unauthorized
      } finally {
        setCheckingAuth(false)
      }
    }

    verifyAccess()
  }, [])

  const categories = useMemo(() => {
    return ['ALL', ...Object.values(TABLE_CATEGORIES)]
  }, [])

  const filteredTables = useMemo(() => {
    return TABLES.filter((t) => {
      const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory
      const matchesSearch =
        !search.trim() ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.table.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [search, selectedCategory])

  const stats = useMemo(() => {
    const total = TABLES.length
    const withData = TABLES.filter(t => TABLES_WITH_DATA.has(t.table)).length
    const empty = total - withData
    return { total, withData, empty }
  }, [])

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-neutral-400 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span>Verifying Store Owner Atelier Credentials...</span>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-neutral-200">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#0a0a0a] border border-neutral-800 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400">
            <Icons.ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-serif text-white">Store Owner Access Required</h2>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              This administrative atelier is strictly restricted to verified owner{' '}
              <span className="text-amber-400 font-mono font-semibold">{APP_CONFIG.ADMIN_EMAIL}</span>.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={() => {
                supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: typeof window !== 'undefined' ? window.location.href : '',
                    queryParams: { prompt: 'select_account' }
                  }
                })
              }}
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Sign in with Google as Store Owner</span>
            </button>

            <Link
              href="/"
              className="block w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white text-xs transition"
            >
              ← Return to Fragrance Boutique
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans pb-24">
      {/* TOP HEADER */}
      <header className="border-b border-neutral-800 bg-[#090909]/90 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/10">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white">AROMA ADMIN CONTROL</h1>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
                  57 TABLES LIVE
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Full-customization suite for all Supabase database tables & site settings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/dashboard/customizer"
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-amber-400/20"
            >
              <Icons.Sliders className="w-4 h-4 text-black" />
              <span>Theme Customizer (No-Code)</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-200 rounded-xl transition flex items-center gap-1.5"
            >
              <Icons.ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              <span>Live Store</span>
            </Link>

            <Link
              href="/admin/login"
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl border border-neutral-800 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* DASHBOARD HERO BANNER */}
      <main className="max-w-7xl mx-auto px-6 pt-8">
        <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-xs font-mono tracking-widest text-amber-400 uppercase font-bold">
                Luxury Fragrance CMS Engine
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-1">
                Universal Database Manager
              </h2>
              <p className="text-sm text-neutral-400 mt-2 max-w-xl leading-relaxed">
                Seamlessly read, add, update, duplicate, and delete records across all 57 database tables.
                Supports custom columns, automatic schema detection, and raw JSON payload editing.
              </p>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
              <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-4 text-center min-w-[100px]">
                <p className="text-[10px] text-neutral-500 font-mono uppercase">Total Tables</p>
                <p className="text-2xl font-black text-white mt-1">{stats.total}</p>
              </div>
              <div className="bg-[#181818] border border-emerald-900/40 rounded-2xl p-4 text-center min-w-[100px]">
                <p className="text-[10px] text-emerald-400 font-mono uppercase">Has Data</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">{stats.withData}</p>
              </div>
              <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-4 text-center min-w-[100px]">
                <p className="text-[10px] text-neutral-500 font-mono uppercase">Empty / Ready</p>
                <p className="text-2xl font-black text-neutral-400 mt-1">{stats.empty}</p>
              </div>
            </div>
          </div>

          {/* SHOPIFY THEME CUSTOMIZER SPOTLIGHT CARD */}
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-black flex items-center justify-center shrink-0">
                <Icons.Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Shopify-Style Visual Theme Customizer</span>
                  <span className="text-[9px] bg-amber-400 text-black px-2 py-0.5 rounded-full font-mono font-bold">NO CODE REQUIRED</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Edit Hero slides, announcement bar, scent quiz questions, story, reviews, and branding with live desktop/mobile preview.
                </p>
              </div>
            </div>

            <Link
              href="/admin/dashboard/customizer"
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shrink-0 flex items-center gap-1.5"
            >
              <span>Open Theme Customizer</span>
              <Icons.ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* SEARCH & CATEGORY FILTER BAR */}
          <div className="mt-8 pt-6 border-t border-neutral-800/80 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            <div className="relative flex-1 max-w-md">
              <Icons.Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tables by name, slug, or table identifier..."
                className="w-full bg-[#161616] border border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                >
                  <Icons.X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* CATEGORY TABS */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition font-medium ${
                    selectedCategory === cat
                      ? 'bg-white text-black shadow'
                      : 'bg-[#181818] text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 57 TABLES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTables.map((item) => {
            const Icon = Icons[item.icon] || Icons.Database
            const hasData = TABLES_WITH_DATA.has(item.table)

            return (
              <Link
                key={item.slug}
                href={`/admin/dashboard/${item.slug}`}
                className="group bg-[#111] border border-neutral-800/80 hover:border-amber-500/50 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:border-amber-500/30 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] font-mono bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-full text-neutral-400 group-hover:text-amber-300">
                        /{item.slug}
                      </span>
                      {hasData ? (
                        <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Data
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-neutral-600">Ready</span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-4 group-hover:text-amber-300 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-[10px] font-mono text-neutral-500 mt-0.5 truncate">
                    table: {item.table}
                  </p>
                  <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-900 flex justify-between items-center text-[11px] font-medium text-neutral-400 group-hover:text-white">
                  <span>Open Customizer</span>
                  <Icons.ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>

        {filteredTables.length === 0 && (
          <div className="bg-[#111] border border-neutral-800 rounded-3xl p-12 text-center my-6">
            <Icons.Search className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No tables match your search</h4>
            <p className="text-xs text-neutral-400 mt-1">Try clearing your search query or selecting &quot;ALL&quot; category.</p>
            <button
              onClick={() => {
                setSearch('')
                setSelectedCategory('ALL')
              }}
              className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  )
}