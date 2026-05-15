"use client";

import { create } from "zustand";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  emoji: string;
}

interface CategoryStore {
  categories: Category[];
  hydrated: boolean;
  load: () => Promise<void>;
  addCategory: (cat: Omit<Category, "id">) => Promise<Category>;
  updateCategory: (id: string, changes: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>()((set) => ({
  categories: [],
  hydrated: false,

  load: async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("fetch failed");
      const data: Category[] = await res.json();
      set({ categories: data, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  addCategory: async (cat) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cat),
    });
    const created: Category = await res.json();
    set((s) => ({ categories: [...s.categories, created] }));
    return created;
  },

  updateCategory: async (id, changes) => {
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? { ...c, ...changes } : c)),
    }));
    await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });
  },

  deleteCategory: async (id) => {
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
  },
}));
