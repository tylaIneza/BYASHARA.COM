"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  recordOrder: (params: {
    name: string;
    location: string;
    total: number;
    items: CustomerOrder["items"];
    isRetail: boolean;
  }) => void;
  deleteCustomer: (id: string) => void;
  clearAll: () => void;
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set, get) => ({
      customers: [],
      recordOrder: ({ name, location, total, items, isRetail }) => {
        const trimmed = name.trim();
        const now = Date.now();
        const order: CustomerOrder = {
          id: `ord-${now}-${Math.random().toString(36).slice(2, 6)}`,
          items,
          total,
          location,
          isRetail,
          createdAt: now,
        };
        const existing = get().customers.find(
          (c) => c.name.toLowerCase() === trimmed.toLowerCase()
        );
        if (existing) {
          set((s) => ({
            customers: s.customers.map((c) =>
              c.id === existing.id
                ? {
                    ...c,
                    location,
                    orderCount: c.orderCount + 1,
                    totalSpent: c.totalSpent + total,
                    lastOrderAt: now,
                    orders: [order, ...c.orders],
                  }
                : c
            ),
          }));
        } else {
          const customer: Customer = {
            id: `cust-${now}-${Math.random().toString(36).slice(2, 6)}`,
            name: trimmed,
            location,
            orderCount: 1,
            totalSpent: total,
            firstOrderAt: now,
            lastOrderAt: now,
            orders: [order],
          };
          set((s) => ({ customers: [customer, ...s.customers] }));
        }
      },
      deleteCustomer: (id) =>
        set((s) => ({ customers: s.customers.filter((c) => c.id !== id) })),
      clearAll: () => set({ customers: [] }),
    }),
    { name: "byashara-customers" }
  )
);
