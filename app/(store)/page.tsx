"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap, ArrowRight, MessageCircle, TrendingUp,
  Shield, Truck, Package, Star,
  ChevronRight,
} from "lucide-react";
import { ProductCard, type ProductCardData } from "@/components/store/ProductCard";
import { useProductStore } from "@/lib/product-store";
import { useCurrencyStore } from "@/lib/currency-store";
import { useCategoryStore } from "@/lib/category-store";

const FEATURES = [
  { icon: Shield, title: "Verified Vendors", desc: "All suppliers go through strict verification", color: "text-blue-400" },
  { icon: Truck, title: "Rwanda & DRC Delivery", desc: "All provinces + Goma & Bukavu", color: "text-green-400" },
  { icon: MessageCircle, title: "WhatsApp First", desc: "Order instantly — no account needed", color: "text-[#25D366]" },
  { icon: Package, title: "Bulk Wholesale", desc: "Min. 1 unit — true wholesale pricing", color: "text-[#FF6B00]" },
  { icon: Zap, title: "Flash Sales", desc: "Daily deals on the hottest electronics", color: "text-amber-400" },
  { icon: TrendingUp, title: "Bulk Pricing Tiers", desc: "More you order, less you pay per unit", color: "text-violet-400" },
];

export default function HomePage() {
  const productsRef = useRef<HTMLElement>(null);
  const { products } = useProductStore();
  const { isOutsideRwanda } = useCurrencyStore();
  const { categories, hydrated: catHydrated } = useCategoryStore();

  const featured: ProductCardData[] = products
    .filter((p) => p.status === "ACTIVE")
    .slice(0, 8)
    .map((p) => ({
      id: p.id, name: p.name, slug: p.slug, sku: p.sku, brand: p.brand,
      moq: p.moq, stock: p.stock, imageUrl: p.imageUrl,
      price: p.price, salePrice: p.salePrice, currency: p.currency,
      vendorName: p.vendor, rating: p.rating, soldCount: p.soldCount, featured: p.featured,
    }));

  return (
    <div>
      {/* Compact Hero */}
      <section className="relative py-10 sm:py-14 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,107,0,0.12)_0%,_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,107,0,0.06)_0%,_transparent_55%)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] text-xs font-semibold mb-4"
              >
                <Zap className="h-3.5 w-3.5" />
                #1 Electronics Wholesale in Rwanda & DRC
                {isOutsideRwanda && (
                  <span className="ml-1 px-1.5 py-0.5 bg-[#FF6B00]/20 rounded text-[10px]">Prices in USD</span>
                )}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-white mb-3"
              >
                Wholesale <span className="text-gradient">Electronics</span>{" "}
                for Africa&apos;s Future
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-gray-400 text-sm sm:text-base mb-5 leading-relaxed max-w-xl"
              >
                Order electronics in Rwanda and Eastern DRC — smartphones, laptops, accessories and more.{" "}
                <span className="text-white font-medium">No account needed.</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-3"
              >
                <button
                  onClick={() => productsRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="btn-primary flex items-center gap-2 px-6 py-3 text-sm"
                >
                  Browse Products <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "250788628417"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold text-sm transition-all"
                >
                  <MessageCircle className="h-4 w-4" /> Order via WhatsApp
                </a>
              </motion.div>
            </div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden md:flex flex-col gap-3 shrink-0"
            >
              {[
                { icon: Star, label: "4.9/5 Rating", sub: "From 2,400+ buyers" },
                { icon: Truck, label: "Fast Delivery", sub: "All Rwanda + DRC" },
                { icon: Shield, label: "Verified Vendors", sub: "320+ suppliers" },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-3 glass-dark border border-white/10 rounded-2xl px-4 py-3">
                  <div className="h-9 w-9 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center shrink-0">
                    <b.icon className="h-4 w-4 text-[#FF6B00]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{b.label}</p>
                    <p className="text-[11px] text-gray-500">{b.sub}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brand marquee */}
      <div className="py-4 border-b border-white/10 bg-[#111111] overflow-hidden">
        <div className="flex gap-10 marquee whitespace-nowrap">
          {["Samsung", "Apple", "Xiaomi", "Huawei", "Oppo", "Infinix", "Tecno", "JBL", "Sony", "LG", "HP", "Dell", "Lenovo", "Canon", "Hikvision",
            "Samsung", "Apple", "Xiaomi", "Huawei", "Oppo", "Infinix", "Tecno", "JBL", "Sony", "LG", "HP", "Dell", "Lenovo", "Canon", "Hikvision"].map((brand, i) => (
            <span key={i} className="text-gray-600 font-bold text-xs tracking-widest uppercase">{brand}</span>
          ))}
        </div>
      </div>

      {/* ── PRODUCTS — first thing users see after hero ── */}
      <section ref={productsRef} className="py-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white mb-0.5">
              Featured <span className="text-gradient">Products</span>
            </h2>
            <p className="text-gray-400 text-sm">Top wholesale picks — min. 1 unit</p>
          </div>
          <Link href="/products" className="flex items-center gap-1.5 text-[#FF6B00] hover:text-white text-sm font-semibold transition-colors">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-[#111111] border border-white/10 overflow-hidden">
                <div className="skeleton h-48" />
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
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/products" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-sm">
            View All Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 border-t border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white">Shop by <span className="text-gradient">Category</span></h2>
          <Link href="/products" className="hidden md:flex items-center gap-1.5 text-[#FF6B00] hover:text-white text-sm font-semibold transition-colors">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {catHydrated && categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.05 }}
            >
              <Link
                href={`/products?cat=${encodeURIComponent(cat.name)}`}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/10 hover:border-[#FF6B00]/40 transition-all group"
                style={{ background: cat.color + "12" }}
              >
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-[#FF6B00]/20 transition-colors text-xl">
                  {cat.emoji}
                </div>
                <span className="text-[11px] font-semibold text-gray-300 group-hover:text-white text-center">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 border-t border-white/10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white mb-2">Why <span className="text-gradient">BOUTIQUE BYASHARA</span></h2>
          <p className="text-gray-400 text-sm">Built for African wholesale buyers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-2xl border border-white/10 bg-white/2 hover:border-white/20 transition-all group"
            >
              <div className={`h-10 w-10 rounded-xl bg-white/5 group-hover:bg-white/10 flex items-center justify-center mb-3 transition-colors ${f.color}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{f.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-dark border border-white/10 rounded-3xl p-8 text-center"
        >
          <div className="h-16 w-16 rounded-full bg-[#25D366]/20 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-[#25D366]" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Order in <span className="text-gradient">60 Seconds</span></h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto leading-relaxed">
            No account. No password. Browse, select quantity, click WhatsApp — your order is auto-generated and sent instantly.
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "250788628417"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition-all hover:shadow-lg hover:shadow-green-500/20"
          >
            <MessageCircle className="h-5 w-5" /> Start Ordering on WhatsApp
          </a>
        </motion.div>
      </section>
    </div>
  );
}
