"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap, ArrowRight, MessageCircle, TrendingUp,
  Shield, Truck, Package, Star, ChevronRight,
} from "lucide-react";
import { ProductCard, type ProductCardData } from "@/components/store/ProductCard";
import { ProductSlider } from "@/components/store/ProductSlider";
import { useProductStore } from "@/lib/product-store";
import { useCategoryStore } from "@/lib/category-store";

const FEATURES = [
  { icon: Shield,       title: "Verified Vendors",    desc: "All suppliers go through strict verification", color: "text-blue-400" },
  { icon: Truck,        title: "Rwanda & DRC Delivery",desc: "All provinces + Goma & Bukavu",               color: "text-green-400" },
  { icon: MessageCircle,title: "WhatsApp First",       desc: "Order instantly — no account needed",          color: "text-[#25D366]" },
  { icon: Package,      title: "Bulk Wholesale",       desc: "Min. 1 unit — true wholesale pricing",         color: "text-[#FF6B00]" },
  { icon: Zap,          title: "Flash Sales",          desc: "Daily deals on the hottest electronics",       color: "text-amber-400" },
  { icon: TrendingUp,   title: "Bulk Pricing Tiers",   desc: "More you order, less you pay per unit",        color: "text-violet-400" },
];

export default function HomePage() {
  const productsRef = useRef<HTMLElement>(null);
  const { products, hydrated: prodHydrated } = useProductStore();
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
      {/* ── Hero Slider (replaces static hero) ── */}
      <ProductSlider />

      {/* Brand marquee */}
      <div className="py-3.5 border-b border-white/10 bg-[#111111] overflow-hidden">
        <div className="flex gap-10 marquee whitespace-nowrap">
          {["Samsung","Apple","Xiaomi","Huawei","Oppo","Infinix","Tecno","JBL","Sony","LG","HP","Dell","Lenovo","Canon","Hikvision",
            "Samsung","Apple","Xiaomi","Huawei","Oppo","Infinix","Tecno","JBL","Sony","LG","HP","Dell","Lenovo","Canon","Hikvision"].map((brand, i) => (
            <span key={i} className="text-gray-600 font-bold text-[10px] tracking-widest uppercase">{brand}</span>
          ))}
        </div>
      </div>

      {/* ── Featured products ── */}
      <section ref={productsRef} className="py-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-0.5">
              Featured <span className="text-gradient">Products</span>
            </h2>
            <p className="text-gray-400 text-sm">Top wholesale picks — min. 1 unit</p>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-[#FF6B00] hover:text-white text-sm font-semibold transition-colors">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {!prodHydrated || featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {prodHydrated
              ? featured.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))
              : Array.from({ length: 8 }).map((_, i) => (
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
            }
          </div>
        ) : null}

        <div className="text-center mt-8">
          <Link href="/products" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-sm">
            View All Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 border-t border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Shop by <span className="text-gradient">Category</span>
          </h2>
          <Link href="/products" className="hidden md:flex items-center gap-1 text-[#FF6B00] hover:text-white text-sm font-semibold transition-colors">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
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
                className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border border-white/10 hover:border-[#FF6B00]/40 transition-all group"
                style={{ background: cat.color + "12" }}
              >
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-[#FF6B00]/20 transition-colors text-lg sm:text-xl">
                  {cat.emoji}
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-gray-300 group-hover:text-white text-center leading-tight">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Why choose us ── */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 border-t border-white/10">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
            Why <span className="text-gradient">BYASHARA STORE</span>
          </h2>
          <p className="text-gray-400 text-sm">Built for African wholesale buyers</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
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

      {/* ── Trust badges strip ── */}
      <section className="border-t border-white/10 bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Star,   label: "4.9/5 Rating",      sub: "2,400+ buyers" },
            { icon: Truck,  label: "Fast Delivery",      sub: "All Rwanda + DRC" },
            { icon: Shield, label: "Verified Vendors",   sub: "320+ suppliers" },
          ].map((b) => (
            <div key={b.label} className="flex flex-row items-center gap-3 text-left">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center shrink-0">
                <b.icon className="h-4 w-4 text-[#FF6B00]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">{b.label}</p>
                <p className="text-[10px] sm:text-[11px] text-gray-500">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WhatsApp CTA ── */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-dark border border-white/10 rounded-3xl p-8 text-center"
        >
          <div className="h-14 w-14 rounded-full bg-[#25D366]/20 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-7 w-7 text-[#25D366]" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            Order in <span className="text-gradient">60 Seconds</span>
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto leading-relaxed">
            No account. No password. Browse, select quantity, click WhatsApp — your order is auto-generated and sent instantly.
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "250788628417"}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition-all hover:shadow-lg hover:shadow-green-500/20"
          >
            <MessageCircle className="h-5 w-5" /> Start Ordering on WhatsApp
          </a>
        </motion.div>
      </section>
    </div>
  );
}
