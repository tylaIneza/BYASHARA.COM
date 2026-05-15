"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageCircle, ShoppingBag, Star, Zap } from "lucide-react";
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

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const total = slides.length;

  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);

  useEffect(() => {
    if (total < 2 || paused) return;
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [next, paused, total]);

  if (total === 0) return null;

  const slide = slides[current];

  function fmt(amount: number) {
    if (isOutsideRwanda && (!slide.currency || slide.currency === "RWF")) {
      return formatCurrency(Math.round(amount / rwfPerUsd), "USD");
    }
    return formatCurrency(amount, slide.currency ?? "RWF");
  }

  const discountPct =
    slide.salePrice && slide.salePrice < slide.price
      ? Math.round((1 - slide.salePrice / slide.price) * 100)
      : null;

  return (
    <section
      className="relative w-full overflow-hidden bg-[#0D0D0D] border-b border-white/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div className="relative h-[340px] sm:h-[420px] lg:h-[480px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col md:flex-row items-center"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,107,0,0.10)_0%,_transparent_60%)]" />

            {/* Content */}
            <div className="relative z-10 flex-1 px-6 sm:px-10 lg:px-16 py-8 flex flex-col justify-center">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {slide.featured && (
                  <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00]">
                    <Zap className="h-3 w-3" /> Featured
                  </span>
                )}
                {discountPct && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400">
                    -{discountPct}% OFF
                  </span>
                )}
                {slide.category && (
                  <span className="text-[11px] text-gray-400 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                    {slide.category}
                  </span>
                )}
              </div>

              {slide.brand && (
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{slide.brand}</p>
              )}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-3 max-w-lg">
                {slide.name}
              </h2>

              {/* Rating */}
              {slide.rating > 0 && (
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(slide.rating) ? "text-amber-400 fill-amber-400" : "text-gray-600"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{slide.rating.toFixed(1)} · {slide.soldCount}+ sold</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-black text-white">
                  {fmt(slide.salePrice && slide.salePrice < slide.price ? slide.salePrice : slide.price)}
                </span>
                {slide.salePrice && slide.salePrice < slide.price && (
                  <span className="text-lg text-gray-500 line-through">{fmt(slide.price)}</span>
                )}
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => {
                    addItem({
                      id: slide.id,
                      name: slide.name,
                      price: slide.salePrice && slide.salePrice < slide.price ? slide.salePrice : slide.price,
                      quantity: slide.moq ?? 1,
                      imageUrl: slide.imageUrl,
                    });
                    toast.success(`${slide.name} added to cart`);
                  }}
                  className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#e55f00] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-orange-500/20"
                >
                  <ShoppingBag className="h-4 w-4" /> Add to Cart
                </button>
                <Link
                  href={`/products`}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold transition-all"
                >
                  <MessageCircle className="h-4 w-4 text-[#25D366]" /> Order via WhatsApp
                </Link>
              </div>
            </div>

            {/* Product image */}
            <div className="relative z-10 flex-shrink-0 w-full md:w-auto md:h-full flex items-center justify-center px-6 md:px-10 pb-6 md:pb-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.imageUrl}
                alt={slide.name}
                className="h-48 sm:h-64 lg:h-80 w-auto object-contain drop-shadow-2xl"
                draggable={false}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Prev / Next arrows */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 flex items-center justify-center text-white transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 flex items-center justify-center text-white transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${i === current ? "w-6 bg-[#FF6B00]" : "w-1.5 bg-white/30 hover:bg-white/50"}`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {!paused && total > 1 && (
        <motion.div
          key={current}
          className="absolute bottom-0 left-0 h-0.5 bg-[#FF6B00]/60"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 4.5, ease: "linear" }}
        />
      )}
    </section>
  );
}
