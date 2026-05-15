"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  emoji: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-1",  name: "Smartphones",  slug: "smartphones",  color: "#3B82F6", emoji: "📱" },
  { id: "cat-2",  name: "Laptops",      slug: "laptops",      color: "#8B5CF6", emoji: "💻" },
  { id: "cat-3",  name: "TVs",          slug: "tvs",          color: "#EF4444", emoji: "📺" },
  { id: "cat-4",  name: "Audio",        slug: "audio",        color: "#EC4899", emoji: "🔊" },
  { id: "cat-5",  name: "Networking",   slug: "networking",   color: "#06B6D4", emoji: "📡" },
  { id: "cat-6",  name: "CCTV",         slug: "cctv",         color: "#F59E0B", emoji: "📷" },
  { id: "cat-7",  name: "Gaming",       slug: "gaming",       color: "#10B981", emoji: "🎮" },
  { id: "cat-8",  name: "Solar",        slug: "solar",        color: "#EAB308", emoji: "☀️" },
  { id: "cat-9",  name: "Smart Home",   slug: "smart-home",   color: "#14B8A6", emoji: "🏠" },
  { id: "cat-10", name: "Accessories",  slug: "accessories",  color: "#F97316", emoji: "🔌" },
  { id: "cat-11", name: "Printers",     slug: "printers",     color: "#6366F1", emoji: "🖨️" },
  { id: "cat-12", name: "Repair Tools", slug: "repair-tools", color: "#84CC16", emoji: "🔧" },
];

interface CategoryStore {
  categories: Category[];
  hydrated: boolean;
  addCategory: (cat: Category) => void;
  updateCategory: (id: string, changes: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      categories: DEFAULT_CATEGORIES,
      hydrated: false,
      addCategory: (cat) =>
        set((s) => ({ categories: [...s.categories, cat] })),
      updateCategory: (id, changes) =>
        set((s) => ({
          categories: s.categories.map((c) => c.id === id ? { ...c, ...changes } : c),
        })),
      deleteCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),
    }),
    {
      name: "byashara-categories",
      skipHydration: true,
      partialize: (s) => ({ categories: s.categories }),
      onRehydrateStorage: () => (_state, error) => {
        if (!error) {
          setTimeout(() => useCategoryStore.setState({ hydrated: true }), 0);
        }
      },
    }
  )
);
