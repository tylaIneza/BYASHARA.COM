"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Shield, ShieldCheck, Mail, Trash2,
  X, Eye, EyeOff, RefreshCw, User, KeyRound, Pencil,
  AlertTriangle, Check,
} from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

/* ── Types ── */
interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
  createdAt: string;
}

/* ── Role config ── */
const ROLE_META = {
  SUPER_ADMIN: {
    label: "Super Admin",
    desc: "Full access — manage users, all settings, delete data",
    color: "text-[#FF6B00]",
    bg: "bg-[#FF6B00]/10 border-[#FF6B00]/30",
    icon: ShieldCheck,
  },
  ADMIN: {
    label: "Admin",
    desc: "Standard access — manage products, orders, customers",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/30",
    icon: Shield,
  },
};

/* ── Modal backdrop ── */
function Backdrop({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
      onClick={onClose}
    />
  );
}

/* ── Create / Edit User Modal ── */
function UserModal({
  mode,
  user,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  user?: AdminUser;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"SUPER_ADMIN" | "ADMIN">(user?.role ?? "ADMIN");
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEdit = mode === "edit";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return toast.error("Name and email are required");
    if (!isEdit && !password.trim()) return toast.error("Password is required");
    if (password && password.length < 6) return toast.error("Password must be at least 6 characters");

    setSaving(true);
    try {
      const body: Record<string, string> = { name: name.trim(), email: email.trim(), role };
      if (password) body.password = password;

      const res = await fetch(
        isEdit ? `/api/users/${user!.id}` : "/api/users",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast.success(isEdit ? "User updated" : "User created");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Backdrop onClose={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center">
                {isEdit ? <Pencil className="h-4 w-4 text-[#FF6B00]" /> : <Plus className="h-4 w-4 text-[#FF6B00]" />}
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">{isEdit ? "Edit User" : "Create New User"}</h2>
                <p className="text-[11px] text-gray-500">{isEdit ? "Update info or change role" : "Add an admin account"}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amina Uwase"
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF6B00]/40 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@byashara.rw"
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF6B00]/40 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Password{" "}
                {isEdit && <span className="text-gray-600 font-normal">(leave blank to keep current)</span>}
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEdit ? "Leave blank to keep current" : "Min. 6 characters"}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF6B00]/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">Role & Privileges</label>
              <div className="grid grid-cols-2 gap-2">
                {(["ADMIN", "SUPER_ADMIN"] as const).map((r) => {
                  const meta = ROLE_META[r];
                  const RIcon = meta.icon;
                  const selected = role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selected ? meta.bg : "bg-[#1A1A1A] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <RIcon className={`h-3.5 w-3.5 ${selected ? meta.color : "text-gray-500"}`} />
                        <span className={`text-xs font-bold ${selected ? meta.color : "text-gray-400"}`}>
                          {meta.label}
                        </span>
                        {selected && <Check className={`h-3 w-3 ml-auto ${meta.color}`} />}
                      </div>
                      <p className="text-[10px] text-gray-600 leading-tight">{meta.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e55f00] disabled:opacity-60 text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                {saving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                {isEdit ? "Save Changes" : "Create User"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}

/* ── Delete Confirm Modal ── */
function DeleteModal({
  user,
  onClose,
  onDeleted,
}: {
  user: AdminUser;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete");
      toast.success(`${user.name} removed`);
      onDeleted();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Backdrop onClose={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-sm bg-[#111111] border border-white/10 rounded-2xl shadow-2xl p-6 text-center">
          <div className="h-14 w-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Delete User?</h3>
          <p className="text-sm text-gray-400 mb-1">
            <span className="text-white font-semibold">{user.name}</span> will lose all access immediately.
          </p>
          <p className="text-xs text-gray-600 mb-6">{user.email}</p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              {deleting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ── Main Component ── */
export default function AdminTeamClient() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"ALL" | "SUPER_ADMIN" | "ADMIN">("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) setUsers(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filtered = users.filter((u) => {
    if (filterRole !== "ALL" && u.role !== filterRole) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const superAdminCount = users.filter((u) => u.role === "SUPER_ADMIN").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Team & Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? "Loading…" : `${users.length} admin ${users.length === 1 ? "account" : "accounts"}`}
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
        >
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      {/* Privilege info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(["SUPER_ADMIN", "ADMIN"] as const).map((r) => {
          const meta = ROLE_META[r];
          const Icon = meta.icon;
          const count = users.filter((u) => u.role === r).length;
          return (
            <div key={r} className={`flex items-start gap-3 p-4 rounded-xl border ${meta.bg}`}>
              <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${meta.color}`} />
              <div>
                <p className={`text-xs font-bold ${meta.color}`}>
                  {meta.label} &middot; {count} {count === 1 ? "user" : "users"}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">{meta.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF6B00]/30"
          />
        </div>
        <div className="flex gap-2">
          {(["ALL", "SUPER_ADMIN", "ADMIN"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                filterRole === r
                  ? "bg-[#FF6B00] text-white"
                  : "bg-[#111111] border border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              {r === "ALL" ? "All Roles" : ROLE_META[r].label}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-xl bg-white/5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-40 bg-white/5 rounded" />
                  <div className="h-2.5 w-56 bg-white/5 rounded" />
                </div>
                <div className="h-6 w-24 bg-white/5 rounded-full" />
                <div className="h-6 w-20 bg-white/5 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-600 text-sm">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {["User", "Email", "Role & Privileges", "Joined", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((user, i) => {
                  const meta = ROLE_META[user.role];
                  const RIcon = meta.icon;
                  const isMe = session?.user?.email === user.email;
                  const isLastSuperAdmin = user.role === "SUPER_ADMIN" && superAdminCount <= 1;
                  const canDelete = !isMe && !isLastSuperAdmin;

                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl gradient-orange flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-white group-hover:text-[#FF6B00] transition-colors">
                              {user.name}
                            </p>
                            {isMe && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30">
                                YOU
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Mail className="h-3 w-3 text-gray-600 shrink-0" />
                          {user.email}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${meta.bg} ${meta.color}`}>
                          <RIcon className="h-3 w-3" />
                          {meta.label}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditUser(user)}
                            title="Edit user"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-all"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => canDelete && setDeleteUser(user)}
                            disabled={!canDelete}
                            title={
                              isMe
                                ? "Cannot delete your own account"
                                : isLastSuperAdmin
                                ? "Cannot delete the last Super Admin"
                                : "Delete user"
                            }
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {createOpen && (
          <UserModal
            mode="create"
            onClose={() => setCreateOpen(false)}
            onSaved={loadUsers}
          />
        )}
        {editUser && (
          <UserModal
            mode="edit"
            user={editUser}
            onClose={() => setEditUser(null)}
            onSaved={loadUsers}
          />
        )}
        {deleteUser && (
          <DeleteModal
            user={deleteUser}
            onClose={() => setDeleteUser(null)}
            onDeleted={loadUsers}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
