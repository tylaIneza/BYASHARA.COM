"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, Users, ShoppingBag,
  MessageCircle, BarChart2, Truck, Tag, Settings,
  Store, Bell, ChevronRight, Warehouse, LogOut, UsersRound, Layers, X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useAdminUIStore } from "@/lib/admin-ui-store";

const NAV = [
  { label: "Dashboard",      href: "/admin/dashboard",   icon: LayoutDashboard },
  { label: "Products",       href: "/admin/products",    icon: Package },
  { label: "Categories",     href: "/admin/categories",  icon: Layers },
  { label: "Vendors",        href: "/admin/vendors",     icon: Store },
  { label: "WhatsApp Orders",href: "/admin/orders",      icon: MessageCircle },
  { label: "Customers",      href: "/admin/customers",   icon: Users },
  { label: "Deliveries",     href: "/admin/deliveries",  icon: Truck },
  { label: "Warehouse",      href: "/admin/warehouse",   icon: Warehouse },
  { label: "Flash Sales",    href: "/admin/flash-sales", icon: Tag },
  { label: "Analytics",      href: "/admin/analytics",   icon: BarChart2 },
  { label: "Team",           href: "/admin/team",        icon: UsersRound },
  { label: "Notifications",  href: "/admin/notifications",icon: Bell },
  { label: "Settings",       href: "/admin/settings",    icon: Settings },
];

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E30000] shrink-0">
          <span className="text-sm font-black text-white tracking-tight leading-none">BS</span>
        </div>
        <div className="min-w-0">
          <span className="text-sm font-black text-white leading-tight block truncate">BYASHARA <span className="text-[#FF6B00]">STORE</span></span>
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Admin Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                active
                  ? "bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-[#FF6B00]" : "text-gray-500 group-hover:text-gray-300")} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 text-[#FF6B00]" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <Link
          href="/"
          onClick={onLinkClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all mb-1"
        >
          <Store className="h-4 w-4" /> View Storefront
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const { sidebarOpen, closeSidebar } = useAdminUIStore();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 hidden lg:flex flex-col bg-[#0D0D0D] border-r border-white/10 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-40 lg:hidden"
              onClick={closeSidebar}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 flex flex-col bg-[#0D0D0D] border-r border-white/10 z-50 lg:hidden"
            >
              <button
                onClick={closeSidebar}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent onLinkClick={closeSidebar} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
