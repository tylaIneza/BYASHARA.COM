"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Zap, ArrowRight, MessageCircle, Package, TrendingUp,
  Shield, Truck, Star, Clock, ChevronRight, Play,
  Smartphone, Laptop, Tv, Wifi, Camera, Speaker,
  Gamepad2, SunMedium, Home, Wrench, Printer, Watch,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

const CATEGORIES = [
  { name: "Smartphones", icon: Smartphone, href: "/categories/smartphones", color: "from-blue-500/20 to-blue-600/5" },
  { name: "Laptops", icon: Laptop, href: "/categories/laptops", color: "from-violet-500/20 to-violet-600/5" },
  { name: "TVs", icon: Tv, href: "/categories/tvs", color: "from-red-500/20 to-red-600/5" },
  { name: "Audio", icon: Speaker, href: "/categories/audio", color: "from-pink-500/20 to-pink-600/5" },
  { name: "Networking", icon: Wifi, href: "/categories/networking", color: "from-cyan-500/20 to-cyan-600/5" },
  { name: "CCTV", icon: Camera, href: "/categories/cctv", color: "from-amber-500/20 to-amber-600/5" },
  { name: "Gaming", icon: Gamepad2, href: "/categories/gaming", color: "from-green-500/20 to-green-600/5" },
  { name: "Solar", icon: SunMedium, href: "/categories/solar", color: "from-yellow-500/20 to-yellow-600/5" },
  { name: "Smart Home", icon: Home, href: "/categories/smart-home", color: "from-teal-500/20 to-teal-600/5" },
  { name: "Repair Tools", icon: Wrench, href: "/categories/repair-tools", color: "from-orange-500/20 to-orange-600/5" },
  { name: "Printers", icon: Printer, href: "/categories/printers", color: "from-indigo-500/20 to-indigo-600/5" },
  { name: "Smartwatches", icon: Watch, href: "/categories/smartwatches", color: "from-rose-500/20 to-rose-600/5" },
];

const STATS = [
  { label: "Products Listed", value: 12500, suffix: "+" },
  { label: "Verified Vendors", value: 320, suffix: "+" },
  { label: "Orders Processed", value: 48000, suffix: "+" },
  { label: "Rwanda Provinces", value: 5, suffix: "" },
];

const FEATURES = [
  { icon: Shield, title: "Verified Vendors", desc: "All suppliers go through a strict verification process", color: "text-blue-400" },
  { icon: Truck, title: "Rwanda & DRC Delivery", desc: "Delivering to all provinces + Goma & Bukavu", color: "text-green-400" },
  { icon: MessageCircle, title: "WhatsApp First", desc: "Order instantly via WhatsApp — no account needed", color: "text-[#25D366]" },
  { icon: Package, title: "Bulk Wholesale", desc: "Minimum order quantities for true wholesale pricing", color: "text-[#FF6B00]" },
  { icon: Zap, title: "Flash Sales", desc: "Daily deals on the hottest electronics", color: "text-amber-400" },
  { icon: TrendingUp, title: "Bulk Pricing Tiers", desc: "More you order, less you pay per unit", color: "text-violet-400" },
];

