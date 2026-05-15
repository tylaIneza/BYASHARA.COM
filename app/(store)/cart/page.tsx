"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ShoppingBag, MessageCircle, Trash2, Plus, Minus, Package,
  ArrowRight, MapPin, User, Info, AlertTriangle, Truck, Smartphone,
} from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatCurrency, generateWhatsAppMessage } from "@/lib/utils";
import { useNotificationStore } from "@/lib/notification-store";
import { useCustomerStore } from "@/lib/customer-store";
import { useOrderStore } from "@/lib/order-store";

const PROVINCES = [
  // Rwanda
  "Kigali (City)", "Eastern Province", "Western Province", "Northern Province", "Southern Province",
  // DRC
  "Goma, North Kivu (DRC)", "Bukavu, South Kivu (DRC)",
];

// Retail pricing constants
const KIGALI_TRANSPORT_FEE = 1000; // RWF

const isRetailItem = (qty: number) => qty === 1;
const retailMarkup = (wholesalePrice: number) => wholesalePrice < 10000 ? 1.9 : 1.2;
const effectiveUnitPrice = (price: number, qty: number) =>
  isRetailItem(qty) ? Math.ceil(price * retailMarkup(price)) : price;

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const addNotification = useNotificationStore((s) => s.add);
  const recordOrder = useCustomerStore((s) => s.recordOrder);
  const addOrder = useOrderStore((s) => s.addOrder);
  const [province, setProvince] = useState("");
  const [customerName, setCustomerName] = useState("");

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+250788628417";

  // Retail detection
  const hasRetailItems = items.some((i) => isRetailItem(i.quantity));
  const isKigali = province.includes("Kigali");
  const transportFee = hasRetailItems && isKigali ? KIGALI_TRANSPORT_FEE : 0;
  const subtotal = items.reduce(
    (s, i) => s + effectiveUnitPrice(i.price, i.quantity) * i.quantity,
    0
  );
  const grandTotal = subtotal + transportFee;

  // Validation
  const missingName = customerName.trim() === "";
  const missingLocation = province === "";
  const retailBlockedByLocation = hasRetailItems && !missingLocation && !isKigali;
  const canOrder = !missingName && !missingLocation && !retailBlockedByLocation;

  const handleOrderWhatsApp = () => {
    if (!canOrder) return;
    const adjustedItems = items.map((i) => ({
      ...i,
      price: effectiveUnitPrice(i.price, i.quantity),
      isRetail: isRetailItem(i.quantity),
    }));
    const msg = generateWhatsAppMessage(adjustedItems, province, customerName, transportFee);
    window.open(`https://wa.me/${whatsappNumber.replace(/\s/g, "")}?text=${msg}`, "_blank");
    const orderItems = adjustedItems.map((i) => ({ name: i.name, qty: i.quantity, price: i.price, isRetail: isRetailItem(i.quantity) }));
    recordOrder({
      name: customerName,
      location: province,
      total: grandTotal,
      isRetail: hasRetailItems,
      items: orderItems,
    });
    addOrder({
      customer: customerName,
      location: province,
      items: orderItems,
      subtotal,
      transportFee,
      total: grandTotal,
    });
    addNotification({
      type: "order",
      title: "New WhatsApp order",
      body: `${customerName} from ${province} sent an order for ${items.length} item${items.length === 1 ? "" : "s"} — ${formatCurrency(grandTotal)}.`,
      link: "/admin/orders",
    });
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

      {/* Retail pricing notice */}
      <AnimatePresence>
        {hasRetailItems && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-5 py-4"
          >
            <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-300 mb-0.5">Retail pricing applied</p>
              <p className="text-amber-200/80 leading-relaxed">
                One or more items have a quantity of 1 unit. Single-unit purchases are billed at{" "}
                <span className="font-semibold">retail price (+90% for items under RWF 10,000 · +20% for items RWF 10,000 and above)</span>.
                Retail orders are only available for delivery within{" "}
                <span className="font-semibold">Kigali</span>, with an additional{" "}
                <span className="font-semibold">transport fee of RWF 1,000</span>. Increase the
                quantity to the minimum order quantity for wholesale pricing.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Non-Kigali retail warning */}
      <AnimatePresence>
        {retailBlockedByLocation && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4"
          >
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-red-300 mb-0.5">Retail delivery not available outside Kigali</p>
              <p className="text-red-200/80 leading-relaxed">
                Single-unit (retail) purchases can only be delivered within Kigali.
                Please select <span className="font-semibold">Kigali (City)</span> as your
                delivery location, or increase your item quantities to qualify for wholesale pricing.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item, i) => {
              const retail = isRetailItem(item.quantity);
              const unitPrice = effectiveUnitPrice(item.price, item.quantity);
              return (
                <motion.div
                  key={`${item.id}-${item.variant}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-4 bg-[#111111] border rounded-2xl p-4 ${
                    retail ? "border-amber-500/30" : "border-white/10"
                  }`}
                >
                  {/* Image */}
                  <div className="h-20 w-20 rounded-xl bg-[#1A1A1A] border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <Package className="h-8 w-8 text-gray-600" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                      {retail && (
                        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          RETAIL
                        </span>
                      )}
                    </div>
                    {item.variant && <p className="text-xs text-gray-400 mt-0.5">Variant: {item.variant}</p>}
                    {item.sku && <p className="text-xs text-gray-500">SKU: {item.sku}</p>}
                    {/* Price — show strikethrough wholesale when retail applies */}
                    <div className="flex items-baseline gap-1.5 mt-1">
                      {retail && (
                        <span className="text-xs text-gray-500 line-through">{formatCurrency(item.price)}</span>
                      )}
                      <span className={`font-bold text-sm ${retail ? "text-amber-400" : "text-[#FF6B00]"}`}>
                        {formatCurrency(unitPrice)}
                      </span>
                      {retail && (
                        <span className="text-[10px] text-gray-500">/ unit (retail)</span>
                      )}
                    </div>
                  </div>

                  {/* Qty */}
                  <div className="flex items-center border border-white/10 rounded-xl overflow-hidden shrink-0">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-3 text-sm font-semibold text-white min-w-[2.5rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Subtotal + Remove */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white">{formatCurrency(unitPrice * item.quantity)}</p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="mt-1 p-1.5 text-gray-600 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
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
                <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {transportFee > 0 && (
                <div className="flex justify-between text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-amber-400" />
                    Transport fee <span className="text-[10px] text-amber-400">(retail/Kigali)</span>
                  </span>
                  <span className="text-amber-300 font-medium">{formatCurrency(transportFee)}</span>
                </div>
              )}
              {!hasRetailItems && (
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span className="text-emerald-400 text-xs font-medium">Free (wholesale)</span>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-4 mb-4">
              <div className="flex justify-between font-bold">
                <span className="text-white">Total</span>
                <span className="text-gradient text-lg">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* MoMo payment info */}
            <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-xl px-4 py-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="h-3.5 w-3.5 text-[#FFD700]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#FFD700]">MoMo Payment</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">Number</span>
                  <span className="text-sm font-bold text-white tracking-wide">+250 788 628 417</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">Name</span>
                  <span className="text-sm font-semibold text-white">Ineza Pacifique</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">Amount</span>
                  <span className="text-sm font-bold text-[#FFD700]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                Send payment via MTN MoMo before confirming your order on WhatsApp.
              </p>
            </div>

            {/* Customer info */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${missingName ? "text-red-400" : "text-gray-500"}`} />
                <input
                  type="text"
                  placeholder="Your name *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none transition-colors ${
                    missingName ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#FF6B00]/50"
                  }`}
                />
                {missingName && (
                  <p className="text-[10px] text-red-400 mt-1 ml-1">Name is required</p>
                )}
              </div>
              <div className="relative">
                <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${missingLocation ? "text-red-400" : "text-gray-500"}`} />
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className={`w-full bg-[#1A1A1A] border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white appearance-none focus:outline-none cursor-pointer transition-colors ${
                    missingLocation ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#FF6B00]/50"
                  }`}
                >
                  <option value="">Select delivery location *</option>
                  <optgroup label="🇷🇼 Rwanda">
                    {PROVINCES.slice(0, 5).map((p) => <option key={p}>{p}</option>)}
                  </optgroup>
                  <optgroup label="🇨🇩 DRC (Eastern)">
                    {PROVINCES.slice(5).map((p) => <option key={p}>{p}</option>)}
                  </optgroup>
                </select>
                {missingLocation && (
                  <p className="text-[10px] text-red-400 mt-1 ml-1">Delivery location is required</p>
                )}
              </div>
            </div>

            {/* WhatsApp order button */}
            <button
              onClick={handleOrderWhatsApp}
              disabled={!canOrder}
              className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-xl text-base transition-all ${
                canOrder
                  ? "bg-[#25D366] hover:bg-[#128C7E] text-white hover:shadow-lg hover:shadow-green-500/20"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              Order via WhatsApp
            </button>

            {(missingName || missingLocation) && (
              <p className="text-[11px] text-red-400 text-center mt-2 leading-relaxed">
                {missingName && missingLocation
                  ? "Please enter your name and select a delivery location."
                  : missingName
                  ? "Please enter your name to continue."
                  : "Please select a delivery location to continue."}
              </p>
            )}

            {retailBlockedByLocation && (
              <p className="text-[11px] text-red-400 text-center mt-2 leading-relaxed">
                Select Kigali (City) to place a retail order, or increase item quantities.
              </p>
            )}

            <p className="text-[11px] text-gray-500 text-center mt-3 leading-relaxed">
              {hasRetailItems
                ? "Retail pricing + RWF 1,000 transport applies. Kigali delivery only."
                : "Wholesale pricing. No transport fee charged."}
            </p>
          </div>

          {/* WhatsApp preview */}
          <div className="bg-[#075E54] rounded-2xl p-4 border border-[#128C7E]/40">
            <p className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Order Preview
            </p>
            <div className="bg-[#DCF8C6] rounded-xl p-3 text-[11px] text-[#1a1a1a] leading-relaxed font-mono max-h-56 overflow-y-auto">
              <p className="font-bold">🛒 BOUTIQUE BYASHARA — {hasRetailItems ? "Retail" : "Wholesale"} Order</p>
              <p>━━━━━━━━━━━━━━</p>
              {customerName && <p>👤 Customer: {customerName}</p>}
              {province && <p>📍 Delivery: {province}</p>}
              {hasRetailItems && <p>🏪 Pricing: Retail (single-unit)</p>}
              <p>━━━━━━━━━━━━━━</p>
              <p>📦 Products:</p>
              {items.slice(0, 3).map((item, i) => {
                const retail = isRetailItem(item.quantity);
                const unitPrice = effectiveUnitPrice(item.price, item.quantity);
                return (
                  <div key={i} className="mt-1">
                    <p>{i + 1}. {item.name}{retail ? " [RETAIL]" : ""}</p>
                    <p>  • Qty: {item.quantity} unit{item.quantity > 1 ? "s" : ""}</p>
                    <p>  • Price: {formatCurrency(unitPrice)}{retail ? " (retail)" : ""}</p>
                  </div>
                );
              })}
              {items.length > 3 && <p>  ... +{items.length - 3} more items</p>}
              <p className="mt-1">━━━━━━━━━━━━━━</p>
              {transportFee > 0 && (
                <>
                  <p>📦 Subtotal: {formatCurrency(subtotal)}</p>
                  <p>🚚 Transport: {formatCurrency(transportFee)}</p>
                </>
              )}
              <p className="font-bold">💰 Total: {formatCurrency(grandTotal)}</p>
              <p className="mt-1">━━━━━━━━━━━━━━</p>
              <p className="font-bold">💳 Payment via MTN MoMo:</p>
              <p>  📱 +250 788 628 417</p>
              <p>  👤 Ineza Pacifique</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
