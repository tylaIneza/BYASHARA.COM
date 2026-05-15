"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function WhatsAppFloat() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="glass-dark rounded-2xl border border-white/10 p-4 w-72 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-[#25D366] flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">BYASHARA STORE Sales</p>
                <p className="text-[11px] text-green-400">● Online now</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Hello! 👋 Welcome to BYASHARA STORE. How can we help you with wholesale electronics today?
            </p>
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl py-2.5 text-sm font-semibold transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              Start Chat on WhatsApp
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg shadow-green-500/30 transition-all animate-glow"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>
    </div>
  );
}
