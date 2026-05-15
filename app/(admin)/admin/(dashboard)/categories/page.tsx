"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Check, X, Layers, Save } from "lucide-react";
import toast from "react-hot-toast";
import { useCategoryStore, type Category } from "@/lib/category-store";
import { slugify } from "@/lib/utils";

const EMOJI_OPTIONS = ["📱","💻","📺","🔊","📡","📷","🎮","☀️","🏠","🔌","🖨️","🔧","⌚","🖥️","🎧","📦","🔋","🛡️","💡","🖱️","🖲️","🎙️","📻","🔭"];
const COLOR_OPTIONS = [
  "#FF6B00","#3B82F6","#8B5CF6","#EF4444","#EC4899",
  "#06B6D4","#F59E0B","#10B981","#EAB308","#14B8A6",
  "#F97316","#6366F1","#84CC16","#E11D48","#0EA5E9",
];

interface FormState {
  name: string;
  description: string;
  emoji: string;
  color: string;
}

const EMPTY_FORM: FormState = { name: "", description: "", emoji: "📦", color: "#FF6B00" };

export default function AdminCategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore();

  const [mode, setMode] = useState<"idle" | "add" | "edit">("idle");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [search, setSearch] = useState("");

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setMode("add");
  };

  const openEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      description: cat.description ?? "",
      emoji: cat.emoji,
      color: cat.color,
    });
    setEditId(cat.id);
    setMode("edit");
  };

  const closeForm = () => {
    setMode("idle");
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    if (mode === "edit" && editId) {
      updateCategory(editId, {
        name: form.name.trim(),
        slug: slugify(form.name.trim()),
        description: form.description.trim(),
        emoji: form.emoji,
        color: form.color,
      });
      toast.success("Category updated!");
    } else {
      addCategory({
        id: `cat-${Date.now()}`,
        name: form.name.trim(),
        slug: slugify(form.name.trim()),
        description: form.description.trim(),
        emoji: form.emoji,
        color: form.color,
      });
      toast.success("Category added!");
    }
    closeForm();
  };

  const handleDelete = (cat: Category) => {
    if (confirm(`Delete "${cat.name}"? Products in this category will keep their category label.`)) {
      deleteCategory(cat.id);
      toast.success(`"${cat.name}" deleted.`);
    }
  };

  const filtered = categories.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const isFormOpen = mode === "add" || mode === "edit";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} total</p>
        </div>
        {!isFormOpen && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
            <Plus className="h-4 w-4" /> Add Category
          </button>
        )}
      </div>

      {/* ── ADD / EDIT FORM ── */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-[#111111] border border-[#FF6B00]/40 rounded-2xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {mode === "edit" ? "Edit Category" : "New Category"}
              </h3>
              <button onClick={closeForm} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  placeholder="e.g. Smartphones"
                  autoFocus
                  className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF6B00]/60"
                />
                {form.name && (
                  <p className="text-[10px] text-gray-500 mt-1">Slug: /{slugify(form.name)}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  Description <span className="text-gray-600 font-normal normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  placeholder="Short description"
                  className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF6B00]/60"
                />
              </div>

              {/* Emoji */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Icon</label>
                <div className="flex flex-wrap gap-1.5">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                      className={`h-9 w-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                        form.emoji === e
                          ? "bg-[#FF6B00]/20 border-2 border-[#FF6B00]"
                          : "bg-white/5 border border-white/10 hover:border-white/30"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, color: c }))}
                      className="h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all"
                      style={{ background: c, borderColor: form.color === c ? "white" : "transparent", outline: form.color === c ? `2px solid ${c}` : "none", outlineOffset: "2px" }}
                    >
                      {form.color === c && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                    </button>
                  ))}
                </div>

                {/* Preview */}
                <div className="mt-3 inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border" style={{ background: form.color + "18", borderColor: form.color + "50" }}>
                  <span className="text-xl">{form.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-white leading-none">{form.name || "Category Name"}</p>
                    {form.description && <p className="text-[11px] text-gray-400 mt-0.5">{form.description}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleSave}
                className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm"
              >
                <Save className="h-4 w-4" />
                {mode === "edit" ? "Save Changes" : "Add Category"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2.5 border border-white/10 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search categories..."
        className="w-full max-w-sm bg-[#111111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF6B00]/30"
      />

      {/* Table */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Layers className="h-10 w-10 text-gray-600 mb-3" />
            <p className="text-white font-semibold mb-1">No categories yet</p>
            <p className="text-sm text-gray-500 mb-4">Click "Add Category" to create your first one.</p>
            <button onClick={openAdd} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
              <Plus className="h-4 w-4" /> Add Category
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Category</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest hidden md:table-cell">Description</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Color</th>
                <th className="text-right px-4 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {filtered.map((cat) => (
                  <motion.tr
                    key={cat.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-white/2 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-9 w-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                          style={{ background: cat.color + "22", border: `1px solid ${cat.color}55` }}
                        >
                          {cat.emoji}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{cat.name}</p>
                          <p className="text-[11px] text-gray-500">/{cat.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-xs text-gray-400 max-w-xs truncate">
                        {cat.description || <span className="text-gray-600 italic">—</span>}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full border border-white/20 shrink-0" style={{ background: cat.color }} />
                        <span className="text-xs text-gray-500 font-mono hidden sm:inline">{cat.color}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {/* Always-visible action buttons */}
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(cat)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 border border-white/10 hover:border-[#FF6B00]/30 transition-all"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 transition-all"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
