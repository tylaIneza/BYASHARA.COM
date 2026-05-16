"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Settings, Smartphone, Save, Loader2, CheckCircle2, Lock, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isSuperAdmin = (session?.user as any)?.role === "SUPER_ADMIN";

  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [original, setOriginal] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setWhatsappNumber(d.whatsappNumber ?? "");
        setOriginal(d.whatsappNumber ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  const isDirty = whatsappNumber.trim() !== original;

  const handleSave = async () => {
    const num = whatsappNumber.trim();
    if (!num) { toast.error("WhatsApp number cannot be empty"); return; }
    if (!/^\+?\d[\d\s]{6,19}$/.test(num)) {
      toast.error("Enter a valid phone number (e.g. +250788628417)");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappNumber: num }),
      });
      if (!res.ok) throw new Error();
      setOriginal(num);
      setSaved(true);
      toast.success("WhatsApp number updated");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform configuration and preferences</p>
      </div>

      {/* WhatsApp number card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111111] border border-white/10 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-[#25D366]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">WhatsApp Order Number</h2>
            <p className="text-xs text-gray-500">The number that receives all customer orders</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading settings…
          </div>
        ) : isSuperAdmin ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                WhatsApp Number
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => { setWhatsappNumber(e.target.value); setSaved(false); }}
                  placeholder="+250788628417"
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF6B00]/50 transition-colors"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Include country code, e.g. <span className="text-gray-400">+250788628417</span>
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="flex items-center gap-2 btn-primary px-5 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
              ) : saved ? (
                <><CheckCircle2 className="h-4 w-4" /> Saved</>
              ) : (
                <><Save className="h-4 w-4" /> Save Changes</>
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-4">
            <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300 mb-0.5">Super Admin only</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Only a Super Admin can change platform settings. Contact your Super Admin to update
                the WhatsApp order number.
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* More settings placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-[#111111] border border-white/10 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center">
            <Settings className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">More Settings</h2>
            <p className="text-xs text-gray-500">Delivery zones, currencies, banners, and more</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1.5 w-fit">
          <Lock className="h-3.5 w-3.5" /> Coming soon
        </div>
      </motion.div>
    </div>
  );
}
