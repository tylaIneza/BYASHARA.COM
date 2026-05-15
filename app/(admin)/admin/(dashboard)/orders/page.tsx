"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MessageCircle, Trash2, ChevronDown, ChevronUp,
  ShoppingBag, TrendingUp, Clock, CheckCircle2, X, MapPin, Package,
} from "lucide-react";
import { useOrderStore, type OrderStatus } from "@/lib/order-store";
import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

const STATUS: Record<OrderStatus, { color: string; bg: string; label: string }> = {
  PENDING:    { color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/20",   label: "Pending" },
  CONFIRMED:  { color: "text-blue-400",    bg: "bg-blue-400/10 border-blue-400/20",     label: "Confirmed" },
  DISPATCHED: { color: "text-violet-400",  bg: "bg-violet-400/10 border-violet-400/20", label: "Dispatched" },
  DELIVERED:  { color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", label: "Delivered" },
  CANCELLED:  { color: "text-red-400",     bg: "bg-red-400/10 border-red-400/20",       label: "Cancelled" },
};

const ALL_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"];

export default function OrdersPage() {
  const { orders, updateStatus, deleteOrder, clearAll } = useOrderStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = orders.filter((o) => {
    if (search && !o.customer.toLowerCase().includes(search.toLowerCase()) && !o.id.toLowerCase().includes(search.toLowerCase()) && !o.location.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== "ALL" && o.status !== filter) return false;
    return true;
  });

  const totalRevenue = orders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === "PENDING").length;
  const delivered = orders.filter((o) => o.status === "DELIVERED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">WhatsApp Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} total orders</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/20 rounded-full px-3 py-1.5">
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Ordering Active
          </div>
          {orders.length > 0 && (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Confirm clear */}
      <AnimatePresence>
        {confirmClear && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-4 px-5 py-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl"
          >
            <p className="text-sm text-white">Delete all {orders.length} orders permanently?</p>
            <div className="flex items-center gap-2">
              <button onClick={() => { clearAll(); setConfirmClear(false); }} className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all">Delete all</button>
              <button onClick={() => setConfirmClear(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"><X className="h-4 w-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Orders",   value: orders.length.toString(),    icon: ShoppingBag,  color: "text-blue-400",    bg: "bg-blue-400/10" },
          { label: "Pending",        value: pending.toString(),           icon: Clock,        color: "text-amber-400",   bg: "bg-amber-400/10" },
          { label: "Delivered",      value: delivered.toString(),         icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { label: "Total Revenue",  value: formatCurrency(totalRevenue), icon: TrendingUp,   color: "text-[#FF6B00]",   bg: "bg-[#FF6B00]/10" },
        ].map((s) => (
          <div key={s.label} className="bg-[#111111] border border-white/10 rounded-2xl p-5">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${s.bg}`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-[#111111] border border-white/10 rounded-2xl text-center">
          <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <ShoppingBag className="h-7 w-7 text-gray-600" />
          </div>
          <p className="text-white font-semibold mb-1">No orders yet</p>
          <p className="text-sm text-gray-500 max-w-xs">Orders are recorded automatically when customers send a WhatsApp order from the cart.</p>
        </div>
      ) : (
        <>
          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order ID, customer or location..."
                className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF6B00]/30"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["ALL", ...ALL_STATUSES] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s as typeof filter)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filter === s ? "bg-[#FF6B00] text-white" : "bg-[#111111] border border-white/10 text-gray-400 hover:text-white"}`}
                >
                  {s === "ALL" ? "All" : STATUS[s as OrderStatus].label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders list */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm">No orders match your search.</div>
            ) : (
              <ul className="divide-y divide-white/5">
                <AnimatePresence initial={false}>
                  {filtered.map((order) => {
                    const sc = STATUS[order.status];
                    const isOpen = expanded === order.id;
                    return (
                      <motion.li key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {/* Row */}
                        <div
                          className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors flex-wrap"
                          onClick={() => setExpanded(isOpen ? null : order.id)}
                        >
                          {/* ID + time */}
                          <div className="min-w-[110px]">
                            <p className="text-xs font-mono text-[#FF6B00] font-bold">{order.id}</p>
                            <p className="text-[11px] text-gray-600 mt-0.5">{formatDistanceToNow(order.createdAt, { addSuffix: true })}</p>
                          </div>

                          {/* Customer */}
                          <div className="flex-1 min-w-[120px]">
                            <p className="text-sm font-semibold text-white">{order.customer}</p>
                            <span className="flex items-center gap-1 text-[11px] text-gray-500">
                              <MapPin className="h-3 w-3" /> {order.location}
                            </span>
                          </div>

                          {/* Items summary */}
                          <div className="hidden md:block flex-1 min-w-[140px]">
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">
                              {order.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
                            </p>
                            <p className="text-[11px] text-gray-600">{order.items.length} line item{order.items.length !== 1 ? "s" : ""}</p>
                          </div>

                          {/* Total */}
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-white">{formatCurrency(order.total)}</p>
                            {order.transportFee > 0 && (
                              <p className="text-[11px] text-gray-500">+{formatCurrency(order.transportFee)} delivery</p>
                            )}
                          </div>

                          {/* Status selector */}
                          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                            <select
                              value={order.status}
                              onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                              className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border bg-transparent cursor-pointer focus:outline-none ${sc.bg} ${sc.color}`}
                            >
                              {ALL_STATUSES.map((s) => (
                                <option key={s} value={s} className="bg-[#111111] text-white">{STATUS[s].label}</option>
                              ))}
                            </select>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <a
                              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "250788628417"}`}
                              target="_blank" rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-gray-600 hover:text-[#25D366] hover:bg-[#25D366]/10 transition-all"
                              title="Open WhatsApp"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>
                            <button
                              onClick={() => { if (confirm(`Delete order ${order.id}?`)) deleteOrder(order.id); }}
                              className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                              title="Delete order"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            {isOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                          </div>
                        </div>

                        {/* Expanded details */}
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 pt-1 border-t border-white/5">
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Order Details</p>
                                <div className="bg-[#0D0D0D] border border-white/5 rounded-xl p-4 space-y-2">
                                  <div className="flex items-center justify-between text-xs text-gray-500 border-b border-white/5 pb-2 mb-1">
                                    <span>Placed {format(order.createdAt, "dd MMM yyyy 'at' HH:mm")}</span>
                                    <span className="font-mono text-[#FF6B00]">{order.id}</span>
                                  </div>
                                  {order.items.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-2">
                                        <Package className="h-3.5 w-3.5 text-gray-600 shrink-0" />
                                        <span className="text-gray-300">{item.name}</span>
                                        <span className="text-gray-600">×{item.qty}</span>
                                        {item.isRetail && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">Retail</span>}
                                      </div>
                                      <span className="text-white font-medium">{formatCurrency(item.price * item.qty)}</span>
                                    </div>
                                  ))}
                                  <div className="border-t border-white/5 pt-2 mt-1 space-y-1">
                                    <div className="flex justify-between text-xs text-gray-500">
                                      <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
                                    </div>
                                    {order.transportFee > 0 && (
                                      <div className="flex justify-between text-xs text-gray-500">
                                        <span>Delivery fee</span><span>{formatCurrency(order.transportFee)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between text-sm font-bold text-white pt-1">
                                      <span>Total</span><span>{formatCurrency(order.total)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
