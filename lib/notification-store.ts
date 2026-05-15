"use client";

import { create } from "zustand";

export type NotifType = "order" | "product" | "category" | "system";

export interface AppNotification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
  link?: string;
}

interface NotificationStore {
  notifications: AppNotification[];
  hydrated: boolean;
  browserPermission: NotificationPermission | "default";
  unreadCount: () => number;
  load: () => Promise<void>;
  add: (n: Pick<AppNotification, "type" | "title" | "body" | "link">) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  setBrowserPermission: (p: NotificationPermission) => void;
}

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  notifications: [],
  hydrated: false,
  browserPermission: "default",

  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  load: async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("fetch failed");
      const data: AppNotification[] = await res.json();
      set({ notifications: data, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  add: async (n) => {
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(n),
    });
    const created: AppNotification = await res.json();
    set((s) => ({ notifications: [created, ...s.notifications].slice(0, 100) }));

    if (typeof window !== "undefined" && Notification.permission === "granted") {
      new Notification(created.title, {
        body: created.body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: created.id,
      });
    }
  },

  markRead: async (id) => {
    set((s) => ({
      notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
    }));
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
  },

  markAllRead: async () => {
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
    await fetch("/api/notifications/read-all", { method: "POST" });
  },

  remove: async (id) => {
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
  },

  clear: async () => {
    set({ notifications: [] });
    await fetch("/api/notifications", { method: "DELETE" });
  },

  setBrowserPermission: (p) => set({ browserPermission: p }),
}));
