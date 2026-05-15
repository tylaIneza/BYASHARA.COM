"use client";

import { create } from "zustand";

export interface CustomerOrder {
  id: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  location: string;
  isRetail: boolean;
  createdAt: number;
}

export interface Customer {
  id: string;
  name: string;
  location: string;
  orderCount: number;
  totalSpent: number;
  firstOrderAt: number;
  lastOrderAt: number;
  orders: CustomerOrder[];
}

interface CustomerStore {
  customers: Customer[];
  hydrated: boolean;
  load: () => Promise<void>;
  recordOrder: (params: {
    name: string;
    location: string;
    total: number;
    items: CustomerOrder["items"];
    isRetail: boolean;
  }) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useCustomerStore = create<CustomerStore>()((set) => ({
  customers: [],
  hydrated: false,

  load: async () => {
    try {
      const res = await fetch("/api/customers");
      if (!res.ok) throw new Error("fetch failed");
      const data: Customer[] = await res.json();
      set({ customers: data, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  recordOrder: async ({ name, location, total, items, isRetail }) => {
    const res = await fetch("/api/customers/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, location, total, items, isRetail }),
    });
    const updated: Customer = await res.json();
    set((s) => {
      const exists = s.customers.find((c) => c.id === updated.id);
      if (exists) {
        return { customers: s.customers.map((c) => (c.id === updated.id ? updated : c)) };
      }
      return { customers: [updated, ...s.customers] };
    });
  },

  deleteCustomer: async (id) => {
    set((s) => ({ customers: s.customers.filter((c) => c.id !== id) }));
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
  },

  clearAll: async () => {
    set({ customers: [] });
    await fetch("/api/customers", { method: "DELETE" });
  },
}));
