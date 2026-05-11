import Link from "next/link";
import { Zap, MessageCircle, Phone, Mail, MapPin, Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/10 mt-20">
      {/* WhatsApp CTA */}
      <div className="bg-gradient-to-r from-[#FF6B00]/20 to-transparent border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Ready to order wholesale?</h3>
            <p className="text-gray-400 text-sm mt-1">Talk to our sales team on WhatsApp — instant quotes, bulk pricing.</p>
          </div>
          <a
            href="https://wa.me/270788628417"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl px-6 py-3 font-bold text-sm transition-all hover:shadow-lg hover:shadow-green-500/20 animate-glow shrink-0"
          >
            <MessageCircle className="h-5 w-5" />
            Order via WhatsApp Now
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-orange">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-black text-white">BOUTIQUE <span className="text-[#FF6B00]">BYASHARA</span></span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Rwanda & Eastern DRC&apos;s #1 electronics wholesale marketplace. Powering businesses with bulk tech.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <a href="#" className="p-2 bg-white/5 hover:bg-[#FF6B00]/20 text-gray-400 hover:text-[#FF6B00] rounded-lg transition-all"><Instagram className="h-4 w-4" /></a>
            <a href="#" className="p-2 bg-white/5 hover:bg-[#FF6B00]/20 text-gray-400 hover:text-[#FF6B00] rounded-lg transition-all"><Facebook className="h-4 w-4" /></a>
            <a href="#" className="p-2 bg-white/5 hover:bg-[#FF6B00]/20 text-gray-400 hover:text-[#FF6B00] rounded-lg transition-all"><Twitter className="h-4 w-4" /></a>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Categories</h4>
          <ul className="space-y-2">
            {["Smartphones", "Laptops", "Accessories", "TVs", "Gaming", "Networking", "CCTV", "Solar"].map((c) => (
              <li key={c}>
                <Link href={`/categories/${c.toLowerCase()}`} className="text-sm text-gray-400 hover:text-[#FF6B00] transition-colors">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Company</h4>
          <ul className="space-y-2">
            {[["About Us", "/about"], ["Vendors", "/vendors"], ["Flash Sales", "/flash-sales"], ["Bulk Orders", "/bulk"], ["Become a Vendor", "/vendor/register"], ["Admin Portal", "/admin/login"]].map(([label, href]) => (
              <li key={label}>
                <Link href={href} className="text-sm text-gray-400 hover:text-[#FF6B00] transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Contact</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm text-gray-400">
              <MapPin className="h-4 w-4 text-[#FF6B00] shrink-0 mt-0.5" />
              Kigali, Rwanda
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-400">
              <Phone className="h-4 w-4 text-[#FF6B00] shrink-0" />
              +250 780 000 000
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-400">
              <Mail className="h-4 w-4 text-[#FF6B00] shrink-0" />
              info@byashara.com
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-400">
              <MessageCircle className="h-4 w-4 text-[#25D366] shrink-0" />
              WhatsApp: +250 780 000 000
            </li>
          </ul>
          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-gray-400">Delivery zones:</p>
            <p className="text-xs font-semibold text-white mt-1">🇷🇼 All Rwanda Provinces</p>
            <p className="text-xs font-semibold text-white">🇨🇩 Goma · Bukavu (DRC)</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <p>© 2025 BOUTIQUE BYASHARA — All rights reserved. Made in Rwanda 🇷🇼</p>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
          <Link href="/shipping" className="hover:text-gray-300 transition-colors">Shipping</Link>
        </div>
      </div>
    </footer>
  );
}
