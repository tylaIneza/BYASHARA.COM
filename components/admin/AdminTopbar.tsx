"use client";

import { Bell, Search, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";

export function AdminTopbar() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#0A0A0A]/90 backdrop-blur-sm border-b border-white/10">
      <div className="relative flex-1 max-w-md hidden md:block">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search products, orders, vendors..."
          className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF6B00]/30"
        />
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/10 transition-all"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button className="relative p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/10 transition-all">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#FF6B00]" />
        </button>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
          <div className="h-7 w-7 rounded-full gradient-orange flex items-center justify-center text-white text-xs font-bold">
            {session?.user?.name?.[0] ?? "A"}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-white">{session?.user?.name ?? "Admin"}</p>
            <p className="text-[10px] text-gray-500">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
