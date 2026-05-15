"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, BellOff, Check, CheckCheck, Trash2, Package,
  Layers, ShoppingBag, Settings, X, BellRing,
} from "lucide-react";
import { useNotificationStore, type NotifType } from "@/lib/notification-store";
import { formatDistanceToNow } from "date-fns";

const TYPE_META: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  order:    { icon: ShoppingBag, color: "text-green-400",  bg: "bg-green-400/10" },
  product:  { icon: Package,     color: "text-blue-400",   bg: "bg-blue-400/10" },
  category: { icon: Layers,      color: "text-violet-400", bg: "bg-violet-400/10" },
  system:   { icon: Settings,    color: "text-[#FF6B00]",  bg: "bg-[#FF6B00]/10" },
};

const FILTERS = ["All", "Orders", "Products", "Categories", "System"] as const;
type Filter = (typeof FILTERS)[number];

function filterToType(f: Filter): NotifType | null {
  const map: Partial<Record<Filter, NotifType>> = {
    Orders: "order", Products: "product", Categories: "category", System: "system",
  };
  return map[f] ?? null;
}

async function requestBrowserPermission(setBrowserPermission: (p: NotificationPermission) => void) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  const result = await Notification.requestPermission();
  setBrowserPermission(result);
}

export default function NotificationsPage() {
  const {
    notifications, unreadCount, markRead, markAllRead,
    remove, clear, browserPermission, setBrowserPermission,
  } = useNotificationStore();

  const [filter, setFilter] = useState<Filter>("All");
  const [confirmClear, setConfirmClear] = useState(false);

  const typeFilter = filterToType(filter);
  const visible = typeFilter
    ? notifications.filter((n) => n.type === typeFilter)
    : notifications;

  const unread = unreadCount();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Notifications
            {unread > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#FF6B00] text-white text-xs font-bold">
                {unread}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{notifications.length} total · {unread} unread</p>
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 transition-all"
            >
              <Trash2 className="h-4 w-4" /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Browser permission banner */}
      <BrowserPermissionBanner permission={browserPermission} onRequest={() => requestBrowserPermission(setBrowserPermission)} />

      {/* Confirm clear */}
      <AnimatePresence>
        {confirmClear && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-4 px-5 py-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl"
          >
            <p className="text-sm text-white">Delete all {notifications.length} notifications?</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { clear(); setConfirmClear(false); }}
                className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all"
              >
                Delete all
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f
                ? "bg-[#FF6B00] text-white"
                : "bg-[#111111] border border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <BellOff className="h-7 w-7 text-gray-600" />
            </div>
            <p className="text-white font-semibold mb-1">No notifications</p>
            <p className="text-sm text-gray-500">Activity will appear here as it happens.</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            <AnimatePresence initial={false}>
              {visible.map((n) => {
                const meta = TYPE_META[n.type];
                const Icon = meta.icon;
                return (
                  <motion.li
                    key={n.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                      !n.read ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${meta.bg}`}>
                      <Icon className={`h-4 w-4 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold ${n.read ? "text-gray-300" : "text-white"}`}>
                          {n.title}
                          {!n.read && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-[#FF6B00] align-middle" />}
                        </p>
                        <span className="text-[11px] text-gray-600 shrink-0">
                          {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!n.read && (
                        <button
                          onClick={() => markRead(n.id)}
                          title="Mark read"
                          className="p-1.5 rounded-lg text-gray-600 hover:text-green-400 hover:bg-green-400/10 transition-all"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => remove(n.id)}
                        title="Remove"
                        className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}

function BrowserPermissionBanner({
  permission,
  onRequest,
}: {
  permission: NotificationPermission | "default";
  onRequest: () => void;
}) {
  if (permission === "granted") {
    return (
      <div className="flex items-center gap-3 px-5 py-3 bg-green-500/10 border border-green-500/20 rounded-2xl">
        <BellRing className="h-5 w-5 text-green-400 shrink-0" />
        <p className="text-sm text-green-300 font-medium">Browser notifications are enabled.</p>
      </div>
    );
  }
  if (permission === "denied") {
    return (
      <div className="flex items-center gap-3 px-5 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
        <BellOff className="h-5 w-5 text-red-400 shrink-0" />
        <p className="text-sm text-red-300">
          Browser notifications are blocked. Enable them in your browser settings to receive alerts.
        </p>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 bg-[#FF6B00]/10 border border-[#FF6B00]/20 rounded-2xl">
      <div className="flex items-center gap-3">
        <Bell className="h-5 w-5 text-[#FF6B00] shrink-0" />
        <div>
          <p className="text-sm font-semibold text-white">Enable browser notifications</p>
          <p className="text-xs text-gray-400">Get alerts for new orders and activity even when this tab is in the background.</p>
        </div>
      </div>
      <button
        onClick={onRequest}
        className="shrink-0 px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#e55f00] text-white text-sm font-bold transition-all"
      >
        Enable
      </button>
    </div>
  );
}
