"use client";

import { create } from "zustand";

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
  status: "ACTIVE" | "PENDING" | "DRAFT" | "REJECTED" | "INACTIVE";
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
  imageUrl?: string;
  images?: string[];
}

interface ProductStore {
  products: Product[];
  hydrated: boolean;
  load: () => Promise<void>;
  updateProduct: (id: string, changes: Partial<Product>) => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductStore>()((set, get) => ({
  products: [],
  hydrated: false,

  load: async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("fetch failed");
      const data: Product[] = await res.json();
      set({ products: data, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  updateProduct: async (id, changes) => {
    set((s) => ({
      products: s.products.map((p) => (p.id === id ? { ...p, ...changes } : p)),
    }));
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });
  },

  addProduct: async (product) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    const created: Product = await res.json();
    set((s) => ({ products: [created, ...s.products] }));
    return created;
  },

  deleteProduct: async (id) => {
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
    await fetch(`/api/products/${id}`, { method: "DELETE" });
  },
}));

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
