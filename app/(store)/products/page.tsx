"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Grid3X3, List, ChevronDown, ShoppingBag, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductCard, type ProductCardData } from "@/components/store/ProductCard";
import { useCartStore } from "@/lib/cart-store";
import { useProductStore } from "@/lib/product-store";
import { useCategoryStore } from "@/lib/category-store";
import { formatCurrency } from "@/lib/utils";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Best Selling", value: "popular" },
  { label: "Top Rated", value: "rating" },
];

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("newest");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { itemCount, total } = useCartStore();
  const { products: storeProducts, hydrated: prodHydrated } = useProductStore();
  const { categories, hydrated: catHydrated } = useCategoryStore();
  useEffect(() => setMounted(true), []);

  // Map store products to ProductCardData shape; only show ACTIVE products
  const allProducts: ProductCardData[] = storeProducts
    .filter((p) => p.status === "ACTIVE")
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      brand: p.brand,
      moq: p.moq,
      stock: p.stock,
      imageUrl: p.imageUrl,
      price: p.price,
      salePrice: p.salePrice,
      currency: p.currency,
      vendorName: p.vendor,
      rating: p.rating,
      soldCount: p.soldCount,
      featured: p.featured,
    }));

  const filtered = allProducts.filter((p) => {
    if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (category !== "All") {
      const sp = storeProducts.find((x) => x.id === p.id);
      if (sp && sp.category !== category) return false;
    }
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
        <button
          onClick={() => setCategory("All")}
          className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            category === "All"
              ? "bg-[#FF6B00] text-white"
              : "bg-[#111111] border border-white/10 text-gray-400 hover:text-white hover:border-white/20"
          }`}
        >
          All
        </button>
        {catHydrated && categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.name)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              category === cat.name
                ? "bg-[#FF6B00] text-white"
                : "bg-[#111111] border border-white/10 text-gray-400 hover:text-white hover:border-white/20"
            }`}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className={`grid gap-4 ${view === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2"}`}>
        {!prodHydrated
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-[#111111] border border-white/10 overflow-hidden">
                <div className="skeleton h-44" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-3 w-16 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-6 w-24 rounded" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="skeleton h-9 rounded-xl" />
                    <div className="skeleton h-9 rounded-xl" />
                  </div>
                </div>
              </div>
            ))
          : filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))
        }
      </div>

      {/* Load more */}
      <div className="text-center mt-12 mb-24">
        <button className="btn-primary px-10 py-3 text-sm">
          Load More Products
        </button>
      </div>

      {/* Sticky WhatsApp cart bar */}
      <AnimatePresence>
        {mounted && itemCount() > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
          >
            <div className="flex items-center justify-between gap-3 bg-[#111111] border border-[#FF6B00]/40 rounded-2xl px-5 py-3.5 shadow-2xl shadow-black/60 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag className="h-6 w-6 text-[#FF6B00]" />
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6B00] text-[9px] font-bold text-white">
                    {itemCount() > 99 ? "99+" : itemCount()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 leading-none">
                    {itemCount()} {itemCount() === 1 ? "item" : "items"} in cart
                  </p>
                  <p className="text-sm font-bold text-white leading-tight">{formatCurrency(total())}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/cart"
                  className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Order via WhatsApp
                </Link>
                <Link
                  href="/cart"
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
