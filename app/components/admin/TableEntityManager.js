'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { TABLES, getTableConfig } from '@/lib/adminTableConfigs'
import * as Icons from 'lucide-react'

export default function TableEntityManager({ tableSlug, customTitle, customDescription }) {
  const router = useRouter()
  const config = useMemo(() => getTableConfig(tableSlug), [tableSlug])

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [form, setForm] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [rawJsonMode, setRawJsonMode] = useState(false)
  const [rawJsonText, setRawJsonText] = useState('{}')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('table') // 'table' | 'cards'
  const [rowLimit, setRowLimit] = useState(50)
  const [activeJsonModal, setActiveJsonModal] = useState(null)
  const [notification, setNotification] = useState(null) // { type: 'success' | 'error' | 'info', message: '' }
  const [customFields, setCustomFields] = useState([])
  const [newFieldName, setNewFieldName] = useState('')
  const [newFieldValue, setNewFieldValue] = useState('')
  const [showAddCustomField, setShowAddCustomField] = useState(false)

  // Resolve Lucide Icon dynamically
  const IconComponent = Icons[config.icon] || Icons.Database

  // Show auto-dismiss notification
  const showNotification = useCallback((type, message) => {
    setNotification({ type, message })
    if (type === 'success') {
      setTimeout(() => setNotification(null), 4000)
    }
  }, [])

  // Auto-detect any columns existing in Supabase rows that aren't declared in static config
  const detectedColumns = useMemo(() => {
    const definedKeys = new Set(config.fields.map(f => f.key))
    definedKeys.add('id')
    definedKeys.add('created_at')
    definedKeys.add('updated_at')

    const extra = new Set()
    rows.forEach(r => {
      Object.keys(r || {}).forEach(k => {
        if (!definedKeys.has(k)) {
          extra.add(k)
        }
      })
    })
    return Array.from(extra)
  }, [config.fields, rows])

  // Fetch rows from Supabase
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase.from(config.table).select('*').limit(rowLimit)
      
      // Try to order by created_at, fallback if column doesn't exist
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) {
        // If sorting failed because created_at does not exist, retry without order
        if (error.message?.includes('created_at') || error.code === '42703') {
          const fallback = await supabase.from(config.table).select('*').limit(rowLimit)
          if (fallback.error) {
            showNotification('error', `Failed to load ${config.table}: ${fallback.error.message}`)
            setRows([])
          } else {
            setRows(fallback.data || [])
          }
        } else {
          showNotification('error', `Error loading ${config.table}: ${error.message}`)
          setRows([])
        }
      } else {
        setRows(data || [])
      }
    } catch (err) {
      showNotification('error', `Unexpected error: ${err.message}`)
      setRows([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [config.table, rowLimit, showNotification])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handle open form for new record
  const handleAddNew = () => {
    const initial = {}
    config.fields.forEach(f => {
      if (f.defaultValue !== undefined) {
        initial[f.key] = f.defaultValue
      } else if (f.type === 'boolean') {
        initial[f.key] = false
      } else if (f.type === 'number') {
        initial[f.key] = ''
      } else {
        initial[f.key] = ''
      }
    })
    setForm(initial)
    setEditingId(null)
    setRawJsonMode(false)
    setCustomFields([])
    setFormOpen(true)
    window.scrollTo({ top: 150, behavior: 'smooth' })
  }

  // Handle Edit existing row
  const handleEdit = (row) => {
    const cleanForm = { ...row }
    setEditingId(row.id || row.table_id || true)
    setForm(cleanForm)
    setRawJsonText(JSON.stringify(cleanForm, null, 2))
    setRawJsonMode(false)
    setCustomFields([])
    setFormOpen(true)
    window.scrollTo({ top: 150, behavior: 'smooth' })
  }

  // Handle Duplicate row
  const handleDuplicate = (row) => {
    const clone = { ...row }
    delete clone.id
    delete clone.created_at
    delete clone.updated_at
    if (clone.slug) clone.slug = `${clone.slug}-copy`
    if (clone.name) clone.name = `${clone.name} (Copy)`
    if (clone.title) clone.title = `${clone.title} (Copy)`
    
    setEditingId(null)
    setForm(clone)
    setRawJsonText(JSON.stringify(clone, null, 2))
    setRawJsonMode(false)
    setFormOpen(true)
    showNotification('info', 'Duplicating record. Make any changes and click Save.')
    window.scrollTo({ top: 150, behavior: 'smooth' })
  }

  // Handle Delete
  const handleDelete = async (id) => {
    if (!id) return
    if (!window.confirm(`Are you sure you want to delete this record from ${config.table}?`)) {
      return
    }

    try {
      const { error } = await supabase.from(config.table).delete().eq('id', id)
      if (error) {
        showNotification('error', `Delete failed: ${error.message}`)
      } else {
        showNotification('success', 'Record deleted successfully!')
        loadData()
      }
    } catch (err) {
      showNotification('error', `Delete error: ${err.message}`)
    }
  }

  // Add a custom field to the active form
  const handleAddCustomField = () => {
    if (!newFieldName.trim()) return
    const key = newFieldName.trim().toLowerCase().replace(/\s+/g, '_')
    let val = newFieldValue
    if (val === 'true') val = true
    if (val === 'false') val = false
    if (!isNaN(val) && val !== '') val = Number(val)

    setForm(prev => ({ ...prev, [key]: val }))
    setCustomFields(prev => [...prev, key])
    setNewFieldName('')
    setNewFieldValue('')
    setShowAddCustomField(false)
  }

  // Save Form (Insert or Update)
  const handleSave = async (e) => {
    if (e) e.preventDefault()

    let payload = {}

    if (rawJsonMode) {
      try {
        payload = JSON.parse(rawJsonText)
      } catch (err) {
        showNotification('error', `Invalid JSON syntax: ${err.message}`)
        return
      }
    } else {
      payload = { ...form }
      // Process values (cast numbers, handle JSON fields)
      config.fields.forEach(f => {
        if (f.type === 'number' && payload[f.key] !== '' && payload[f.key] !== undefined && payload[f.key] !== null) {
          payload[f.key] = Number(payload[f.key])
        }
        if (f.type === 'json' && typeof payload[f.key] === 'string' && payload[f.key].trim() !== '') {
          try {
            payload[f.key] = JSON.parse(payload[f.key])
          } catch {
            // keep as string if not valid JSON
          }
        }
      })
    }

    // Prepare payload for Supabase
    // Remove auto-generated columns when updating or inserting
    const submission = { ...payload }
    const targetId = editingId || submission.id

    delete submission.id
    delete submission.created_at
    delete submission.updated_at

    try {
      if (editingId && targetId) {
        const { error } = await supabase.from(config.table).update(submission).eq('id', targetId)
        if (error) {
          showNotification('error', `Update error in ${config.table}: ${error.message}`)
          return
        }
        showNotification('success', `Record updated successfully in ${config.name}!`)
      } else {
        const { error } = await supabase.from(config.table).insert([submission])
        if (error) {
          showNotification('error', `Insert error in ${config.table}: ${error.message}`)
          return
        }
        showNotification('success', `New record created successfully in ${config.name}!`)
      }

      setFormOpen(false)
      setEditingId(null)
      loadData()
    } catch (err) {
      showNotification('error', `Operation failed: ${err.message}`)
    }
  }

  // Seed Aroma sample data for the active table
  const handleSeedDemoData = async () => {
    setRefreshing(true)
    try {
      let preset = []
      if (config.table === 'products') {
        preset = [
          { name: 'Ceylon Royal Oud', slug: 'ceylon-royal-oud', price: 18500, compare_price: 22000, volume_ml: 50, fragrance_notes: 'Bergamot, Ceylon Cinnamon, 12-Year Aged Oud', is_active: true, is_featured: true, stock: 28, image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=85', description: 'Distilled ancient Ceylon Agarwood and organic cinnamon.' },
          { name: 'Midnight Cinnamon Noir', slug: 'midnight-cinnamon-noir', price: 16500, compare_price: 19500, volume_ml: 50, fragrance_notes: 'Cardamom, Cinnamon Bark, Bourbon Vanilla', is_active: true, is_featured: true, stock: 34, image_url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=85', description: 'Artisanal spice island reserve perfume.' },
          { name: 'Aqua de Ceylon', slug: 'aqua-de-ceylon', price: 13500, compare_price: 15500, volume_ml: 50, fragrance_notes: 'Ocean Mist, Bergamot, Coastal Driftwood', is_active: true, is_featured: true, stock: 45, image_url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop&q=85', description: 'Fresh Indian Ocean sea spray and driftwood.' }
        ]
      } else if (config.table === 'hero_sections') {
        preset = [
          { title: 'CEYLON\nROYAL OUD', subtitle: 'EXTRAIT DE PARFUM · 35% OIL CONCENTRATION', badge_text: 'HANDCRAFTED IN SRI LANKA', description: 'Distilled from sustainably sourced ancient Ceylon Agarwood and warm smoked amber.', image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1600&auto=format&fit=crop&q=85', cta_text: 'Explore Royal Oud', cta_link: '#fragrance-catalog', duration: 6, sort_order: 1, is_active: true, is_visible: 1 },
          { title: 'MIDNIGHT\nCINNAMON NOIR', subtitle: 'AN OLFACTORY ODE TO SPICE ISLAND', badge_text: 'PRIVATE RESERVE 2026', description: 'Pure organic Ceylon cinnamon quill absolute married with French damask rose and smoked vanilla.', image_url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=1600&auto=format&fit=crop&q=85', cta_text: 'Discover Noir Series', cta_link: '#fragrance-catalog', duration: 6, sort_order: 2, is_active: true, is_visible: 1 }
        ]
      } else if (config.table === 'categories') {
        preset = [
          { name: 'Oud & Woody', slug: 'oud-woody', description: 'Distilled ancient agarwood and smoked resins', is_active: true },
          { name: 'Warm Spices', slug: 'warm-spices', description: 'Ceylon cinnamon quills, cardamom, and clove', is_active: true },
          { name: 'Fresh Aquatic', slug: 'fresh-aquatic', description: 'Indian Ocean breeze and coastal driftwood', is_active: true },
          { name: 'Amber Gourmand', slug: 'amber-gourmand', description: 'Golden ambergris and bourbon vanilla pods', is_active: true },
          { name: 'Discovery Sets', slug: 'discovery-sets', description: 'Curated 10ml travel flacons and luxury coffrets', is_active: true }
        ]
      } else if (config.table === 'coupons') {
        preset = [
          { code: 'AROMA10', discount_type: 'percentage', discount_value: 10, min_order_amount: 5000, is_active: true, usage_limit: 500 },
          { code: 'CEYLONVIP', discount_type: 'percentage', discount_value: 20, min_order_amount: 15000, is_active: true, usage_limit: 100 }
        ]
      } else if (config.table === 'announcement_bars' || config.table === 'announcements') {
        preset = [
          { message: '✦ COMPLIMENTARY EXPRESS DELIVERY ON ALL ORDERS OVER LKR 10,000 ISLAND-WIDE ✦', is_active: true },
          { message: '✦ 2 FREE BESPOKE 3ML SAMPLES INCLUDED WITH EVERY FULL-SIZE FLACON ✦', is_active: true }
        ]
      } else if (config.table === 'delivery_settings') {
        preset = [
          { name: 'Standard Island-wide Courier', fee: 450, free_shipping_threshold: 10000, estimated_days: '2-3 Business Days', is_active: true },
          { name: 'Colombo Same-Day VIP Dispatch', fee: 950, free_shipping_threshold: 25000, estimated_days: 'Same Day within 6 hours', is_active: true }
        ]
      } else if (config.table === 'site_settings') {
        preset = [
          { site_name: 'Aroma Perfumes', brand_name: 'AROMA', tagline: 'Artisanal Sri Lankan Haute Parfumerie', contact_email: 'concierge@aroma.lk', contact_phone: '+94 77 123 4567', currency: 'LKR', free_delivery_threshold: 10000 }
        ]
      } else if (config.table === 'reviews' || config.table === 'testimonials') {
        preset = [
          { customer_name: 'Dr. Shanil Wickramasinghe', rating: 5, review_text: 'The longevity is unlike anything else available in Sri Lanka. 14 hours after application I was still receiving compliments.', is_approved: true },
          { customer_name: 'Kavindi Senaratne', rating: 5, review_text: 'Pure luxury from the presentation box to the drydown. The cinnamon is genuine and warm.', is_approved: true }
        ]
      } else {
        const sample = {}
        config.fields.forEach(f => {
          if (f.defaultValue !== undefined) sample[f.key] = f.defaultValue
          else if (f.type === 'number') sample[f.key] = 100
          else if (f.type === 'boolean') sample[f.key] = true
          else sample[f.key] = `Sample ${f.label}`
        })
        preset = [sample]
      }

      const { error } = await supabase.from(config.table).insert(preset)
      if (error) {
        setRows(preset.map((p, i) => ({ id: `demo-${i + 1}`, ...p, created_at: new Date().toISOString() })))
        showNotification('info', `Seeded demo rows locally (${error.message})`)
      } else {
        showNotification('success', `Successfully seeded demo records into ${config.table}!`)
        loadData()
      }
    } catch (err) {
      showNotification('error', `Seeding error: ${err.message}`)
    } finally {
      setRefreshing(false)
    }
  }

  // Export data as JSON file
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rows, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `${config.table}_export_${Date.now()}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    showNotification('success', `Exported ${rows.length} rows as JSON`)
  }

  // Filter rows by search query
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows
    const q = searchQuery.toLowerCase()
    return rows.filter(r => {
      return Object.values(r || {}).some(val => {
        if (val === null || val === undefined) return false
        if (typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(q)
        return String(val).toLowerCase().includes(q)
      })
    })
  }, [rows, searchQuery])

  // Get primary display columns for the table header
  const tableHeaders = useMemo(() => {
    const list = ['id']
    config.fields.slice(0, 6).forEach(f => {
      if (!list.includes(f.key)) list.push(f.key)
    })
    detectedColumns.slice(0, 3).forEach(c => {
      if (!list.includes(c)) list.push(c)
    })
    return list
  }, [config.fields, detectedColumns])

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans pb-24">
      {/* TOP NAVIGATION / BREADCRUMB */}
      <header className="border-b border-neutral-800/80 bg-[#0a0a0a]/90 backdrop-blur sticky top-0 z-30 px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 transition"
            >
              <Icons.ArrowLeft className="w-3.5 h-3.5" />
              <span>All 57 Tables</span>
            </Link>

            <span className="text-neutral-600">/</span>

            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-neutral-800 text-amber-400">
                <IconComponent className="w-4 h-4" />
              </span>
              <span className="font-semibold text-sm text-white tracking-wide">{config.name}</span>
              <span className="text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full">
                {config.table}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Switcher dropdown to navigate all 57 tables */}
            <div className="relative">
              <select
                aria-label="Switch Table"
                onChange={(e) => {
                  if (e.target.value) router.push(`/admin/dashboard/${e.target.value}`)
                }}
                value={config.slug}
                className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
              >
                <option disabled value="">Switch Table (57 Total)...</option>
                {TABLES.map(t => (
                  <option key={t.slug} value={t.slug}>
                    {t.name} ({t.table})
                  </option>
                ))}
              </select>
            </div>

            <Link
              href="/admin/dashboard/customizer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-amber-300 hover:text-white px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/30 hover:bg-amber-400/20 transition font-mono font-medium"
              title="Open No-Code Visual Theme Customizer"
            >
              <Icons.Sliders className="w-3.5 h-3.5" />
              <span>Theme Studio</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition"
            >
              <Icons.ExternalLink className="w-3.5 h-3.5" />
              <span>Live Store</span>
            </Link>
          </div>
        </div>
      </header>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-4">
          <div
            className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-sm ${
              notification.type === 'error'
                ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                : notification.type === 'info'
                ? 'bg-blue-950/40 border-blue-800 text-blue-200'
                : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'error' && <Icons.AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              {notification.type === 'info' && <Icons.Info className="w-5 h-5 text-blue-400 shrink-0" />}
              {notification.type === 'success' && <Icons.CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs opacity-60 hover:opacity-100 px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        {/* HERO SECTION / STATS */}
        <div className="bg-gradient-to-b from-[#111] to-[#0c0c0c] border border-neutral-800 rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                  {customTitle || config.name}
                </h1>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  {config.category}
                </span>
              </div>
              <p className="text-xs md:text-sm text-neutral-400 mt-1 max-w-2xl">
                {customDescription || config.description}
              </p>
            </div>

            <div className="flex items-center gap-2 self-stretch md:self-auto flex-wrap">
              <button
                onClick={() => {
                  setRefreshing(true)
                  loadData()
                }}
                disabled={refreshing || loading}
                className="px-3 py-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-xl text-xs font-medium text-neutral-300 flex items-center gap-1.5 transition"
                title="Refresh table from Supabase"
              >
                <Icons.RefreshCw className={`w-3.5 h-3.5 ${refreshing || loading ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>

              <button
                onClick={handleExportJson}
                disabled={rows.length === 0}
                className="px-3 py-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-xl text-xs font-medium text-neutral-300 flex items-center gap-1.5 transition disabled:opacity-40"
                title="Export rows as JSON"
              >
                <Icons.Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>

              <button
                onClick={handleSeedDemoData}
                disabled={refreshing || loading}
                className="px-3.5 py-2 bg-amber-400/10 border border-amber-400/30 hover:bg-amber-400/20 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                title="Seed Aroma sample records for this table"
              >
                <Icons.Sparkles className="w-3.5 h-3.5" />
                <span>Seed Demo</span>
              </button>

              <button
                onClick={handleAddNew}
                className="px-5 py-2 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-white/5 transition"
              >
                <Icons.Plus className="w-4 h-4" />
                <span>Add Record</span>
              </button>
            </div>
          </div>

          {/* TABLE META SUMMARY */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-neutral-800/60">
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">Total Rows</p>
              <p className="text-xl font-bold text-white mt-0.5">{rows.length}</p>
            </div>
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">Configured Fields</p>
              <p className="text-xl font-bold text-neutral-200 mt-0.5">{config.fields.length}</p>
            </div>
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">Detected Extra Cols</p>
              <p className="text-xl font-bold text-neutral-300 mt-0.5">{detectedColumns.length}</p>
            </div>
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">Table Status</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`w-2 h-2 rounded-full ${rows.length > 0 ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
                <span className="text-xs font-semibold text-neutral-300">
                  {rows.length > 0 ? 'Active Data' : 'Empty Table'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CREATE / EDIT FORM MODAL / DRAWER */}
        {formOpen && (
          <div className="bg-[#111] border border-amber-500/30 rounded-2xl p-6 mb-8 shadow-2xl relative">
            <div className="flex flex-wrap justify-between items-center gap-3 pb-4 mb-6 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                  {editingId ? <Icons.Edit3 className="w-4 h-4" /> : <Icons.PlusCircle className="w-4 h-4" />}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingId ? `Edit Record #${editingId}` : `Create New ${config.name} Record`}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Database target: <code className="text-amber-400 font-mono">{config.table}</code>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!rawJsonMode) {
                      setRawJsonText(JSON.stringify(form, null, 2))
                    } else {
                      try {
                        const parsed = JSON.parse(rawJsonText)
                        setForm(parsed)
                      } catch (err) {
                        showNotification('error', `Invalid JSON: ${err.message}`)
                        return
                      }
                    }
                    setRawJsonMode(!rawJsonMode)
                  }}
                  className="px-3 py-1.5 bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 rounded-lg text-xs font-mono text-neutral-300 flex items-center gap-1.5"
                >
                  <Icons.Code className="w-3.5 h-3.5" />
                  <span>{rawJsonMode ? 'Switch to Form' : 'Switch to Raw JSON'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormOpen(false)
                    setEditingId(null)
                  }}
                  className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700"
                >
                  <Icons.X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {rawJsonMode ? (
              /* RAW JSON EDITOR */
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-400 font-mono block mb-1">
                    Direct Record JSON (Payload will be validated and sent to Supabase):
                  </label>
                  <textarea
                    rows={12}
                    value={rawJsonText}
                    onChange={(e) => setRawJsonText(e.target.value)}
                    className="w-full bg-[#070707] border border-neutral-800 rounded-xl p-4 font-mono text-xs text-green-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-neutral-200 transition"
                  >
                    Save JSON to Supabase
                  </button>
                  <button
                    onClick={() => {
                      setFormOpen(false)
                      setEditingId(null)
                    }}
                    className="px-4 py-2.5 bg-neutral-900 text-neutral-300 text-xs rounded-xl hover:bg-neutral-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* STRUCTURED DYNAMIC FORM */
              <form onSubmit={handleSave} className="space-y-6">
                {/* PREDEFINED CONFIG FIELDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {config.fields.map((field) => (
                    <div
                      key={field.key}
                      className={field.type === 'textarea' || field.type === 'json' ? 'md:col-span-2' : ''}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-medium text-neutral-300">
                          {field.label}
                          {field.required && <span className="text-rose-400 ml-1">*</span>}
                        </label>
                        <span className="text-[10px] font-mono text-neutral-500">{field.key}</span>
                      </div>

                      {field.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={form[field.key] ?? ''}
                          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                          placeholder={field.placeholder || `Enter ${field.label}...`}
                          className="w-full bg-[#080808] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                        />
                      ) : field.type === 'boolean' ? (
                        <label className="flex items-center gap-3 bg-[#080808] border border-neutral-800 rounded-xl px-4 py-3 cursor-pointer hover:border-neutral-700">
                          <input
                            type="checkbox"
                            checked={!!form[field.key]}
                            onChange={(e) => setForm({ ...form, [field.key]: e.target.checked })}
                            className="w-4 h-4 accent-amber-400 rounded"
                          />
                          <span className="text-xs text-neutral-300">
                            {form[field.key] ? 'Active / Enabled (True)' : 'Inactive / Disabled (False)'}
                          </span>
                        </label>
                      ) : field.type === 'select' ? (
                        <select
                          value={form[field.key] ?? field.defaultValue ?? ''}
                          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                          className="w-full bg-[#080808] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                        >
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'color' ? (
                        <div className="flex items-center gap-3 bg-[#080808] border border-neutral-800 rounded-xl px-3.5 py-2">
                          <input
                            type="color"
                            value={form[field.key] || field.defaultValue || '#000000'}
                            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                            className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={form[field.key] ?? ''}
                            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                            className="w-full bg-transparent text-sm font-mono text-white focus:outline-none"
                            placeholder="#000000"
                          />
                        </div>
                      ) : field.type === 'image' ? (
                        <div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={form[field.key] ?? ''}
                              onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                              placeholder={field.placeholder || 'https://.../image.jpg'}
                              className="w-full bg-[#080808] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                            />
                          </div>
                          {form[field.key] && (
                            <div className="mt-2 flex items-center gap-2 bg-[#050505] p-2 rounded-lg border border-neutral-800">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={form[field.key]}
                                alt="Preview"
                                className="w-12 h-12 object-cover rounded bg-neutral-900 border border-neutral-800"
                                onError={(e) => { e.currentTarget.style.display = 'none' }}
                              />
                              <span className="text-[11px] text-neutral-400 truncate max-w-xs">{form[field.key]}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          value={form[field.key] ?? ''}
                          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                          placeholder={field.placeholder || `Enter ${field.label}...`}
                          required={field.required}
                          className="w-full bg-[#080808] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* DETECTED ADDITIONAL DB COLUMNS (Dynamically detected from existing rows) */}
                {detectedColumns.length > 0 && (
                  <div className="pt-4 border-t border-neutral-800/80">
                    <p className="text-xs font-semibold text-amber-400 mb-3 flex items-center gap-1.5">
                      <Icons.Database className="w-3.5 h-3.5" />
                      <span>Additional Columns Detected in Supabase:</span>
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {detectedColumns.map((col) => (
                        <div key={col}>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-mono text-neutral-300">{col}</label>
                            <span className="text-[10px] text-neutral-500 font-mono">auto-detected</span>
                          </div>
                          <input
                            type="text"
                            value={
                              typeof form[col] === 'object'
                                ? JSON.stringify(form[col])
                                : form[col] ?? ''
                            }
                            onChange={(e) => setForm({ ...form, [col]: e.target.value })}
                            placeholder={`Enter ${col} value...`}
                            className="w-full bg-[#080808] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* USER-ADDED CUSTOM FIELDS */}
                {customFields.length > 0 && (
                  <div className="pt-4 border-t border-neutral-800/80">
                    <p className="text-xs font-semibold text-neutral-300 mb-3">Custom Added Fields:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customFields.map((field) => (
                        <div key={field}>
                          <label className="text-xs font-mono text-neutral-400 block mb-1">{field}</label>
                          <input
                            type="text"
                            value={form[field] ?? ''}
                            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                            className="w-full bg-[#080808] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ON-THE-FLY CUSTOM FIELD CREATOR */}
                {showAddCustomField ? (
                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      placeholder="Column / Key Name (e.g. tag, rating)"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      className="bg-[#050505] border border-neutral-700 px-3 py-1.5 text-xs rounded-lg text-white font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Initial Value"
                      value={newFieldValue}
                      onChange={(e) => setNewFieldValue(e.target.value)}
                      className="bg-[#050505] border border-neutral-700 px-3 py-1.5 text-xs rounded-lg text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomField}
                      className="px-3 py-1.5 bg-amber-400 text-black text-xs font-bold rounded-lg hover:bg-amber-300"
                    >
                      Attach Field
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddCustomField(false)}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddCustomField(true)}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-medium"
                  >
                    <Icons.PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Add Custom Column / Field</span>
                  </button>
                )}

                {/* FORM ACTIONS */}
                <div className="pt-4 border-t border-neutral-800 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-neutral-200 transition shadow-md"
                  >
                    {editingId ? 'Update Record in Supabase' : 'Insert Record into Supabase'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormOpen(false)
                      setEditingId(null)
                    }}
                    className="px-4 py-2.5 bg-neutral-900 text-neutral-300 text-xs rounded-xl hover:bg-neutral-800"
                  >
                    Cancel
                  </button>

                  {editingId && (
                    <span className="text-xs text-neutral-500 font-mono ml-auto">
                      Updating Record ID: {editingId}
                    </span>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* SEARCH, FILTER & VIEW CONTROLS */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Icons.Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${rows.length} ${config.name.toLowerCase()} rows...`}
              className="w-full bg-[#111] border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                <Icons.X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Limit Selector */}
            <select
              aria-label="Row Limit"
              value={rowLimit}
              onChange={(e) => setRowLimit(Number(e.target.value))}
              className="bg-[#111] border border-neutral-800 text-xs text-neutral-300 rounded-xl px-2.5 py-2 focus:outline-none"
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-[#111] border border-neutral-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
                  viewMode === 'table' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                }`}
                title="Table View"
              >
                <Icons.Table className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
                  viewMode === 'cards' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                }`}
                title="Card Grid View"
              >
                <Icons.LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* DATA CONTAINER */}
        {loading ? (
          <div className="bg-[#111] border border-neutral-800 rounded-2xl p-16 text-center">
            <Icons.Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-white">Loading data from Supabase...</p>
            <p className="text-xs text-neutral-500 font-mono mt-1">Connecting to {config.table}</p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="bg-[#111] border border-neutral-800 rounded-2xl p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <IconComponent className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              {searchQuery ? 'No matching rows found' : `No records yet in "${config.table}"`}
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
              {searchQuery
                ? `No records matched your search query "${searchQuery}". Clear search or try another keyword.`
                : `This table currently has 0 rows. Click below to add the first record with full customization.`}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-neutral-800 text-white rounded-xl text-xs hover:bg-neutral-700 font-medium"
                >
                  Clear Search Filter
                </button>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleSeedDemoData}
                    disabled={refreshing || loading}
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-2"
                  >
                    <Icons.Sparkles className="w-4 h-4" />
                    <span>Seed Aroma Demo Records</span>
                  </button>

                  <button
                    onClick={handleAddNew}
                    className="px-5 py-2.5 bg-white text-black rounded-xl text-xs font-bold hover:bg-neutral-200 shadow-md"
                  >
                    + Add First Record Manually
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW */
          <div className="bg-[#111] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161616] text-neutral-400 font-mono border-b border-neutral-800">
                  <tr>
                    {tableHeaders.map((header) => (
                      <th key={header} className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                        {header}
                      </th>
                    ))}
                    <th className="py-3.5 px-4 text-right uppercase tracking-wider text-[10px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-sans">
                  {filteredRows.map((row, idx) => (
                    <tr
                      key={row.id || idx}
                      className="hover:bg-neutral-900/60 transition group"
                    >
                      {tableHeaders.map((header) => {
                        const val = row[header]
                        const isImage =
                          header.includes('image') ||
                          header.includes('avatar') ||
                          header.includes('logo') ||
                          header.includes('favicon') ||
                          (typeof val === 'string' && (val.endsWith('.jpg') || val.endsWith('.png') || val.endsWith('.webp')))

                        return (
                          <td key={header} className="py-3 px-4 max-w-[200px] truncate">
                            {isImage && val ? (
                              <div className="flex items-center gap-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={val}
                                  alt="preview"
                                  className="w-8 h-8 rounded-lg object-cover bg-neutral-800 border border-neutral-700 shrink-0"
                                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                                />
                                <span className="text-[11px] text-neutral-400 font-mono truncate">{String(val)}</span>
                              </div>
                            ) : typeof val === 'boolean' ? (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  val
                                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                                    : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                                }`}
                              >
                                {val ? 'TRUE' : 'FALSE'}
                              </span>
                            ) : typeof val === 'object' && val !== null ? (
                              <button
                                onClick={() => setActiveJsonModal(val)}
                                className="font-mono text-[10px] text-amber-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 hover:border-amber-400 truncate max-w-[140px]"
                              >
                                [JSON Object]
                              </button>
                            ) : header === 'price' || header === 'total' || header === 'amount' ? (
                              <span className="font-semibold text-emerald-400 font-mono">
                                LKR {Number(val || 0).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-neutral-300 text-xs">
                                {val !== null && val !== undefined ? String(val) : <span className="text-neutral-600 font-mono text-[10px]">null</span>}
                              </span>
                            )}
                          </td>
                        )
                      })}

                      {/* ROW ACTIONS */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                          <button
                            onClick={() => handleEdit(row)}
                            className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-medium flex items-center gap-1 transition"
                            title="Edit Record"
                          >
                            <Icons.Edit className="w-3 h-3 text-amber-400" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDuplicate(row)}
                            className="p-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition"
                            title="Duplicate Record"
                          >
                            <Icons.Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setActiveJsonModal(row)}
                            className="p-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition"
                            title="Inspect JSON"
                          >
                            <Icons.Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(row.id)}
                            className="p-1 rounded-lg bg-neutral-900 hover:bg-rose-950/60 hover:text-rose-400 text-neutral-500 transition"
                            title="Delete Record"
                          >
                            <Icons.Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#141414] border-t border-neutral-800 flex justify-between items-center text-xs text-neutral-400">
              <span>Showing {filteredRows.length} of {rows.length} total rows</span>
              <span className="font-mono text-[10px] text-neutral-500">Supabase Table: {config.table}</span>
            </div>
          </div>
        ) : (
          /* CARD GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRows.map((row, idx) => {
              const title = row.name || row.title || row.code || row.question || row.order_number || row.email || row.id || `Item #${idx + 1}`
              const desc = row.description || row.subtitle || row.answer || row.comment || row.message || ''
              const img = row.image_url || row.banner_url || row.cover_image || row.avatar_url || row.logo_url || null

              return (
                <div
                  key={row.id || idx}
                  className="bg-[#111] border border-neutral-800 hover:border-neutral-700 rounded-2xl p-5 flex flex-col justify-between transition group hover:shadow-xl hover:shadow-black/60"
                >
                  <div>
                    {img && (
                      <div className="w-full h-36 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 mb-3 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        {row.is_active !== undefined && (
                          <span
                            className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              row.is_active ? 'bg-emerald-900 text-emerald-300' : 'bg-neutral-900 text-neutral-400'
                            }`}
                          >
                            {row.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-sm text-white line-clamp-1">{title}</h4>
                      {row.price && (
                        <span className="font-mono font-bold text-xs text-emerald-400 shrink-0">
                          Rs. {Number(row.price).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {desc && (
                      <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">{desc}</p>
                    )}

                    <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-wrap gap-2 text-[10px] font-mono text-neutral-500">
                      {row.id && <span>ID: {String(row.id).slice(0, 8)}...</span>}
                      {row.stock !== undefined && <span className="text-neutral-300">Stock: {row.stock}</span>}
                      {row.status && <span className="text-amber-400 capitalize">{row.status}</span>}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleEdit(row)}
                      className="px-4 py-1.5 bg-white text-black font-bold text-xs rounded-lg hover:bg-neutral-200 transition"
                    >
                      Edit
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicate(row)}
                        className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400"
                        title="Duplicate"
                      >
                        <Icons.Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setActiveJsonModal(row)}
                        className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400"
                        title="Inspect JSON"
                      >
                        <Icons.Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="p-1.5 rounded-lg bg-neutral-900 hover:bg-rose-950 text-neutral-500 hover:text-rose-400"
                        title="Delete"
                      >
                        <Icons.Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* JSON INSPECTION MODAL */}
      {activeJsonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Icons.Code className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">Record JSON Inspection</h4>
              </div>
              <button
                onClick={() => setActiveJsonModal(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <Icons.X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <pre className="bg-[#050505] p-4 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(activeJsonModal, null, 2)}
              </pre>
            </div>
            <div className="p-4 border-t border-neutral-800 flex justify-between items-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(activeJsonModal, null, 2))
                  showNotification('success', 'JSON copied to clipboard!')
                }}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs rounded-lg text-neutral-200 flex items-center gap-1.5"
              >
                <Icons.Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </button>
              <button
                onClick={() => setActiveJsonModal(null)}
                className="px-4 py-1.5 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
