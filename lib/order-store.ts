"use client";

import { create } from "zustand";

export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "DISPATCHED" | "DELIVERED" | "CANCELLED";

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  isRetail: boolean;
}

export interface Order {
  id: string;
  customer: string;
  location: string;
  items: OrderItem[];
  subtotal: number;
  transportFee: number;
  total: number;
  status: OrderStatus;
  createdAt: number;
}

interface OrderStore {
  orders: Order[];
  hydrated: boolean;
  load: () => Promise<void>;
  addOrder: (o: Omit<Order, "id" | "status" | "createdAt">) => Promise<void>;
  updateStatus: (id: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useOrderStore = create<OrderStore>()((set) => ({
  orders: [],
  hydrated: false,

  load: async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("fetch failed");
      const data: Order[] = await res.json();
      set({ orders: data, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  addOrder: async (o) => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(o),
    });
    const created: Order = await res.json();
    set((s) => ({ orders: [created, ...s.orders] }));
  },

  updateStatus: async (id, status) => {
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    }));
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  },

  deleteOrder: async (id) => {
    set((s) => ({ orders: s.orders.filter((o) => o.id !== id) }));
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
  },

  clearAll: async () => {
    set({ orders: [] });
    await fetch("/api/orders", { method: "DELETE" });
  },
}));
