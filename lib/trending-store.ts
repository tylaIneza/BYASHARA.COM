import { create } from "zustand";

interface TrendingState {
  trendingIds: Set<string>;
  ranks: Map<string, number>;
  lastFetch: number;
  fetch: () => Promise<void>;
}

export const useTrendingStore = create<TrendingState>((set, get) => ({
  trendingIds: new Set(),
  ranks: new Map(),
  lastFetch: 0,

  fetch: async () => {
    const now = Date.now();
    // Throttle: only refetch if >30s have passed
    if (now - get().lastFetch < 30_000) return;
    try {
      const res = await fetch("/api/analytics/trending");
      if (!res.ok) return;
      const data = await res.json();
      const ids = new Set<string>(data.trending?.map((t: { productId: string }) => t.productId) ?? []);
      const ranks = new Map<string, number>(
        (data.trending ?? []).map((t: { productId: string; rank: number }) => [t.productId, t.rank])
      );
      set({ trendingIds: ids, ranks, lastFetch: now });
    } catch {
      // non-critical
    }
  },
}));
