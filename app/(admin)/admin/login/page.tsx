"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Eye, EyeOff, Loader2, Lock, Mail,
  ShieldCheck, ArrowLeft, RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

/* ── 6-digit OTP input ── */
function OtpInput({ onComplete }: { onComplete: (code: string) => void }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { refs.current[0]?.focus(); }, []);

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/, "").slice(-1);
    const next = [...digits];
    next[i] = digit;
    setDigits(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
    if (next.every((d) => d !== "")) onComplete(next.join(""));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split("");
      setDigits(next);
      refs.current[5]?.focus();
      onComplete(pasted);
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-black text-white bg-[#1A1A1A] border-2 rounded-xl outline-none transition-all
            border-white/10 focus:border-[#FF6B00] focus:bg-[#FF6B00]/5"
        />
      ))}
    </div>
  );
}

/* ── Shared left panel ── */
function LeftPanel() {
  return (
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
            { label: "Vendors",  value: "320+"     },
            { label: "Products", value: "12.5K+"   },
            { label: "Orders",   value: "48K+"     },
            { label: "Revenue",  value: "RWF 2.8B" },
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
  );
}

/* ── Main login page ── */
export default function AdminLoginPage() {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  /* Step 1 — verify password, decide if OTP needed */
  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Invalid email or password");
        return;
      }

      if (data.requiresOtp) {
        toast.success("OTP sent to your email", { icon: "📧" });
        setStep("otp");
      } else {
        // Regular admin — sign in directly
        await doSignIn("");
      }
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* Step 2 — submit OTP + complete NextAuth sign-in */
  const doSignIn = async (otp: string) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        otp,
        redirect: false,
      });
      if (res?.ok && !res.error) {
        toast.success("Welcome back!");
        window.location.href = "/admin/dashboard";
      } else {
        toast.error(otp ? "Invalid or expired OTP. Try again." : "Sign-in failed.");
        if (otp) setOtpCode(""); // reset OTP input on failure
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpComplete = (code: string) => {
    setOtpCode(code);
    doSignIn(code);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      if (res.ok) toast.success("New OTP sent to your email", { icon: "📧" });
      else toast.error("Failed to resend. Check your connection.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      <LeftPanel />

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-orange">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-black text-white">BYASHARA <span className="text-[#FF6B00]">STORE</span></span>
          </div>

          <AnimatePresence mode="wait">
            {/* ── STEP 1: Email + Password ── */}
            {step === "credentials" && (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h1 className="text-3xl font-black text-white mb-2">Admin Login</h1>
                <p className="text-gray-400 text-sm mb-8">Sign in to manage the marketplace</p>

                <form onSubmit={handleCredentials} className="space-y-4">
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
                    {loading
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Checking…</>
                      : "Continue"}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2: OTP Verification ── */}
            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Back button */}
                <button
                  onClick={() => { setStep("credentials"); setOtpCode(""); }}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mb-6 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>

                {/* Icon */}
                <div className="h-14 w-14 rounded-2xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center mb-5">
                  <ShieldCheck className="h-7 w-7 text-[#FF6B00]" />
                </div>

                <h1 className="text-3xl font-black text-white mb-2">Check your email</h1>
                <p className="text-gray-400 text-sm mb-1">
                  We sent a 6-digit code to
                </p>
                <p className="text-[#FF6B00] font-semibold text-sm mb-8">{email}</p>

                {/* OTP boxes */}
                {!loading ? (
                  <OtpInput key={otpCode === "" ? "reset" : "active"} onComplete={handleOtpComplete} />
                ) : (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-8 w-8 text-[#FF6B00] animate-spin" />
                  </div>
                )}

                <p className="text-center text-xs text-gray-600 mt-5">
                  Code expires in <span className="text-gray-400">5 minutes</span>
                </p>

                {/* Resend */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-600 mb-2">Didn&apos;t receive it?</p>
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="flex items-center gap-1.5 text-xs text-[#FF6B00] hover:text-orange-400 disabled:opacity-50 mx-auto transition-colors"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
                    {resending ? "Sending…" : "Resend code"}
                  </button>
                </div>

                {/* Security note */}
                <div className="mt-8 p-3.5 rounded-xl bg-white/3 border border-white/8 text-xs text-gray-600 leading-relaxed">
                  🔒 This extra step protects your Super Admin account. The code is single-use and expires after 5 minutes.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
