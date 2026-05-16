"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, MessageCircle, Star, Package, Zap, Flame } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import { useCurrencyStore } from "@/lib/currency-store";
import { useTrendingStore } from "@/lib/trending-store";
import { trackView, trackEngagement } from "@/lib/analytics";
import toast from "react-hot-toast";

function useFormatPrice() {
  const { isOutsideRwanda, rwfPerUsd } = useCurrencyStore();
  return (amount: number, currency = "RWF") => {
    if (isOutsideRwanda && currency === "RWF") {
      return formatCurrency(Math.round(amount / rwfPerUsd), "USD");
    }
    return formatCurrency(amount, currency);
  };
}

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand?: string | null;
  moq: number;
  stock: number;
  imageUrl?: string;
  price: number;
  salePrice?: number;
  currency?: string;
  vendorName?: string;
  rating?: number;
  soldCount?: number;
  featured?: boolean;
}

export function ProductCard({ product, index = 0 }: { product: ProductCardData; index?: number }) {
  const [qty, setQty] = useState(product.moq);
  const [imageError, setImageError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const fmt = useFormatPrice();
  const { trendingIds, ranks, fetch: fetchTrending } = useTrendingStore();

  const cardRef = useRef<HTMLDivElement>(null);
  const viewTracked = useRef(false);
  const viewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bootstrap trending data once per store mount
  useEffect(() => { fetchTrending(); }, [fetchTrending]);

  // Intersection Observer: fire view after 2s of continuous visibility
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !viewTracked.current) {
          viewTimer.current = setTimeout(() => {
            if (!viewTracked.current) {
              viewTracked.current = true;
              trackView(product.id, product.name);
            }
          }, 2000);
        } else {
          if (viewTimer.current) clearTimeout(viewTimer.current);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (viewTimer.current) clearTimeout(viewTimer.current);
    };
  }, [product.id, product.name]);

  const price = product.salePrice ?? product.price;
  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const isTrending = trendingIds.has(product.id);
  const rank = ranks.get(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ id: product.id, name: product.name, sku: product.sku, price, quantity: qty, imageUrl: product.imageUrl });
    trackEngagement(product.id, product.name, "add_to_cart");
    toast.success(`${qty}× ${product.name} added to cart`, { icon: "🛒" });
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ id: product.id, name: product.name, sku: product.sku, price, quantity: qty, imageUrl: product.imageUrl });
    trackEngagement(product.id, product.name, "whatsapp_click");
    window.location.href = "/cart";
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="group relative"
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden card-hover cursor-pointer">
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
            {isTrending && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full shadow-md">
                <Flame className="h-2.5 w-2.5" />
                {rank && rank <= 3 ? `#${rank} TRENDING` : "TRENDING"}
              </span>
            )}
            {product.featured && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-[#FF6B00] text-white text-[10px] font-bold rounded-full">
                <Zap className="h-2.5 w-2.5" /> FEATURED
              </span>
            )}
            {discount > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                -{discount}%
              </span>
            )}
            {product.stock > 0 && product.stock <= 10 && (
              <span className="px-2 py-0.5 bg-amber-500/90 text-white text-[10px] font-bold rounded-full">
                LOW STOCK
              </span>
            )}
            {product.stock === 0 && (
              <span className="px-2 py-0.5 bg-gray-600 text-white text-[10px] font-bold rounded-full">
                OUT OF STOCK
              </span>
            )}
          </div>

          {/* Image */}
          <div className="relative h-48 sm:h-52 bg-gray-100 dark:bg-[#1A1A1A] overflow-hidden">
            {!imageError && product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="h-16 w-16 text-gray-300 dark:text-gray-700" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {product.brand && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#FF6B00] mb-1">{product.brand}</p>
            )}
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#FF6B00] transition-colors leading-snug mb-1">
              {product.name}
            </h3>

            <div className="flex items-center gap-2 mb-2">
              {(product.rating ?? 0) > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{product.rating?.toFixed(1)}</span>
                </div>
              )}
              {(product.soldCount ?? 0) > 0 && (
                <span className="text-[11px] text-gray-500">{product.soldCount} sold</span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-end gap-2 mb-2">
              <span className="text-base font-bold text-gray-900 dark:text-white">{fmt(price, product.currency)}</span>
              {product.salePrice && (
                <span className="text-xs text-gray-400 dark:text-gray-500 line-through">{fmt(product.price, product.currency)}</span>
              )}
            </div>

            {/* MOQ */}
            <p className="text-[11px] text-gray-500 mb-3">
              Min. order: <span className="text-gray-700 dark:text-gray-300 font-medium">{product.moq} units</span>
            </p>

            {/* Qty selector */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={(e) => { e.preventDefault(); setQty(Math.max(product.moq, qty - 1)); }}
                  className="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 text-sm font-bold transition-colors"
                >−</button>
                <span className="px-3 py-1.5 text-sm text-gray-900 dark:text-white font-medium min-w-[3rem] text-center">{qty}</span>
                <button
                  onClick={(e) => { e.preventDefault(); setQty(qty + 1); }}
                  className="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 text-sm font-bold transition-colors"
                >+</button>
              </div>
              <span className="text-xs text-[#FF6B00] font-semibold flex-1 text-right">
                {fmt(price * qty, product.currency)}
              </span>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all",
                  product.stock === 0
                    ? "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "bg-gray-100 dark:bg-white/10 hover:bg-[#FF6B00]/20 text-gray-800 dark:text-white hover:text-[#FF6B00] border border-gray-200 dark:border-white/10 hover:border-[#FF6B00]/40"
                )}
              >
                <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
              </button>
              <button
                onClick={handleWhatsApp}
                disabled={product.stock === 0}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all"
              >
                <MessageCircle className="h-3.5 w-3.5" /> Order Now
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
