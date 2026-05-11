"use client";

import { motion } from "framer-motion";
import { BarChart2, Construction } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Deep-dive sales and traffic analytics</p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-80 bg-[#111111] border border-white/10 rounded-2xl"
      >
        <div className="h-16 w-16 rounded-2xl bg-[#FF6B00]/10 flex items-center justify-center mb-4">
          <BarChart2 className="h-8 w-8 text-[#FF6B00]" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Advanced Analytics</h3>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          Detailed revenue breakdowns, vendor performance, and province-level analytics coming soon.
        </p>
        <div className="flex items-center gap-1.5 mt-4 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1.5">
          <Construction className="h-3.5 w-3.5" /> Coming soon
        </div>
      </motion.div>
    </div>
  );
}
