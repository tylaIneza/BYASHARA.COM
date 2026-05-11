"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus, Search, Filter, MoreHorizontal, Edit, Trash2,
  Eye, Package, CheckCircle2, Clock, XCircle, Star, Upload,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

const MOCK_PRODUCTS = Array.from({ length: 20 }, (_, i) => ({
  id: `prod-${i}`,
  name: ["Samsung Galaxy S24 Ultra", "iPhone 15 Pro Max", "HP EliteBook 840", "JBL Charge 5", "Samsung 65\" QLED", "Hikvision 4MP Camera", "TP-Link Deco X68"][i % 7],
  sku: `SKU-${String(i + 1).padStart(4, "0")}`,
  brand: ["Samsung", "Apple", "HP", "JBL", "LG", "Hikvision", "TP-Link"][i % 7],
  category: ["Smartphones", "Smartphones", "Laptops", "Audio", "TVs", "CCTV", "Networking"][i % 7],
  price: [890000, 1200000, 980000, 180000, 750000, 150000, 280000][i % 7],
  stock: i % 5 === 0 ? 0 : 50 + i * 7,
  status: ["ACTIVE", "ACTIVE", "PENDING", "DRAFT", "ACTIVE", "REJECTED"][i % 6] as "ACTIVE" | "PENDING" | "DRAFT" | "REJECTED",
  vendor: ["TechRwanda Ltd", "KigaliElec", "Digital Hub"][i % 3],
  featured: i % 4 === 0,
  moq: [1, 5, 10, 2][i % 4],
  soldCount: i * 23,
}));

const STATUS_CONFIG = {
  ACTIVE: { label: "Active", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  PENDING: { label: "Pending", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  DRAFT: { label: "Draft", color: "text-gray-400", bg: "bg-gray-400/10 border-gray-400/20" },
  REJECTED: { label: "Rejected", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
};

export default function AdminProductsPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = MOCK_PRODUCTS.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    return true;
  });

  const toggleSelect = (id: string) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{MOCK_PRODUCTS.length} total products</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all">
            <Upload className="h-4 w-4" /> Import CSV
          </button>
          <Link
            href="/admin/products/new"
            className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
          >
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, SKU, brand..."
            className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF6B00]/30"
          />
        </div>
        <div className="flex items-center gap-2">
          {["ALL", "ACTIVE", "PENDING", "DRAFT", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                statusFilter === s
                  ? "bg-[#FF6B00] text-white"
                  : "bg-[#111111] border border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              {s === "ALL" ? "All" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 bg-[#FF6B00]/10 border border-[#FF6B00]/20 rounded-xl"
        >
          <span className="text-sm text-[#FF6B00] font-semibold">{selected.length} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <button className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium">Approve All</button>
            <button className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium">Delete All</button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3.5">
                  <input
                    type="checkbox"
                    onChange={(e) => setSelected(e.target.checked ? MOCK_PRODUCTS.map((p) => p.id) : [])}
                    className="rounded accent-[#FF6B00]"
                  />
                </th>
                <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Product</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Price</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest hidden lg:table-cell">Stock</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest hidden lg:table-cell">Vendor</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((product, i) => {
                const sc = STATUS_CONFIG[product.status];
                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-white/2 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="rounded accent-[#FF6B00]"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#1A1A1A] border border-white/10 flex items-center justify-center shrink-0">
                          <Package className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-[#FF6B00] transition-colors">{product.name}</p>
                          <p className="text-[11px] text-gray-500">{product.sku} · MOQ: {product.moq}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-full">{product.category}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-bold text-white">{formatCurrency(product.price)}</span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className={`text-sm font-medium ${product.stock === 0 ? "text-red-400" : product.stock < 20 ? "text-amber-400" : "text-gray-300"}`}>
                        {product.stock === 0 ? "Out of stock" : `${product.stock} units`}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-xs text-gray-400">{product.vendor}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.color}`}>
                          {sc.label}
                        </span>
                        {product.featured && (
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <button className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <Link href={`/admin/products/${product.id}/edit`} className="p-1.5 rounded-lg text-gray-500 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-all">
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                        <button className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
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
