"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ShoppingBag, Menu, X, ChevronDown, Zap,
  MessageCircle, Phone, Globe, Sun, Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";

const CATEGORIES = [
  "Smartphones", "Laptops", "Accessories", "TVs", "Audio",
  "Gaming", "Networking", "CCTV", "Solar", "Smart Home",
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const itemCount = useCartStore((s) => s.itemCount());

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#FF6B00] text-white text-xs py-2 px-4 hidden md:flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Phone className="h-3 w-3" /> +250 780 000 000
          </span>
          <span>|</span>
          <span>Rwanda · Goma · Bukavu delivery available</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Globe className="h-3 w-3" /> RWF / USD / CDF</span>
          <Link href="/admin/login" className="hover:underline">Admin Portal</Link>
          <Link href="/vendor/login" className="hover:underline">Vendor Login</Link>
        </div>
      </div>

      {/* Main Navbar */}
      <motion.nav
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "glass-dark shadow-2xl shadow-black/50"
            : "bg-[#0A0A0A]/95 backdrop-blur-sm"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-orange">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white">BOUTIQUE <span className="text-[#FF6B00]">BYASHARA</span></span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="relative group">
                <button className="flex items-center gap-1 text-gray-300 hover:text-white text-sm font-medium transition-colors">
                  Categories <ChevronDown className="h-4 w-4 group-hover:rotate-180 transition-transform" />
                </button>
                <div className="absolute top-full left-0 w-56 mt-2 glass-dark rounded-2xl border border-white/10 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat}
                      href={`/categories/${cat.toLowerCase()}`}
                      className="block px-4 py-2 text-sm text-gray-300 hover:text-[#FF6B00] hover:bg-white/5 transition-colors"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
              <Link href="/products" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">All Products</Link>
              <Link href="/vendors" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Vendors</Link>
              <Link href="/flash-sales" className="text-sm font-medium text-[#FF6B00] flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" /> Flash Sales
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl px-4 py-2 text-sm border border-white/10 transition-all w-48"
              >
                <Search className="h-4 w-4" />
                <span>Search electronics…</span>
              </button>
              <button onClick={() => setSearchOpen(true)} className="md:hidden p-2 text-gray-300 hover:text-white">
                <Search className="h-5 w-5" />
              </button>

              {/* Theme toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-all"
              >
                {mounted ? (theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />) : <Sun className="h-5 w-5" />}
              </button>

              {/* WhatsApp Cart */}
              <Link href="/cart" className="relative p-2 text-gray-300 hover:text-white">
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6B00] text-[10px] font-bold text-white"
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </motion.span>
                )}
              </Link>

              {/* WhatsApp button */}
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl px-4 py-2 text-sm font-semibold transition-all"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>

              {/* Mobile menu */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 text-gray-300 hover:text-white"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-white/10 bg-[#0A0A0A]"
            >
              <div className="px-4 py-4 space-y-1">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={`/categories/${cat.toLowerCase()}`}
                    className="block py-2.5 px-4 text-sm text-gray-300 hover:text-[#FF6B00] hover:bg-white/5 rounded-xl transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {cat}
                  </Link>
                ))}
                <hr className="border-white/10 my-2" />
                <Link href="/products" className="block py-2.5 px-4 text-sm text-gray-300 hover:text-white rounded-xl" onClick={() => setMenuOpen(false)}>All Products</Link>
                <Link href="/flash-sales" className="block py-2.5 px-4 text-sm text-[#FF6B00] font-semibold rounded-xl" onClick={() => setMenuOpen(false)}>⚡ Flash Sales</Link>
                <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} className="flex items-center gap-2 py-2.5 px-4 text-sm text-[#25D366] font-semibold rounded-xl">
                  <MessageCircle className="h-4 w-4" /> Order via WhatsApp
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="w-full max-w-2xl glass-dark rounded-2xl border border-white/10 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-[#FF6B00] shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search electronics — smartphones, laptops, accessories..."
                  className="flex-1 bg-transparent text-white text-lg outline-none placeholder:text-gray-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      window.location.href = `/products?q=${encodeURIComponent(searchQuery)}`;
                    }
                    if (e.key === "Escape") setSearchOpen(false);
                  }}
                />
                <button onClick={() => setSearchOpen(false)} className="p-1 text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["iPhone", "Samsung", "Laptop", "Speaker", "CCTV", "Solar Panel"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => { setSearchQuery(tag); }}
                    className="px-3 py-1 text-xs bg-white/5 hover:bg-[#FF6B00]/20 text-gray-300 hover:text-[#FF6B00] rounded-full border border-white/10 transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
