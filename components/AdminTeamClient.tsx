"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Shield, ShieldCheck, UserCog, Mail, Phone, MoreHorizontal } from "lucide-react";

const ROLES = {
  SUPER_ADMIN: { label: "Super Admin", color: "text-[#FF6B00]", bg: "bg-[#FF6B00]/10 border-[#FF6B00]/20", icon: ShieldCheck },
  ADMIN: { label: "Admin", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20", icon: Shield },
  STAFF: { label: "Staff", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", icon: UserCog },
};

const MOCK_TEAM = [
  { id: "t-1", name: "Pacifique Paccy", email: "paccifiquepaccy@gmail.com", phone: "+250 788 628 417", role: "SUPER_ADMIN", dept: "Management", joinedAt: "2024-01-01", active: true },
  { id: "t-2", name: "Amina Uwase", email: "amina.uwase@byashara.rw", phone: "+250 788 100 001", role: "ADMIN", dept: "Operations", joinedAt: "2024-03-15", active: true },
  { id: "t-3", name: "Jean-Pierre Nkurunziza", email: "jp.nkurunziza@byashara.rw", phone: "+250 788 100 002", role: "ADMIN", dept: "Sales", joinedAt: "2024-04-01", active: true },
  { id: "t-4", name: "Grace Iradukunda", email: "grace.i@byashara.rw", phone: "+250 788 100 003", role: "STAFF", dept: "Customer Support", joinedAt: "2024-06-10", active: true },
  { id: "t-5", name: "Eric Habimana", email: "eric.h@byashara.rw", phone: "+250 788 100 004", role: "STAFF", dept: "Warehouse", joinedAt: "2024-07-22", active: false },
  { id: "t-6", name: "Sandra Mukamana", email: "sandra.m@byashara.rw", phone: "+250 788 100 005", role: "STAFF", dept: "Deliveries", joinedAt: "2024-09-01", active: true },
] as const;

type Role = keyof typeof ROLES;

export default function AdminTeamClient() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | Role>("ALL");

  const filtered = MOCK_TEAM.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== "ALL" && m.role !== filter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Team</h1>
          <p className="text-sm text-gray-500 mt-0.5">{MOCK_TEAM.length} team members</p>
        </div>
        <button className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
          <Plus className="h-4 w-4" /> Add Member
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF6B00]/30"
          />
        </div>
        <div className="flex gap-2">
          {(["ALL", "SUPER_ADMIN", "ADMIN", "STAFF"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filter === r ? "bg-[#FF6B00] text-white" : "bg-[#111111] border border-white/10 text-gray-400 hover:text-white"}`}
            >
              {r === "ALL" ? "All" : ROLES[r].label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {["Member", "Department", "Role", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((member, i) => {
                const rc = ROLES[member.role];
                const RoleIcon = rc.icon;
                return (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-white/2 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl gradient-orange flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-[#FF6B00] transition-colors">{member.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Mail className="h-3 w-3 text-gray-600" />
                            <span className="text-[11px] text-gray-500">{member.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">{member.dept}</td>
                    <td className="px-5 py-4">
                      <span className={`flex items-center gap-1.5 w-fit text-[11px] font-semibold px-2.5 py-1 rounded-full border ${rc.bg} ${rc.color}`}>
                        <RoleIcon className="h-3 w-3" />
                        {rc.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${member.active ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-gray-500 bg-white/5 border-white/10"}`}>
                        {member.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{member.joinedAt}</td>
                    <td className="px-5 py-4">
                      <button className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
