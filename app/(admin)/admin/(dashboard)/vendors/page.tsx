"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, CheckCircle2, Clock, XCircle, Store, Eye, MoreHorizontal } from "lucide-react";

const MOCK_VENDORS = Array.from({ length: 12 }, (_, i) => ({
  id: `v-${i}`,
  name: ["TechRwanda Ltd", "KigaliElec", "Digital Hub RW", "AfriTech Store", "MoboShop", "Goma Electronics", "EastDRC Tech", "Bukavu Elec"][i % 8],
  email: ["info@techRwanda.rw", "contact@kigalielec.rw", "sales@digitalhub.rw", "hello@afritech.rw"][i % 4],
  phone: "+250 78" + String(i).padStart(7, "0"),
  province: ["Kigali", "Eastern", "Goma DRC", "Bukavu DRC", "Northern", "Western"][i % 6],
  products: 10 + i * 7,
  revenue: (120 + i * 45) * 1_000_000,
  status: ["ACTIVE", "ACTIVE", "PENDING", "SUSPENDED"][i % 4] as "ACTIVE" | "PENDING" | "SUSPENDED",
  joinedAt: `2024-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, "0")}`,
}));

const STATUS = {
  ACTIVE: { label: "Active", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  PENDING: { label: "Pending", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  SUSPENDED: { label: "Suspended", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
};

export default function VendorsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const filtered = MOCK_VENDORS.filter((v) => {
    if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== "ALL" && v.status !== filter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Vendors</h1>
          <p className="text-sm text-gray-500 mt-0.5">{MOCK_VENDORS.length} registered vendors</p>
        </div>
        <button className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
          <Plus className="h-4 w-4" /> Add Vendor
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors..."
            className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF6B00]/30"
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "ACTIVE", "PENDING", "SUSPENDED"].map((s) => (
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
                {["Vendor", "Province", "Products", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((v, i) => {
                const sc = STATUS[v.status];
                return (
                  <motion.tr
                    key={v.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/2 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl gradient-orange flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {v.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-[#FF6B00] transition-colors">{v.name}</p>
                          <p className="text-[11px] text-gray-500">{v.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">{v.province}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-white">{v.products}</td>
                    <td className="px-5 py-4">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.color}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{v.joinedAt}</td>
                    <td className="px-5 py-4">
                      <button className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
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
