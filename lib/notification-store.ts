"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  browserPermission: NotificationPermission | "default";
  unreadCount: () => number;
  add: (n: Pick<AppNotification, "type" | "title" | "body" | "link">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clear: () => void;
  setBrowserPermission: (p: NotificationPermission) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      browserPermission: "default",
      unreadCount: () => get().notifications.filter((n) => !n.read).length,
      add: (n) => {
        const notif: AppNotification = {
          ...n,
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          read: false,
          createdAt: Date.now(),
        };
        set((s) => ({ notifications: [notif, ...s.notifications].slice(0, 100) }));

        // Fire browser notification if permission granted
        if (typeof window !== "undefined" && Notification.permission === "granted") {
          new Notification(notif.title, {
            body: notif.body,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            tag: notif.id,
          });
        }
      },
      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
        })),
      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      remove: (id) =>
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
      clear: () => set({ notifications: [] }),
      setBrowserPermission: (p) => set({ browserPermission: p }),
    }),
    {
      name: "byashara-notifications",
      partialize: (s) => ({ notifications: s.notifications }),
    }
  )
);
