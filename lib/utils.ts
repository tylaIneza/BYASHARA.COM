import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "RWF") {
  if (currency === "RWF") {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }
  return `${currency} ${amount.toLocaleString()}`;
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
  customerName?: string
): string {
  const lines: string[] = [];
  lines.push("🛒 *BOUTIQUE BYASHARA — Wholesale Order*");
  lines.push("━━━━━━━━━━━━━━━━━━━━━");
  if (customerName) lines.push(`👤 *Customer:* ${customerName}`);
  if (province) lines.push(`📍 *Delivery:* ${province}`);
  lines.push("━━━━━━━━━━━━━━━━━━━━━");
  lines.push("📦 *Products:*");

  let total = 0;
  items.forEach((item, i) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    lines.push(`\n${i + 1}. *${item.name}*`);
    if (item.variant) lines.push(`   • Variant: ${item.variant}`);
    lines.push(`   • SKU: ${item.sku || "N/A"}`);
    lines.push(`   • Qty: ${item.quantity} units`);
    lines.push(`   • Unit Price: ${formatCurrency(item.price)}`);
    lines.push(`   • Subtotal: ${formatCurrency(itemTotal)}`);
    if (item.imageUrl) lines.push(`   🖼️ ${item.imageUrl}`);
  });

  lines.push("\n━━━━━━━━━━━━━━━━━━━━━");
  lines.push(`💰 *Total: ${formatCurrency(total)}*`);
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
};
