"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  category: string;
  price: number;
  salePrice?: number;
  stock: number;
  status: "ACTIVE" | "PENDING" | "DRAFT" | "REJECTED";
  vendor: string;
  featured: boolean;
  moq: number;
  description: string;
  warranty: string;
  condition: string;
  weight: string;
  tags: string;
  rating: number;
  soldCount: number;
  currency: string;
  imageUrl?: string;  // primary image stored as base64 or URL
  images?: string[];  // all images stored as base64 or URL
}

const NAMES = [
  "Samsung Galaxy S24 Ultra 512GB",
  "Apple iPhone 15 Pro Max 256GB",
  "HP EliteBook 840 G10 i7",
  "JBL Charge 5 Bluetooth Speaker",
  "Samsung 65\" QLED 4K TV",
  "Hikvision 4MP IP Camera",
  "TP-Link Deco X68 Mesh WiFi 6",
  "Xiaomi 14 Pro 256GB",
  "Dell XPS 15 Intel Core Ultra",
  "Sony WH-1000XM5 Headphones",
  "LG 55\" OLED Smart TV",
  "Dahua NVR 16CH CCTV Kit",
  "Cisco RV340 Dual WAN Router",
  "Anker 65W GaN USB-C Charger",
  "Samsung Galaxy Watch 6 Classic",
  "Lenovo ThinkPad X1 Carbon Gen 12",
  "Apple AirPods Pro 2nd Gen",
  "TCL 75\" 4K Android TV",
  "Ubiquiti UniFi 6 Pro Access Point",
  "Xiaomi 33W Power Bank 20000mAh",
];
const BRANDS = ["Samsung", "Apple", "HP", "JBL", "Samsung", "Hikvision", "TP-Link", "Xiaomi", "Dell", "Sony", "LG", "Dahua", "Cisco", "Anker", "Samsung", "Lenovo", "Apple", "TCL", "Ubiquiti", "Xiaomi"];
const CATEGORIES = ["Smartphones", "Smartphones", "Laptops", "Audio", "TVs", "CCTV", "Networking", "Smartphones", "Laptops", "Audio", "TVs", "CCTV", "Networking", "Accessories", "Smartphones", "Laptops", "Audio", "TVs", "Networking", "Accessories"];
const PRICES = [890000, 1200000, 980000, 180000, 750000, 150000, 280000, 650000, 1500000, 350000, 950000, 420000, 380000, 95000, 480000, 1350000, 290000, 820000, 560000, 65000];
const VENDORS = ["TechRwanda Ltd", "KigaliElec", "Digital Hub", "AfriTech Store", "MoboShop"];

export const INITIAL_PRODUCTS: Product[] = Array.from({ length: 20 }, (_, i) => ({
  id: `prod-${i}`,
  slug: `prod-${i}-slug`,
  name: NAMES[i],
  sku: `SKU-${String(i + 1).padStart(4, "0")}`,
  brand: BRANDS[i],
  category: CATEGORIES[i],
  price: PRICES[i],
  salePrice: i % 4 === 0 ? Math.round(PRICES[i] * 0.85) : undefined,
  stock: i % 5 === 0 ? 0 : 50 + i * 7,
  status: (["ACTIVE", "ACTIVE", "PENDING", "DRAFT", "ACTIVE", "REJECTED"] as const)[i % 6],
  vendor: VENDORS[i % 5],
  featured: i % 6 === 0,
  moq: 1,
  description: "High-quality electronics product available for wholesale. Ideal for retailers and distributors across Rwanda and Eastern DRC.",
  warranty: "12 months manufacturer warranty",
  condition: "NEW",
  weight: "0.5",
  tags: "electronics, wholesale",
  rating: 3.5 + (i % 15) * 0.1,
  soldCount: 50 + i * 12,
  currency: "RWF",
  imageUrl: undefined,
  images: [],
}));

interface ProductStore {
  products: Product[];
  hydrated: boolean;
  updateProduct: (id: string, changes: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: INITIAL_PRODUCTS,
      hydrated: false,
      updateProduct: (id, changes) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...changes } : p
          ),
        })),
      addProduct: (product) =>
        set((state) => ({ products: [product, ...state.products] })),
      deleteProduct: (id) =>
        set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
    }),
    {
      name: "byashara-products",
      skipHydration: true,
      partialize: (s) => ({ products: s.products }),
      onRehydrateStorage: () => (_state, error) => {
        if (!error) setTimeout(() => useProductStore.setState({ hydrated: true }), 0);
      },
    }
  )
);

/** Convert a File to a resized base64 JPEG (max 800px, 80% quality) */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 800;
      const scale = Math.min(MAX / img.width, MAX / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
    img.src = url;
  });
}
