"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useNotificationStore } from "@/lib/notification-store";
import { useAdminUIStore } from "@/lib/admin-ui-store";

export function AdminTopbar() {
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const unreadCount = useNotificationStore((s) => s.unreadCount());
  const toggleSidebar = useAdminUIStore((s) => s.toggleSidebar);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-[#0A0A0A]/90 backdrop-blur-sm border-b border-white/10">
      {/* Hamburger — mobile only */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/10 transition-all shrink-0"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop search */}
      <div className="relative flex-1 max-w-md hidden md:block">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search products, orders, vendors..."
          className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF6B00]/30"
        />
      </div>

      {/* Mobile search toggle */}
      <button
        onClick={() => setSearchOpen(!searchOpen)}
        className="md:hidden p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/10 transition-all"
      >
        {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
      </button>

      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {/* Theme */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/10 transition-all"
        >
          {mounted ? (theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <Sun className="h-4 w-4" />}
        </button>

        {/* Notifications */}
        <Link
          href="/admin/notifications"
          className="relative p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/10 transition-all"
        >
          <Bell className="h-4 w-4" />
          {mounted && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6B00] text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User */}
        <div className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-xl bg-white/5 border border-white/10">
          <div className="h-7 w-7 rounded-full gradient-orange flex items-center justify-center text-white text-xs font-bold shrink-0">
            {session?.user?.name?.[0] ?? "A"}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-white leading-tight">{session?.user?.name ?? "Admin"}</p>
            <p className="text-[10px] text-gray-500">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Mobile search bar (expands below topbar) */}
      {searchOpen && (
        <div className="absolute left-0 right-0 top-full px-4 py-3 bg-[#0A0A0A] border-b border-white/10 md:hidden">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              autoFocus
              type="text"
              placeholder="Search products, orders, vendors..."
              className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF6B00]/30"
            />
          </div>
        </div>
      )}
    </header>
  );
}
