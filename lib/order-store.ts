"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OrderStatus = "PENDING" | "CONFIRMED" | "DISPATCHED" | "DELIVERED" | "CANCELLED";

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
  addOrder: (o: Omit<Order, "id" | "status" | "createdAt">) => void;
  updateStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  clearAll: () => void;
}

function genId() {
  return "BYA-" + Math.random().toString(36).slice(2, 7).toUpperCase();
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (o) =>
        set((s) => ({
          orders: [
            {
              ...o,
              id: genId(),
              status: "PENDING",
              createdAt: Date.now(),
            },
            ...s.orders,
          ],
        })),
      updateStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),
      deleteOrder: (id) =>
        set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),
      clearAll: () => set({ orders: [] }),
    }),
    { name: "byashara-orders" }
  )
);
