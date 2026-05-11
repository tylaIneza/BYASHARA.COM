"use client";

import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Package, Store, MessageCircle,
  Users, Truck, ShoppingBag, ArrowUpRight, AlertTriangle,
  CheckCircle2, Clock, Zap, Eye,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";

const REVENUE_DATA = [
  { month: "Dec", revenue: 280_000_000, orders: 420 },
  { month: "Jan", revenue: 320_000_000, orders: 510 },
  { month: "Feb", revenue: 290_000_000, orders: 460 },
  { month: "Mar", revenue: 380_000_000, orders: 620 },
  { month: "Apr", revenue: 420_000_000, orders: 690 },
  { month: "May", revenue: 480_000_000, orders: 780 },
];

const PROVINCE_DATA = [
  { name: "Kigali", orders: 340, revenue: 210_000_000 },
  { name: "Eastern", orders: 180, revenue: 95_000_000 },
  { name: "Western", orders: 120, revenue: 72_000_000 },
  { name: "Northern", orders: 90, revenue: 48_000_000 },
  { name: "Southern", orders: 75, revenue: 38_000_000 },
  { name: "Goma DRC", orders: 55, revenue: 30_000_000 },
  { name: "Bukavu DRC", orders: 30, revenue: 18_000_000 },
];

const CATEGORY_DATA = [
  { name: "Smartphones", value: 35, color: "#FF6B00" },
  { name: "Laptops", value: 22, color: "#3B82F6" },
  { name: "TVs", value: 15, color: "#10B981" },
  { name: "Audio", value: 12, color: "#8B5CF6" },
  { name: "Others", value: 16, color: "#6B7280" },
];

const RECENT_ORDERS = [
  { id: "BYA-K3X2A", customer: "Samuel K.", product: "iPhone 15 Pro ×50", amount: 44_500_000, province: "Kigali", status: "CONFIRMED", time: "2 min ago" },
  { id: "BYA-M9P1B", customer: "Marie C.", product: "Samsung TV ×10", amount: 7_500_000, province: "Goma, DRC", status: "PENDING", time: "8 min ago" },
  { id: "BYA-L4Q7C", customer: "Patrick N.", product: "HP Laptop ×20", amount: 24_000_000, province: "Musanze", status: "DISPATCHED", time: "15 min ago" },
  { id: "BYA-A2R5D", customer: "Aline M.", product: "JBL Speaker ×100", amount: 18_000_000, province: "Huye", status: "DELIVERED", time: "1h ago" },
  { id: "BYA-J8S3E", customer: "Jean P.", product: "CCTV Kit ×5", amount: 3_750_000, province: "Bukavu, DRC", status: "PENDING", time: "2h ago" },
];

const STATUS_CONFIG = {
  PENDING: { color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20", label: "Pending" },
  CONFIRMED: { color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20", label: "Confirmed" },
  DISPATCHED: { color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20", label: "Dispatched" },
  DELIVERED: { color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", label: "Delivered" },
  CANCELLED: { color: "text-red-400", bg: "bg-red-400/10 border-red-400/20", label: "Cancelled" },
};

function KpiCard({ title, value, sub, icon: Icon, trend, color, delay }: {
  title: string; value: string; sub?: string; icon: React.ElementType;
  trend?: number; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#111111] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 transition-all"
    >
      <div className={`absolute top-0 right-0 h-24 w-24 rounded-full blur-2xl opacity-20 ${color}`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color} bg-opacity-10`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-black text-white mb-0.5">{value}</div>
      <div className="text-xs text-gray-500">{title}</div>
      {sub && <div className="text-[11px] text-gray-600 mt-1">{sub}</div>}
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">BYASHARA.COM — Electronics Wholesale Analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
          </span>
        </div>
      </div>

      {/* Alert banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3.5"
      >
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
        <p className="text-sm text-amber-300 font-medium">
          5 vendors awaiting verification · 12 products pending approval · 3 low-stock alerts
        </p>
        <button className="ml-auto text-xs text-amber-400 hover:text-white font-semibold underline">Review</button>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Revenue (May)" value="RWF 480M" sub="Across all vendors" icon={TrendingUp} trend={14.5} color="bg-[#FF6B00] text-[#FF6B00]" delay={0} />
        <KpiCard title="WhatsApp Orders" value="780" sub="This month" icon={MessageCircle} trend={22.1} color="bg-green-500 text-green-400" delay={0.05} />
        <KpiCard title="Active Products" value="12,540" sub="320 vendors" icon={Package} trend={8.3} color="bg-blue-500 text-blue-400" delay={0.1} />
        <KpiCard title="Pending Approval" value="47" sub="Products + vendors" icon={Clock} color="bg-amber-500 text-amber-400" delay={0.15} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Verified Vendors" value="320" icon={Store} trend={5.2} color="bg-violet-500 text-violet-400" delay={0.2} />
        <KpiCard title="Total Customers" value="8,420" sub="Guest buyers" icon={Users} trend={18.7} color="bg-pink-500 text-pink-400" delay={0.25} />
        <KpiCard title="Deliveries Today" value="142" sub="All provinces" icon={Truck} color="bg-teal-500 text-teal-400" delay={0.3} />
        <KpiCard title="Flash Sale Items" value="28" sub="Active deals" icon={Zap} color="bg-orange-500 text-orange-400" delay={0.35} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-[#111111] border border-white/10 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-white">Revenue Overview</h3>
              <p className="text-xs text-gray-500">6-month revenue trend (RWF)</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <TrendingUp className="h-3.5 w-3.5" /> +14.5% vs last month
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_DATA}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
              <Tooltip
                contentStyle={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: 12 }}
                formatter={(v: number) => [formatCurrency(v, "RWF"), "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-[#111111] border border-white/10 rounded-2xl p-5"
        >
          <h3 className="text-sm font-bold text-white mb-1">Sales by Category</h3>
          <p className="text-xs text-gray-500 mb-4">Top electronics categories</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {CATEGORY_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {CATEGORY_DATA.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ background: cat.color }} />
                  <span className="text-gray-400">{cat.name}</span>
                </div>
                <span className="font-semibold text-white">{cat.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Province chart + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Province */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#111111] border border-white/10 rounded-2xl p-5"
        >
          <h3 className="text-sm font-bold text-white mb-1">Orders by Province</h3>
          <p className="text-xs text-gray-500 mb-4">Rwanda & DRC delivery zones</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={PROVINCE_DATA} layout="vertical" barSize={8}>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6B7280" }} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} width={70} />
              <Tooltip contentStyle={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: 12 }} />
              <Bar dataKey="orders" fill="#FF6B00" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="lg:col-span-2 bg-[#111111] border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">Recent WhatsApp Orders</h3>
            <a href="/admin/orders" className="text-xs text-[#FF6B00] hover:text-white flex items-center gap-1 transition-colors">
              View all <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
          <div className="divide-y divide-white/5">
            {RECENT_ORDERS.map((order, i) => {
              const sc = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-white/2 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#FF6B00]/20 to-[#FF6B00]/5 flex items-center justify-center text-[#FF6B00] text-xs font-bold shrink-0">
                      {order.customer[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-[#FF6B00] transition-colors truncate">{order.customer}</p>
                      <p className="text-xs text-gray-500 truncate">{order.product} · {order.province}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-white">{formatCurrency(order.amount, "RWF")}</p>
                      <p className="text-[10px] text-gray-500">{order.time}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
