"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, MessageCircle, Star, Package, Zap, Eye } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import toast from "react-hot-toast";

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

interface ProductCardProps {
  product: ProductCardData;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [qty, setQty] = useState(product.moq);
  const [imageError, setImageError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const price = product.salePrice ?? product.price;
  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price,
      quantity: qty,
      imageUrl: product.imageUrl,
    });
    toast.success(`${qty}× ${product.name} added to WhatsApp cart`);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      `Hi! I want to order:\n\n*${product.name}*\n• SKU: ${product.sku}\n• Quantity: ${qty} units\n• Price: ${formatCurrency(price, product.currency)} each\n• Total: ${formatCurrency(price * qty, product.currency)}\n\nPlease confirm availability.`
    );
    window.open(`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative"
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative bg-[#111111] border border-white/10 rounded-2xl overflow-hidden card-hover cursor-pointer">
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
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
            {product.stock <= 10 && product.stock > 0 && (
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

          {/* Quick view */}
          <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 glass rounded-xl border border-white/20 text-white hover:text-[#FF6B00] transition-colors">
              <Eye className="h-4 w-4" />
            </button>
          </div>

          {/* Image */}
          <div className="relative h-48 sm:h-56 bg-[#1A1A1A] overflow-hidden">
            {!imageError && product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="h-16 w-16 text-gray-700" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {product.brand && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#FF6B00] mb-1">{product.brand}</p>
            )}
            <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-[#FF6B00] transition-colors leading-snug mb-1">
              {product.name}
            </h3>

            {/* Rating + Sold */}
            <div className="flex items-center gap-2 mb-2">
              {(product.rating ?? 0) > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  <span className="text-[11px] text-gray-400">{product.rating?.toFixed(1)}</span>
                </div>
              )}
              {(product.soldCount ?? 0) > 0 && (
                <span className="text-[11px] text-gray-500">{product.soldCount} sold</span>
              )}
              {product.vendorName && (
                <span className="text-[11px] text-gray-500 ml-auto truncate">{product.vendorName}</span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-end gap-2 mb-3">
              <span className="text-lg font-bold text-white">{formatCurrency(price, product.currency)}</span>
              {product.salePrice && (
                <span className="text-sm text-gray-500 line-through">{formatCurrency(product.price, product.currency)}</span>
              )}
            </div>

            {/* MOQ */}
            <div className="flex items-center gap-1.5 mb-3">
              <Package className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-[11px] text-gray-500">Min. order: <span className="text-gray-300 font-medium">{product.moq} units</span></span>
            </div>

            {/* Qty selector */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center border border-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={(e) => { e.preventDefault(); setQty(Math.max(product.moq, qty - 1)); }}
                  className="px-3 py-1.5 text-gray-300 hover:bg-white/10 text-sm font-bold transition-colors"
                >−</button>
                <span className="px-3 py-1.5 text-sm text-white font-medium min-w-[3rem] text-center">{qty}</span>
                <button
                  onClick={(e) => { e.preventDefault(); setQty(qty + 1); }}
                  className="px-3 py-1.5 text-gray-300 hover:bg-white/10 text-sm font-bold transition-colors"
                >+</button>
              </div>
              <span className="text-xs text-gray-500 flex-1 text-right">{formatCurrency(price * qty, product.currency)}</span>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all",
                  product.stock === 0
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                    : "bg-white/10 hover:bg-[#FF6B00]/20 text-white hover:text-[#FF6B00] border border-white/10 hover:border-[#FF6B00]/40"
                )}
              >
                <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-[#25D366] hover:bg-[#128C7E] text-white transition-all"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
