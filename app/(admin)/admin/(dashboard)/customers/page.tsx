"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Trash2, ChevronDown, ChevronUp,
  MapPin, ShoppingBag, TrendingUp, Package, X,
} from "lucide-react";
import { useCustomerStore, type Customer } from "@/lib/customer-store";
import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

const SORT_OPTIONS = [
  { label: "Latest order", value: "latest" },
  { label: "Most orders", value: "orders" },
  { label: "Highest spend", value: "spend" },
  { label: "Name A–Z", value: "name" },
];

function sortCustomers(customers: Customer[], sort: string) {
  return [...customers].sort((a, b) => {
    if (sort === "orders") return b.orderCount - a.orderCount;
    if (sort === "spend") return b.totalSpent - a.totalSpent;
    if (sort === "name") return a.name.localeCompare(b.name);
    return b.lastOrderAt - a.lastOrderAt;
  });
}

export default function CustomersPage() {
  const { customers, deleteCustomer, clearAll } = useCustomerStore();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = sortCustomers(
    customers.filter(
      (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase())
    ),
    sort
  );

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const totalOrders = customers.reduce((s, c) => s + c.orderCount, 0);
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const retailCustomers = customers.filter((c) => c.orders.some((o) => o.isRetail)).length;

  const toggle = (id: string) => setExpanded((e) => (e === id ? null : id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Customers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{customers.length} guest buyers collected from WhatsApp orders</p>
        </div>
        {customers.length > 0 && (
          <button
            onClick={() => setConfirmClear(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 transition-all"
          >
            <Trash2 className="h-4 w-4" /> Clear all
          </button>
        )}
      </div>

      {/* Confirm clear */}
      <AnimatePresence>
        {confirmClear && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-4 px-5 py-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl"
          >
            <p className="text-sm text-white">Delete all {customers.length} customer records?</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { clearAll(); setConfirmClear(false); }}
                className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all"
              >
                Delete all
              </button>
              <button onClick={() => setConfirmClear(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: customers.length.toString(), icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Total Orders", value: totalOrders.toString(), icon: ShoppingBag, color: "text-green-400", bg: "bg-green-400/10" },
          { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-[#FF6B00]", bg: "bg-[#FF6B00]/10" },
          { label: "Avg. Order Value", value: formatCurrency(avgOrder), icon: Package, color: "text-violet-400", bg: "bg-violet-400/10" },
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
      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-[#111111] border border-white/10 rounded-2xl text-center">
          <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Users className="h-7 w-7 text-gray-600" />
          </div>
          <p className="text-white font-semibold mb-1">No customers yet</p>
          <p className="text-sm text-gray-500 max-w-xs">
            Customer profiles are created automatically when a buyer sends a WhatsApp order from the cart.
          </p>
        </div>
      ) : (
        <>
          {/* Search + sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or location..."
                className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF6B00]/30"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-[#111111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#FF6B00]/30 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Customer list */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm">No customers match your search.</div>
            ) : (
              <ul className="divide-y divide-white/5">
                <AnimatePresence initial={false}>
                  {filtered.map((customer) => (
                    <motion.li
                      key={customer.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Row */}
                      <div
                        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                        onClick={() => toggle(customer.id)}
                      >
                        {/* Avatar */}
                        <div className="h-10 w-10 rounded-xl gradient-orange flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {customer.name[0]?.toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-white">{customer.name}</p>
                            {customer.orders.some((o) => o.isRetail) && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 font-semibold">Retail</span>
                            )}
                            {customer.orders.every((o) => !o.isRetail) && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400 border border-blue-400/20 font-semibold">Wholesale</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1 text-[11px] text-gray-500">
                              <MapPin className="h-3 w-3" /> {customer.location}
                            </span>
                            <span className="text-[11px] text-gray-600">
                              Last order {formatDistanceToNow(customer.lastOrderAt, { addSuffix: true })}
                            </span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="hidden sm:flex items-center gap-6 shrink-0">
                          <div className="text-right">
                            <p className="text-sm font-bold text-white">{customer.orderCount}</p>
                            <p className="text-[11px] text-gray-500">orders</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-[#FF6B00]">{formatCurrency(customer.totalSpent)}</p>
                            <p className="text-[11px] text-gray-500">total spent</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete customer "${customer.name}" and all their order history?`)) {
                                deleteCustomer(customer.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          {expanded === customer.id
                            ? <ChevronUp className="h-4 w-4 text-gray-500" />
                            : <ChevronDown className="h-4 w-4 text-gray-500" />
                          }
                        </div>
                      </div>

                      {/* Expanded order history */}
                      <AnimatePresence>
                        {expanded === customer.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-4 pt-1 border-t border-white/5 space-y-3">
                              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Order History</p>
                              {customer.orders.map((order) => (
                                <div key={order.id} className="bg-[#0D0D0D] border border-white/5 rounded-xl p-4">
                                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                        order.isRetail
                                          ? "bg-amber-400/10 text-amber-400 border-amber-400/20"
                                          : "bg-blue-400/10 text-blue-400 border-blue-400/20"
                                      }`}>
                                        {order.isRetail ? "Retail" : "Wholesale"}
                                      </span>
                                      <span className="flex items-center gap-1 text-[11px] text-gray-500">
                                        <MapPin className="h-3 w-3" /> {order.location}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm font-bold text-[#FF6B00]">{formatCurrency(order.total)}</span>
                                      <span className="text-[11px] text-gray-600">{format(order.createdAt, "dd MMM yyyy, HH:mm")}</span>
                                    </div>
                                  </div>
                                  <ul className="space-y-1">
                                    {order.items.map((item, i) => (
                                      <li key={i} className="flex items-center justify-between text-xs text-gray-400">
                                        <span>{item.name} × {item.qty}</span>
                                        <span className="font-medium text-gray-300">{formatCurrency(item.price * item.qty)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>

          <p className="text-center text-xs text-gray-600">
            {retailCustomers > 0 && `${retailCustomers} retail · `}{customers.length - retailCustomers > 0 && `${customers.length - retailCustomers} wholesale`} · Sorted by {SORT_OPTIONS.find(o => o.value === sort)?.label.toLowerCase()}
          </p>
        </>
      )}
    </div>
  );
}