const LIVE_ORDERS = [
  { name: "Samuel K.", location: "Kigali", product: "iPhone 15 Pro (×50)", time: "2 min ago" },
  { name: "Marie C.", location: "Goma, DRC", product: "Samsung 65\" TV (×10)", time: "5 min ago" },
  { name: "Patrick N.", location: "Huye", product: "Xiaomi Laptop (×20)", time: "8 min ago" },
  { name: "Aline M.", location: "Musanze", product: "JBL Speakers (×100)", time: "12 min ago" },
  { name: "Jean P.", location: "Bukavu, DRC", product: "CCTV Kit (×5)", time: "15 min ago" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = value / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= value) { setCount(value); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{formatNumber(count)}{suffix}</span>;
}

function LiveOrderNotification() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((p) => (p + 1) % LIVE_ORDERS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const order = LIVE_ORDERS[current];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={current}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex items-center gap-3 glass-dark border border-white/10 rounded-2xl px-4 py-3 w-full max-w-sm"
      >
        <div className="h-2 w-2 rounded-full bg-green-400 shrink-0 animate-pulse" />
        <div className="text-xs">
          <span className="text-white font-semibold">{order.name}</span>
          <span className="text-gray-400"> from {order.location} ordered </span>
          <span className="text-[#FF6B00] font-medium">{order.product}</span>
          <span className="text-gray-500"> · {order.time}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div>
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background */}
        <motion.div style={{ y }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/95 to-[#0A0A0A]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,107,0,0.15)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,107,0,0.08)_0%,_transparent_50%)]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(#FF6B00 1px, transparent 1px), linear-gradient(90deg, #FF6B00 1px, transparent 1px)", backgroundSize: "60px 60px" }}
          />
        </motion.div>

        {/* Floating orbs */}
        <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-[#FF6B00]/10 blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 h-48 w-48 rounded-full bg-[#FF6B00]/5 blur-2xl animate-float" style={{ animationDelay: "1.5s" }} />

        <motion.div style={{ opacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-24 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] text-sm font-semibold mb-6"
              >
                <Zap className="h-4 w-4" />
                #1 Electronics Wholesale in Rwanda & DRC
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] text-white mb-6"
              >
                Wholesale{" "}
                <span className="text-gradient">Electronics</span>
                <br />
                <span className="text-4xl sm:text-5xl lg:text-6xl">for Africa&apos;s</span>
                <br />
                <span className="text-gradient">Future.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-400 text-lg mb-8 leading-relaxed max-w-xl"
              >
                Order bulk electronics in Rwanda and Eastern DRC. Smartphones, laptops, accessories
                and more — delivered to your door. <span className="text-white font-medium">No account needed.</span>
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 mb-8"
              >
                <Link
                  href="/products"
                  className="btn-primary flex items-center justify-center gap-2 px-8 py-4 text-base"
                >
                  Browse Products <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold text-base transition-all"
                >
                  <MessageCircle className="h-5 w-5" /> Order via WhatsApp
                </a>
              </motion.div>

              {/* Live order notification */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <LiveOrderNotification />
              </motion.div>
            </div>

            {/* Right side — stats + visual */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Main card */}
                <div className="glass-dark rounded-3xl border border-white/10 p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Today&apos;s wholesale orders</p>
                      <p className="text-3xl font-black text-white">RWF 48.2M</p>
                    </div>
                    <div className="flex items-center gap-1 text-green-400 text-sm font-semibold">
                      <TrendingUp className="h-4 w-4" />
                      +24.5%
                    </div>
                  </div>
                  {/* Mini bar chart */}
                  <div className="flex items-end gap-2 h-20">
                    {[40, 65, 45, 80, 55, 90, 100].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                        className={`flex-1 rounded-t-lg ${i === 6 ? "bg-[#FF6B00]" : "bg-white/10"}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Floating badges */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 glass-dark border border-white/10 rounded-2xl px-4 py-3 text-sm font-semibold text-white"
                >
                  🇷🇼 All Rwanda Provinces
                </motion.div>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 glass-dark border border-white/10 rounded-2xl px-4 py-3 text-sm font-semibold text-white"
                >
                  🇨🇩 Goma · Bukavu DRC
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <div className="h-8 w-0.5 bg-gradient-to-b from-[#FF6B00] to-transparent" />
          </div>
        </motion.div>
      </section>

      {/* Marquee brands */}
      <div className="py-6 border-y border-white/10 bg-[#111111] overflow-hidden">
        <div className="flex gap-12 marquee whitespace-nowrap">
          {["Samsung", "Apple", "Xiaomi", "Huawei", "Oppo", "Infinix", "Tecno", "JBL", "Sony", "LG", "HP", "Dell", "Lenovo", "Canon", "Hikvision",
            "Samsung", "Apple", "Xiaomi", "Huawei", "Oppo", "Infinix", "Tecno", "JBL", "Sony", "LG", "HP", "Dell", "Lenovo", "Canon", "Hikvision"].map((brand, i) => (
            <span key={i} className="text-gray-600 font-bold text-sm tracking-widest uppercase">{brand}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 rounded-2xl border border-white/10 bg-white/2"
            >
              <div className="text-4xl font-black text-gradient mb-2">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-white mb-2">
              Shop by <span className="text-gradient">Category</span>
            </h2>
            <p className="text-gray-400">20+ electronics categories for wholesale buyers</p>
          </div>
          <Link href="/categories" className="hidden md:flex items-center gap-2 text-[#FF6B00] hover:text-white text-sm font-semibold transition-colors">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
            >
              <Link
                href={cat.href}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-b ${cat.color} border border-white/10 hover:border-[#FF6B00]/40 transition-all group`}
              >
                <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-[#FF6B00]/20 transition-colors">
                  <cat.icon className="h-6 w-6 text-gray-300 group-hover:text-[#FF6B00] transition-colors" />
                </div>
                <span className="text-[11px] font-semibold text-gray-300 group-hover:text-white text-center">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Flash Sale CTA */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl gradient-orange p-8 md:p-12"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-6 w-6 text-white" />
                <span className="text-white font-bold text-lg">FLASH SALE TODAY</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-white mb-2">Up to 40% OFF</h3>
              <p className="text-white/80">Limited time deals on premium electronics. Bulk orders welcome.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 text-white">
                <div className="text-center">
                  <div className="text-4xl font-black">12</div>
                  <div className="text-xs uppercase">Hrs</div>
                </div>
                <div className="text-3xl font-black">:</div>
                <div className="text-center">
                  <div className="text-4xl font-black">34</div>
                  <div className="text-xs uppercase">Min</div>
                </div>
                <div className="text-3xl font-black">:</div>
                <div className="text-center">
                  <div className="text-4xl font-black">59</div>
                  <div className="text-xs uppercase">Sec</div>
                </div>
              </div>
              <Link href="/flash-sales" className="flex items-center gap-2 bg-white text-[#FF6B00] hover:bg-gray-100 font-bold px-8 py-3 rounded-xl transition-all text-sm">
                View Flash Sales <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-3">Why Choose <span className="text-gradient">BYASHARA.COM</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Built for African wholesale buyers — fast, trusted, and delivered.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-white/10 bg-white/2 hover:border-white/20 transition-all group"
            >
              <div className={`h-12 w-12 rounded-xl bg-white/5 group-hover:bg-white/10 flex items-center justify-center mb-4 transition-colors ${f.color}`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WhatsApp ordering CTA */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-dark border border-white/10 rounded-3xl p-8 md:p-12 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-[#25D366]/20 flex items-center justify-center">
              <MessageCircle className="h-10 w-10 text-[#25D366]" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Order in <span className="text-gradient">60 Seconds</span>
          </h2>
          <p className="text-gray-400 mb-4 max-w-2xl mx-auto text-lg leading-relaxed">
            No account. No password. Browse electronics, select quantities, and click
            &quot;Order via WhatsApp&quot; — your order summary is auto-generated and sent instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              {["Browse Products", "→", "Choose Quantity", "→", "Click WhatsApp", "→", "Done!"].map((step, i) => (
                <span key={i} className={step === "→" ? "text-[#FF6B00]" : "text-gray-300 font-medium"}>{step}</span>
              ))}
            </div>
          </div>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-8 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold px-10 py-4 rounded-2xl text-base transition-all hover:shadow-lg hover:shadow-green-500/20"
          >
            <MessageCircle className="h-5 w-5" /> Start Ordering on WhatsApp
          </a>
        </motion.div>
      </section>

      {/* Featured Products placeholder */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-white mb-1">Featured <span className="text-gradient">Electronics</span></h2>
            <p className="text-gray-400 text-sm">Top wholesale picks from verified vendors</p>
          </div>
          <Link href="/products" className="flex items-center gap-2 text-[#FF6B00] hover:text-white text-sm font-semibold transition-colors">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-[#111111] border border-white/10 overflow-hidden">
              <div className="skeleton h-48" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-3 w-16 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-6 w-24 rounded" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="skeleton h-9 rounded-xl" />
                  <div className="skeleton h-9 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
