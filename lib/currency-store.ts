"use client";

import { create } from "zustand";

interface CurrencyStore {
  isOutsideRwanda: boolean;
  rwfPerUsd: number;
  detected: boolean;
  detect: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyStore>()((set) => ({
  isOutsideRwanda: false,
  rwfPerUsd: 1320, // fallback rate
  detected: false,
  detect: async () => {
    try {
      const geo = await fetch("https://ipapi.co/country/", { signal: AbortSignal.timeout(4000) });
      const country = (await geo.text()).trim();
      if (country !== "RW") {
        try {
          const rates = await fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(4000) });
          const data = await rates.json();
          const rwfPerUsd = data?.rates?.RWF ?? 1320;
          set({ isOutsideRwanda: true, rwfPerUsd, detected: true });
        } catch {
          set({ isOutsideRwanda: true, rwfPerUsd: 1320, detected: true });
        }
      } else {
        set({ isOutsideRwanda: false, detected: true });
      }
    } catch {
      set({ detected: true });
    }
  },
}));
