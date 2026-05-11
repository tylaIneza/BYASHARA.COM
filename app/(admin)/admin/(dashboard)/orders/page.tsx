"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MessageCircle, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const MOCK_ORDERS = Array.from({ length: 18 }, (_, i) => ({
  id: `BYA-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
  customer: ["Samuel K.", "Marie C.", "Patrick N.", "Aline M.", "Jean P.", "Claudine U.", "Bosco R.", "Esperance N."][i % 8],
  phone: "+250 78" + String(i).padStart(7, "0"),
  products: `${["iPhone 15 Pro", "Samsung TV", "HP Laptop", "JBL Speaker", "CCTV Kit", "TP-Link Router"][i % 6]} ×${(i % 5) + 1}`,
  amount: (300 + i * 180) * 10_000,
  province: ["Kigali", "Goma, DRC", "Musanze", "Huye", "Bukavu, DRC", "Eastern"][i % 6],
  status: ["PENDING", "CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"][i % 5] as "PENDING" | "CONFIRMED" | "DISPATCHED" | "DELIVERED" | "CANCELLED",
  time: `${i + 1}h ago`,
}));

const STATUS = {
  PENDING: { color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20", label: "Pending" },
  CONFIRMED: { color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20", label: "Confirmed" },
  DISPATCHED: { color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20", label: "Dispatched" },
  DELIVERED: { color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", label: "Delivered" },
  CANCELLED: { color: "text-red-400", bg: "bg-red-400/10 border-red-400/20", label: "Cancelled" },
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const filtered = MOCK_ORDERS.filter((o) => {
    if (search && !o.customer.toLowerCase().includes(search.toLowerCase()) && !o.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== "ALL" && o.status !== filter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">WhatsApp Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{MOCK_ORDERS.length} total orders</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/20 rounded-full px-3 py-1.5">
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Ordering Active
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or customer..."
            className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF6B00]/30"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["ALL", "PENDING", "CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filter === s ? "bg-[#FF6B00] text-white" : "bg-[#111111] border border-white/10 text-gray-400 hover:text-white"}`}
            >
              {s === "ALL" ? "All" : STATUS[s as keyof typeof STATUS]?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {["Order ID", "Customer", "Products", "Amount", "Province", "Status", "Time", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((o, i) => {
                const sc = STATUS[o.status];
                return (
                  <motion.tr
                    key={o.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/2 transition-colors"
                  >
                    <td className="px-5 py-4 text-xs font-mono text-[#FF6B00]">{o.id}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-white">{o.customer}</p>
                      <p className="text-[11px] text-gray-500">{o.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400 max-w-[160px] truncate">{o.products}</td>
                    <td className="px-5 py-4 text-sm font-bold text-white">{formatCurrency(o.amount)}</td>
                    <td className="px-5 py-4 text-xs text-gray-400">{o.province}</td>
                    <td className="px-5 py-4">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.color}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{o.time}</td>
                    <td className="px-5 py-4">
                      <a
                        href={`https://wa.me/250788628417`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#25D366] hover:bg-[#25D366]/10 transition-all inline-flex"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
