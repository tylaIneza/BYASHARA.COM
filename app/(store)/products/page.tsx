"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Grid3X3, List, ChevronDown } from "lucide-react";
import { ProductCard, type ProductCardData } from "@/components/store/ProductCard";

const MOCK_PRODUCTS: ProductCardData[] = Array.from({ length: 24 }, (_, i) => ({
  id: `product-${i}`,
  name: [
    "Samsung Galaxy S24 Ultra 512GB", "Apple iPhone 15 Pro Max", "Xiaomi 14 Pro 256GB",
    "HP EliteBook 840 G10 i7", "Dell XPS 15 Intel Core Ultra", "Lenovo ThinkPad X1 Carbon",
    "Sony WH-1000XM5 Headphones", "JBL Charge 5 Bluetooth Speaker", "Apple AirPods Pro 2nd Gen",
    "Samsung 65\" QLED 4K TV", "LG 55\" OLED Smart TV", "TCL 75\" 4K Android TV",
    "CCTV 8CH 2MP POE Kit", "Hikvision 4MP IP Camera", "Dahua NVR 16CH Kit",
    "TP-Link Deco Mesh WiFi 6", "Cisco RV340 Router", "Ubiquiti UniFi 6 Pro AP",
    "Anker 65W GaN Charger", "Xiaomi 33W Power Bank 20000mAh", "Belkin 15W Wireless Charger",
    "Samsung Galaxy Watch 6", "Garmin Fenix 7", "Apple Watch Series 9",
  ][i % 24],
  slug: `product-${i}-slug`,
  sku: `SKU-${String(i + 1).padStart(4, "0")}`,
  brand: ["Samsung", "Apple", "Xiaomi", "HP", "Dell", "JBL", "Sony", "LG", "TP-Link", "Anker"][i % 10],
  moq: [1, 2, 5, 10, 20][i % 5],
  stock: i % 7 === 0 ? 0 : i % 5 === 0 ? 5 : 100 + i,
  imageUrl: undefined,
  price: [450000, 890000, 650000, 1200000, 1500000, 280000, 350000, 180000, 95000, 750000][i % 10],
  salePrice: i % 4 === 0 ? [400000, 750000, 580000][i % 3] : undefined,
  currency: "RWF",
  vendorName: ["TechRwanda Ltd", "KigaliElec", "Digital Hub", "AfriTech"][i % 4],
  rating: 3.5 + (i % 15) * 0.1,
  soldCount: 50 + i * 12,
  featured: i % 6 === 0,
}));

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Best Selling", value: "popular" },
  { label: "Top Rated", value: "rating" },
];

const CATEGORIES_FILTER = [
  "All", "Smartphones", "Laptops", "Audio", "TVs", "CCTV",
  "Networking", "Accessories", "Gaming", "Solar", "Smart Home",
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("newest");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = MOCK_PRODUCTS.filter((p) => {
    if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">
          All <span className="text-gradient">Electronics</span>
        </h1>
        <p className="text-gray-400 text-sm">{filtered.length} products available for wholesale</p>
      </div>

      {/* Search + controls */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search electronics..."
            className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF6B00]/50"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-[#111111] border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 pr-8 focus:outline-none focus:border-[#FF6B00]/50 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
          <div className="flex items-center border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={`p-3 transition-colors ${view === "grid" ? "bg-[#FF6B00] text-white" : "bg-[#111111] text-gray-400 hover:text-white"}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-3 transition-colors ${view === "list" ? "bg-[#FF6B00] text-white" : "bg-[#111111] text-gray-400 hover:text-white"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
        {CATEGORIES_FILTER.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              category === cat
                ? "bg-[#FF6B00] text-white"
                : "bg-[#111111] border border-white/10 text-gray-400 hover:text-white hover:border-white/20"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className={`grid gap-4 ${view === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2"}`}>
        {filtered.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>

      {/* Load more */}
      <div className="text-center mt-12">
        <button className="btn-primary px-10 py-3 text-sm">
          Load More Products
        </button>
      </div>
    </div>
  );
}
