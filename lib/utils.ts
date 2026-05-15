import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "RWF") {
  // Use a fixed locale (en-US) so server and client produce identical strings.
  // rw-RW is not available in Node.js and falls back differently than the browser.
  const n = Math.round(amount);
  const parts = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (currency === "USD") {
    const usd = (amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `$${usd}`;
  }
  if (currency === "CDF") return `CDF ${parts}`;
  return `RWF ${parts}`;
}

export function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber() {
  const prefix = "BYA";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function generateWhatsAppMessage(
  items: CartItem[],
  province?: string,
  customerName?: string,
  transportFee?: number
): string {
  const hasRetail = items.some((i) => i.isRetail);
  const orderType = hasRetail ? "Retail Order" : "Wholesale Order";
  const lines: string[] = [];
  lines.push(`🛒 *BOUTIQUE BYASHARA — ${orderType}*`);
  lines.push("━━━━━━━━━━━━━━━━━━━━━");
  if (customerName) lines.push(`👤 *Customer:* ${customerName}`);
  if (province) lines.push(`📍 *Delivery:* ${province}`);
  if (hasRetail) lines.push(`🏪 *Pricing:* Retail (single-unit purchase)`);
  lines.push("━━━━━━━━━━━━━━━━━━━━━");
  lines.push("📦 *Products:*");

  let subtotal = 0;
  items.forEach((item, i) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    lines.push(`\n${i + 1}. *${item.name}*`);
    if (item.variant) lines.push(`   • Variant: ${item.variant}`);
    lines.push(`   • SKU: ${item.sku || "N/A"}`);
    lines.push(`   • Qty: ${item.quantity} unit${item.quantity > 1 ? "s" : ""}`);
    lines.push(`   • Unit Price: ${formatCurrency(item.price)}${item.isRetail ? " _(retail)_" : ""}`);
    lines.push(`   • Subtotal: ${formatCurrency(itemTotal)}`);
  });

  lines.push("\n━━━━━━━━━━━━━━━━━━━━━");
  if (transportFee && transportFee > 0) {
    lines.push(`📦 *Subtotal: ${formatCurrency(subtotal)}*`);
    lines.push(`🚚 *Transport Fee: ${formatCurrency(transportFee)}*`);
    lines.push(`💰 *Grand Total: ${formatCurrency(subtotal + transportFee)}*`);
  } else {
    lines.push(`💰 *Total: ${formatCurrency(subtotal)}*`);
  }
  lines.push("━━━━━━━━━━━━━━━━━━━━━");
  lines.push("💳 *Payment via MTN MoMo:*");
  lines.push("   📱 Number: +250 788 628 417");
  lines.push("   👤 Name: Ineza Pacifique");
  lines.push("━━━━━━━━━━━━━━━━━━━━━");
  lines.push("📞 Please confirm this order. Thank you!");

  return encodeURIComponent(lines.join("\n"));
}

export type CartItem = {
  id: string;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  variant?: string;
  imageUrl?: string;
  isRetail?: boolean;
};
