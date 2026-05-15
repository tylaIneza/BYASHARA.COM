"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.ok && !res.error) {
      toast.success("Welcome back!");
      window.location.href = "/admin/dashboard";
    } else {
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 gradient-orange p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(0,0,0,0.3)_0%,_transparent_60%)]" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">BYASHARA <span className="text-white/70">STORE</span></div>
              <div className="text-xs text-white/70">Admin Portal</div>
            </div>
          </div>
        </div>
        <div className="relative space-y-6">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight mb-3">
              Power the future<br />of African<br />wholesale tech.
            </h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Manage products, vendors, orders and analytics for Rwanda & Eastern DRC&apos;s #1 electronics marketplace.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Vendors", value: "320+" },
              { label: "Products", value: "12.5K+" },
              { label: "Orders", value: "48K+" },
              { label: "Revenue", value: "RWF 2.8B" },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 rounded-2xl p-4">
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-white/70 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-white/50 text-xs">© 2025 BYASHARA STORE. Made in Rwanda 🇷🇼</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-orange">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-black text-white">BYASHARA <span className="text-[#FF6B00]">STORE</span></span>
          </div>

          <h1 className="text-3xl font-black text-white mb-2">Admin Login</h1>
          <p className="text-gray-400 text-sm mb-8">Sign in to manage the marketplace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@byashara.com"
                  className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF6B00]/50 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF6B00]/50 transition-colors"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : "Sign In to Admin"}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-500">
            <p className="font-semibold text-gray-400 mb-1">Demo credentials:</p>
            <p>Email: admin@byashara.com</p>
            <p>Password: admin@123</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
