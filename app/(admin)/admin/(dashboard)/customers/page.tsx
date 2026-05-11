"use client";

import { motion } from "framer-motion";
import { Users, Construction } from "lucide-react";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Customers</h1>
        <p className="text-sm text-gray-500 mt-0.5">Guest buyer analytics</p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-80 bg-[#111111] border border-white/10 rounded-2xl"
      >
        <div className="h-16 w-16 rounded-2xl bg-[#FF6B00]/10 flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-[#FF6B00]" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Customers Module</h3>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          Guest buyer data is collected from WhatsApp orders. This module is coming soon.
        </p>
        <div className="flex items-center gap-1.5 mt-4 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1.5">
          <Construction className="h-3.5 w-3.5" /> Coming soon
        </div>
      </motion.div>
    </div>
  );
}
