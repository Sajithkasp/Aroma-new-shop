'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { APP_CONFIG } from '@/lib/config'
import {
  getStoredOrders,
  savePlacedOrder,
  updateOrderStatus,
  deleteStoredOrder,
  PlacedOrder,
  ORDERS_SYNC_EVENT
} from '@/lib/siteConfigStore'
import {
  ShoppingBag,
  ArrowLeft,
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  AlertCircle,
  Trash2,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Sliders,
  DollarSign,
  Printer,
  ChevronDown
} from 'lucide-react'

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<PlacedOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<PlacedOrder | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Load orders from Supabase + LocalStorage fallback
  const loadOrders = async () => {
    setLoading(true)
    const local = getStoredOrders()

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        // Map Supabase rows to PlacedOrder format
        const remoteOrders: PlacedOrder[] = data.map((row: any) => ({
          id: String(row.id),
          order_number: row.order_number || `ARM-${row.id}`,
          customer_name: row.customer_name || 'Guest Client',
          customer_phone: row.customer_phone || '-',
          customer_email: row.customer_email || undefined,
          shipping_address: row.shipping_address || 'Colombo, Sri Lanka',
          district: row.district || 'Colombo',
          payment_method: row.payment_method || 'Cash on Delivery (COD)',
          payment_status: row.payment_status || 'pending',
          order_status: row.order_status || 'pending',
          subtotal: Number(row.subtotal || row.total_amount || 0),
          discount: Number(row.discount || 0),
          shipping_fee: Number(row.shipping_fee || 0),
          total_amount: Number(row.total_amount || 0),
          notes: row.notes || undefined,
          items: [],
          created_at: row.created_at || new Date().toISOString()
        }))

        // Merge without duplicates
        const map = new Map<string, PlacedOrder>()
        local.forEach((o) => map.set(o.order_number, o))
        remoteOrders.forEach((o) => {
          if (!map.has(o.order_number)) {
            map.set(o.order_number, o)
          }
        })
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setOrders(merged)
      } else {
        setOrders(local)
      }
    } catch {
      setOrders(local)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()

    const handleSync = () => {
      setOrders(getStoredOrders())
    }

    window.addEventListener(ORDERS_SYNC_EVENT, handleSync)
    return () => window.removeEventListener(ORDERS_SYNC_EVENT, handleSync)
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: PlacedOrder['order_status']) => {
    updateOrderStatus(orderId, newStatus)
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId || o.order_number === orderId ? { ...o, order_status: newStatus } : o))
    )

    try {
      await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .or(`id.eq.${orderId},order_number.eq.${orderId}`)
    } catch {
      // ignore
    }

    setToastMsg(`Order marked as ${newStatus.toUpperCase()}`)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleDelete = async (order: PlacedOrder) => {
    if (!window.confirm(`Delete order #${order.order_number} for ${order.customer_name}?`)) return

    deleteStoredOrder(order.id)
    setOrders((prev) => prev.filter((o) => o.id !== order.id && o.order_number !== order.order_number))

    try {
      await supabase.from('orders').delete().or(`id.eq.${order.id},order_number.eq.${order.order_number}`)
    } catch {
      // ignore
    }

    if (selectedOrder?.id === order.id) setSelectedOrder(null)
    setToastMsg(`Order #${order.order_number} deleted`)
    setTimeout(() => setToastMsg(null), 3000)
  }

  // Filtered orders
  const filtered = orders.filter((o) => {
    const matchesStatus = selectedStatus === 'all' || o.order_status === selectedStatus
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.toLowerCase().includes(q) ||
      (o.customer_email && o.customer_email.toLowerCase().includes(q)) ||
      o.shipping_address.toLowerCase().includes(q)

    return matchesStatus && matchesSearch
  })

  // Metrics
  const totalRevenue = orders
    .filter((o) => o.order_status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0)
  const pendingCount = orders.filter((o) => o.order_status === 'pending').length
  const processingCount = orders.filter((o) => o.order_status === 'processing').length
  const shippedCount = orders.filter((o) => o.order_status === 'shipped').length
  const deliveredCount = orders.filter((o) => o.order_status === 'delivered').length

  const getStatusBadge = (status: PlacedOrder['order_status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            PENDING
          </span>
        )
      case 'processing':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
            <Package className="w-3 h-3" />
            PROCESSING
          </span>
        )
      case 'shipped':
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
            <Truck className="w-3 h-3" />
            DISPATCHED / SHIPPED
          </span>
        )
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            DELIVERED
          </span>
        )
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            CANCELLED
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#070707] text-neutral-100 font-sans pb-20">
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
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <span>Client Orders & Fulfillment Hub</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[10px] font-mono font-bold">
                  LIVE MANAGEMENT
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Real-time tracking of luxury flacon orders, customer addresses, and express dispatch.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {toastMsg && (
              <span className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-mono animate-fade-in">
                {toastMsg}
              </span>
            )}
            <button
              onClick={loadOrders}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-mono transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <Link
              href="/admin/dashboard/customizer"
              className="px-3.5 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-mono font-semibold transition flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Customizer</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* STATS STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Total Revenue</p>
            <p className="text-xl font-mono font-bold text-amber-300 mt-1">LKR {totalRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">{orders.length} total orders recorded</p>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <p className="text-[10px] font-mono uppercase tracking-wider text-amber-400">Pending Orders</p>
            <p className="text-xl font-mono font-bold text-white mt-1">{pendingCount}</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">Awaiting atelier verification</p>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <p className="text-[10px] font-mono uppercase tracking-wider text-blue-400">Processing</p>
            <p className="text-xl font-mono font-bold text-white mt-1">{processingCount}</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">Flacons being hand-poured</p>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <p className="text-[10px] font-mono uppercase tracking-wider text-purple-400">In Transit</p>
            <p className="text-xl font-mono font-bold text-white mt-1">{shippedCount}</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">With express courier</p>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Delivered</p>
            <p className="text-xl font-mono font-bold text-white mt-1">{deliveredCount}</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">Successfully fulfilled</p>
          </div>
        </div>

        {/* SEARCH & STATUS TABS */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: `All Orders (${orders.length})` },
              { id: 'pending', label: `Pending (${pendingCount})` },
              { id: 'processing', label: `Processing (${processingCount})` },
              { id: 'shipped', label: `Shipped (${shippedCount})` },
              { id: 'delivered', label: `Delivered (${deliveredCount})` },
              { id: 'cancelled', label: 'Cancelled' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3.5 py-2 rounded-xl font-medium transition whitespace-nowrap ${
                  selectedStatus === tab.id
                    ? 'bg-amber-400 text-black font-bold shadow'
                    : 'bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, name, phone, address..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* ORDERS LIST */}
        {loading ? (
          <div className="py-20 text-center text-neutral-500 font-mono text-xs flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>Loading orders...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 rounded-3xl bg-neutral-900/30 border border-neutral-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 text-neutral-500 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No Orders Found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {searchQuery
                ? `No orders matching "${searchQuery}". Try searching for another customer or number.`
                : 'No orders match this status filter. New client orders placed from the website will appear here in real time.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const formattedPhone = order.customer_phone?.replace(/[^0-9]/g, '')
              const whatsappLink = formattedPhone ? `https://wa.me/${formattedPhone}` : null

              return (
                <div
                  key={order.id || order.order_number}
                  className="p-5 md:p-6 rounded-3xl bg-neutral-900/50 hover:bg-neutral-900/80 border border-neutral-800 transition shadow-lg space-y-4"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-sm font-bold text-amber-300">#{order.order_number}</span>
                      {getStatusBadge(order.order_status)}
                      <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-bold text-white">
                        LKR {order.total_amount?.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                        {order.payment_method}
                      </span>
                    </div>
                  </div>

                  {/* Customer & Delivery Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Customer */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-neutral-500 uppercase">Customer Information</p>
                      <p className="font-semibold text-white text-sm">{order.customer_name}</p>
                      <div className="flex items-center gap-2 text-neutral-400 pt-1">
                        <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-mono">{order.customer_phone}</span>
                        {whatsappLink && (
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] hover:bg-emerald-500/20 transition flex items-center gap-1"
                            title="Chat with client on WhatsApp"
                          >
                            <MessageSquare className="w-2.5 h-2.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                      {order.customer_email && (
                        <div className="flex items-center gap-2 text-neutral-400">
                          <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                          <span>{order.customer_email}</span>
                        </div>
                      )}
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-neutral-500 uppercase">Shipping Destination</p>
                      <div className="flex items-start gap-1.5 text-neutral-300">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p>{order.shipping_address}</p>
                          <p className="text-amber-400/90 font-mono text-[11px] mt-0.5 font-semibold">
                            District: {order.district}
                          </p>
                        </div>
                      </div>
                      {order.notes && (
                        <div className="mt-2 p-2 rounded-xl bg-neutral-950/80 border border-neutral-800 text-[11px] text-amber-200/90 italic">
                          &ldquo;{order.notes}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* Order Items Breakdown */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-mono text-neutral-500 uppercase">Items Ordered</p>
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-1.5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                              <div className="flex items-center gap-2 min-w-0">
                                {item.image_url && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.image_url}
                                    alt=""
                                    className="w-7 h-7 rounded-lg object-cover bg-neutral-800 shrink-0"
                                  />
                                )}
                                <div className="truncate">
                                  <p className="font-medium text-white truncate">{item.name}</p>
                                  <p className="text-[10px] font-mono text-neutral-500">
                                    {item.volume_ml}ml &bull; Qty: {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <span className="font-mono text-amber-300 shrink-0">
                                LKR {(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-neutral-500 italic text-[11px]">1x Bespoke Artisanal Flacon</p>
                      )}
                    </div>
                  </div>

                  {/* Actions Strip */}
                  <div className="pt-3 border-t border-neutral-800/60 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-neutral-400 font-mono mr-1">Update Status:</span>
                      <button
                        onClick={() => handleStatusChange(order.id, 'pending')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition ${
                          order.order_status === 'pending'
                            ? 'bg-amber-400 text-black font-bold'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, 'processing')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition ${
                          order.order_status === 'processing'
                            ? 'bg-blue-500 text-white font-bold'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        Processing
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, 'shipped')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition ${
                          order.order_status === 'shipped'
                            ? 'bg-purple-500 text-white font-bold'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        Shipped
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, 'delivered')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition ${
                          order.order_status === 'delivered'
                            ? 'bg-emerald-500 text-black font-bold'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        Delivered
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition ${
                          order.order_status === 'cancelled'
                            ? 'bg-rose-500 text-white font-bold'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono transition flex items-center gap-1"
                        title="Print Order Receipt"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print Receipt</span>
                      </button>
                      <button
                        onClick={() => handleDelete(order)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition"
                        title="Delete Order"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
