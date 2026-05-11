"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag, MessageCircle, Trash2, Plus, Minus, Package,
  ArrowRight, MapPin, User, CheckCircle2,
} from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatCurrency, generateWhatsAppMessage } from "@/lib/utils";

const PROVINCES = [
  // Rwanda
  "Kigali (City)", "Eastern Province", "Western Province", "Northern Province", "Southern Province",
  // DRC
  "Goma, North Kivu (DRC)", "Bukavu, South Kivu (DRC)",
];

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCartStore();
  const [province, setProvince] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [step, setStep] = useState<"cart" | "confirm">("cart");

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+250780000000";

  const handleOrderWhatsApp = () => {
    const msg = generateWhatsAppMessage(items, province, customerName);
    window.open(`https://wa.me/${whatsappNumber.replace(/\s/g, "")}?text=${msg}`, "_blank");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <ShoppingBag className="h-12 w-12 text-gray-600" />
        </div>
        <h2 className="text-2xl font-black text-white mb-3">Your cart is empty</h2>
        <p className="text-gray-400 mb-8 max-w-md">
          Browse our electronics catalog and add products to your WhatsApp cart for bulk ordering.
        </p>
        <Link href="/products" className="btn-primary flex items-center gap-2 px-8 py-4">
          Browse Electronics <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">
          WhatsApp <span className="text-gradient">Cart</span>
        </h1>
        <p className="text-gray-400 text-sm">Review your order, then send it via WhatsApp instantly.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={`${item.id}-${item.variant}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 bg-[#111111] border border-white/10 rounded-2xl p-4"
              >
                {/* Image */}
                <div className="h-20 w-20 rounded-xl bg-[#1A1A1A] border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} width={80} height={80} className="object-contain" />
                  ) : (
                    <Package className="h-8 w-8 text-gray-600" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                  {item.variant && <p className="text-xs text-gray-400 mt-0.5">Variant: {item.variant}</p>}
                  {item.sku && <p className="text-xs text-gray-500">SKU: {item.sku}</p>}
                  <p className="text-[#FF6B00] font-bold text-sm mt-1">{formatCurrency(item.price)}</p>
                </div>

                {/* Qty */}
                <div className="flex items-center border border-white/10 rounded-xl overflow-hidden shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-3 text-sm font-semibold text-white min-w-[2.5rem] text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Subtotal + Remove */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-white">{formatCurrency(item.price * item.quantity)}</p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="mt-1 p-1.5 text-gray-600 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button
            onClick={clearCart}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors underline underline-offset-4"
          >
            Clear all items
          </button>
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4">Order Summary</h3>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Items ({items.reduce((s, i) => s + i.quantity, 0)} units)</span>
                <span className="text-white font-medium">{formatCurrency(total())}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span className="text-gray-300">Calculated on order</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 mb-6">
              <div className="flex justify-between font-bold">
                <span className="text-white">Subtotal</span>
                <span className="text-gradient text-lg">{formatCurrency(total())}</span>
              </div>
            </div>

            {/* Customer info */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF6B00]/50"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-[#FF6B00]/50 cursor-pointer"
                >
                  <option value="">Select delivery location</option>
                  <optgroup label="🇷🇼 Rwanda">
                    {PROVINCES.slice(0, 5).map((p) => <option key={p}>{p}</option>)}
                  </optgroup>
                  <optgroup label="🇨🇩 DRC (Eastern)">
                    {PROVINCES.slice(5).map((p) => <option key={p}>{p}</option>)}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* WhatsApp order button */}
            <button
              onClick={handleOrderWhatsApp}
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-xl text-base transition-all hover:shadow-lg hover:shadow-green-500/20"
            >
              <MessageCircle className="h-5 w-5" />
              Order via WhatsApp
            </button>

            <p className="text-[11px] text-gray-500 text-center mt-3 leading-relaxed">
              Your order summary with product images will be auto-generated and sent to our WhatsApp.
              No account needed.
            </p>
          </div>

          {/* WhatsApp preview */}
          <div className="bg-[#075E54] rounded-2xl p-4 border border-[#128C7E]/40">
            <p className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Order Preview
            </p>
            <div className="bg-[#DCF8C6] rounded-xl p-3 text-[11px] text-[#1a1a1a] leading-relaxed font-mono max-h-48 overflow-y-auto">
              <p className="font-bold">🛒 BYASHARA.COM — Wholesale Order</p>
              <p>━━━━━━━━━━━━━━</p>
              {customerName && <p>👤 Customer: {customerName}</p>}
              {province && <p>📍 Delivery: {province}</p>}
              <p>━━━━━━━━━━━━━━</p>
              <p>📦 Products:</p>
              {items.slice(0, 3).map((item, i) => (
                <div key={i} className="mt-1">
                  <p>{i + 1}. {item.name}</p>
                  <p>  • Qty: {item.quantity} units</p>
                  <p>  • Price: {formatCurrency(item.price)}</p>
                  {item.imageUrl && <p>  🖼️ [Product Image]</p>}
                </div>
              ))}
              {items.length > 3 && <p>  ... +{items.length - 3} more items</p>}
              <p className="mt-1">━━━━━━━━━━━━━━</p>
              <p className="font-bold">💰 Total: {formatCurrency(total())}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
