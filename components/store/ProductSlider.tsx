"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, MessageCircle,
  ShoppingBag, Star, Zap, ArrowRight,
} from "lucide-react";
import { useProductStore } from "@/lib/product-store";
import { useCurrencyStore } from "@/lib/currency-store";
import { useCartStore } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

export function ProductSlider() {
  const { products } = useProductStore();
  const { isOutsideRwanda, rwfPerUsd } = useCurrencyStore();
  const addItem = useCartStore((s) => s.addItem);

  const slides = products
    .filter((p) => p.status === "ACTIVE" && p.imageUrl)
    .slice(0, 8);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1); // 1 = forward, -1 = backward

  const total = slides.length;

  const go = useCallback(
    (next: number) => {
      setDir(next > index ? 1 : -1);
      setIndex(next);
    },
    [index]
  );

  const prev = () => go((index - 1 + total) % total);
  const next = () => go((index + 1) % total);

  useEffect(() => {
    if (total < 2 || paused) return;
    const t = setInterval(() => {
      setDir(1);
      setIndex((c) => (c + 1) % total);
    }, 5000);
    return () => clearInterval(t);
  }, [paused, total]);

  if (total === 0) return <FallbackBanner />;

  const slide = slides[index];
  const effectivePrice =
    slide.salePrice && slide.salePrice < slide.price ? slide.salePrice : slide.price;
  const discountPct =
    slide.salePrice && slide.salePrice < slide.price
      ? Math.round((1 - slide.salePrice / slide.price) * 100)
      : null;

  function fmt(amount: number) {
    if (isOutsideRwanda && (!slide.currency || slide.currency === "RWF")) {
      return formatCurrency(Math.round(amount / rwfPerUsd), "USD");
    }
    return formatCurrency(amount, slide.currency ?? "RWF");
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-[#080808]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Slide track */}
      <div className="relative h-[300px] sm:h-[380px] lg:h-[460px]">
        <AnimatePresence custom={dir} mode="wait" initial={false}>
          <motion.div
            key={index}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0 flex flex-col sm:flex-row"
          >
            {/* ── Background glow ── */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(ellipse at 80% 50%, #FF6B0030, transparent 60%),
                             radial-gradient(ellipse at 20% 80%, #FF6B0015, transparent 50%)`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent sm:via-[#080808]/60" />

            {/* ── Product image (right / top on mobile) ── */}
            <div className="absolute inset-0 flex items-center justify-end pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.imageUrl}
                alt={slide.name}
                className="h-full w-auto max-w-[55%] sm:max-w-[48%] object-contain object-right pr-4 sm:pr-10 lg:pr-16 select-none"
                draggable={false}
              />
            </div>

            {/* ── Text content (left) ── */}
            <div className="relative z-10 flex flex-col justify-center px-5 sm:px-10 lg:px-16 py-6 sm:py-8 max-w-full sm:max-w-[55%]">
              {/* Badges row */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {slide.featured && (
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-[#FF6B00] text-white">
                    <Zap className="h-2.5 w-2.5" /> Featured
                  </span>
                )}
                {discountPct && (
                  <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                    -{discountPct}% OFF
                  </span>
                )}
                {slide.category && (
                  <span className="text-[10px] sm:text-xs text-gray-400 px-2 py-0.5 rounded-full bg-white/8 border border-white/10">
                    {slide.category}
                  </span>
                )}
              </div>

              {/* Brand */}
              {slide.brand && (
                <p className="text-[10px] sm:text-xs font-bold text-[#FF6B00] uppercase tracking-widest mb-1">
                  {slide.brand}
                </p>
              )}

              {/* Product name */}
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-2 sm:mb-3 line-clamp-2">
                {slide.name}
              </h2>

              {/* Rating */}
              {slide.rating > 0 && (
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < Math.round(slide.rating) ? "text-amber-400 fill-amber-400" : "text-gray-700"}`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-gray-400">{slide.rating.toFixed(1)}</span>
                  {slide.soldCount > 0 && (
                    <span className="text-[11px] text-gray-600">· {slide.soldCount}+ sold</span>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-2.5 mb-4 sm:mb-5">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
                  {fmt(effectivePrice)}
                </span>
                {slide.salePrice && slide.salePrice < slide.price && (
                  <span className="text-sm sm:text-base text-gray-500 line-through">
                    {fmt(slide.price)}
                  </span>
                )}
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => {
                    addItem({
                      id: slide.id,
                      name: slide.name,
                      price: effectivePrice,
                      quantity: slide.moq ?? 1,
                      imageUrl: slide.imageUrl,
                    });
                    toast.success(`${slide.name} added to cart`, { icon: "🛒" });
                  }}
                  className="flex items-center gap-1.5 bg-[#FF6B00] hover:bg-[#e55f00] active:scale-95 text-white font-bold px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-orange-500/20"
                >
                  <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Add to Cart
                </button>
                <Link
                  href="/products"
                  className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 text-white text-xs sm:text-sm font-semibold transition-all"
                >
                  Browse All <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation arrows ── */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 flex items-center justify-center text-white transition-all backdrop-blur-sm"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 flex items-center justify-center text-white transition-all backdrop-blur-sm"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </>
      )}

      {/* ── Bottom bar: dots + WhatsApp CTA ── */}
      <div className="relative z-10 flex items-center justify-between px-5 sm:px-10 py-3 bg-gradient-to-r from-[#0D0D0D] to-[#111111] border-t border-white/5">
        {/* Dots */}
        {total > 1 && (
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-5 h-1.5 bg-[#FF6B00]"
                    : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[11px] text-gray-500 hidden sm:inline">
            {index + 1} / {total}
          </span>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "250788628417"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Order via</span> WhatsApp
          </a>
        </div>
      </div>

      {/* ── Progress bar ── */}
      {total > 1 && !paused && (
        <motion.div
          key={`progress-${index}`}
          className="absolute bottom-0 left-0 h-0.5 bg-[#FF6B00]"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
        />
      )}
    </div>
  );
}

function FallbackBanner() {
  return (
    <div className="relative w-full overflow-hidden bg-[#080808] border-b border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,107,0,0.12)_0%,_transparent_55%)]" />
      <div className="max-w-7xl mx-auto px-5 sm:px-10 py-14 sm:py-20 relative z-10 flex flex-col sm:flex-row items-center gap-8">
        <div className="flex-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-[#FF6B00]/15 border border-[#FF6B00]/30 text-[#FF6B00] mb-4">
            <Zap className="h-3 w-3" /> #1 Electronics Wholesale in Rwanda & DRC
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
            Wholesale <span className="text-gradient">Electronics</span> for Africa
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mb-6 max-w-lg">
            Smartphones, laptops, accessories and more — no account needed.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="btn-primary flex items-center gap-2 px-6 py-3 text-sm">
              Browse Products <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "250788628417"}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold text-sm transition-all"
            >
              <MessageCircle className="h-4 w-4" /> Order via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
