"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Package, MessageCircle,
  Users, ShoppingBag, ArrowUpRight, AlertTriangle,
  Clock, Zap, CheckCircle2, XCircle, Layers,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { useOrderStore } from "@/lib/order-store";
import { useProductStore } from "@/lib/product-store";
import { useCustomerStore } from "@/lib/customer-store";
import { useCategoryStore } from "@/lib/category-store";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  PENDING:    { color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/20",     label: "Pending" },
  CONFIRMED:  { color: "text-blue-400",    bg: "bg-blue-400/10 border-blue-400/20",       label: "Confirmed" },
  PROCESSING: { color: "text-orange-400",  bg: "bg-orange-400/10 border-orange-400/20",   label: "Processing" },
  DISPATCHED: { color: "text-violet-400",  bg: "bg-violet-400/10 border-violet-400/20",   label: "Dispatched" },
  DELIVERED:  { color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", label: "Delivered" },
  CANCELLED:  { color: "text-red-400",     bg: "bg-red-400/10 border-red-400/20",         label: "Cancelled" },
};

const PIE_COLORS = ["#FF6B00","#3B82F6","#10B981","#8B5CF6","#EC4899","#06B6D4","#EAB308","#F97316"];

function KpiCard({ title, value, sub, icon: Icon, trend, colorClass, delay }: {
  title: string; value: string; sub?: string; icon: React.ElementType;
  trend?: number; colorClass: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#111111] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 transition-all"
    >
      <div className={`absolute top-0 right-0 h-24 w-24 rounded-full blur-2xl opacity-15 ${colorClass}`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colorClass} bg-opacity-10`}>
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
      {sub && <div className="text-[11px] text-gray-600 mt-0.5">{sub}</div>}
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const { orders } = useOrderStore();
  const { products } = useProductStore();
  const { customers } = useCustomerStore();
  const { categories } = useCategoryStore();

  /* ── Derived metrics ── */
  const now = new Date();

  const activeOrders    = orders.filter((o) => o.status !== "CANCELLED");
  const totalRevenue    = activeOrders.reduce((s, o) => s + o.total, 0);
  const pendingOrders   = orders.filter((o) => o.status === "PENDING").length;
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED").length;

  const activeProducts  = products.filter((p) => p.status === "ACTIVE").length;
  const pendingProducts = products.filter((p) => p.status === "PENDING" || p.status === "DRAFT").length;
  const lowStockProducts= products.filter((p) => p.status === "ACTIVE" && p.stock < 10).length;

  // Month-over-month revenue comparison
  const thisMonthStart  = startOfMonth(now);
  const lastMonthStart  = startOfMonth(subMonths(now, 1));
  const lastMonthEnd    = endOfMonth(subMonths(now, 1));
  const revenueThisMonth = activeOrders
    .filter((o) => o.createdAt >= thisMonthStart.getTime())
    .reduce((s, o) => s + o.total, 0);
  const revenueLastMonth = activeOrders
    .filter((o) => isWithinInterval(o.createdAt, { start: lastMonthStart, end: lastMonthEnd }))
    .reduce((s, o) => s + o.total, 0);
  const revenueTrend = revenueLastMonth > 0
    ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100)
    : 0;

  /* ── Revenue chart — last 6 months ── */
  const revenueChart = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const monthDate = subMonths(now, 5 - i);
      const start = startOfMonth(monthDate).getTime();
      const end   = endOfMonth(monthDate).getTime();
      const monthOrders = activeOrders.filter((o) => o.createdAt >= start && o.createdAt <= end);
      return {
        month: format(monthDate, "MMM"),
        revenue: monthOrders.reduce((s, o) => s + o.total, 0),
        orders: monthOrders.length,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  /* ── Category pie — count products per category ── */
  const categoryChart = useMemo(() => {
    const counts: Record<string, number> = {};
    products.filter((p) => p.status === "ACTIVE").forEach((p) => {
      if (p.category) counts[p.category] = (counts[p.category] ?? 0) + 1;
    });
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    const total = sorted.reduce((s, [, v]) => s + v, 0) || 1;
    return sorted.map(([name, count], i) => ({
      name,
      value: Math.round((count / total) * 100),
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [products]);

  /* ── Province chart — orders by location ── */
  const provinceChart = useMemo(() => {
    const counts: Record<string, { orders: number; revenue: number }> = {};
    activeOrders.forEach((o) => {
      const key = o.location.split(",")[0].trim();
      if (!counts[key]) counts[key] = { orders: 0, revenue: 0 };
      counts[key].orders  += 1;
      counts[key].revenue += o.total;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1].orders - a[1].orders)
      .slice(0, 7)
      .map(([name, v]) => ({ name, ...v }));
  }, [orders]);

  const recentOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

  /* ── Alert items ── */
  const alerts: string[] = [];
  if (pendingOrders > 0)   alerts.push(`${pendingOrders} order${pendingOrders > 1 ? "s" : ""} awaiting confirmation`);
  if (pendingProducts > 0) alerts.push(`${pendingProducts} product${pendingProducts > 1 ? "s" : ""} pending approval`);
  if (lowStockProducts > 0) alerts.push(`${lowStockProducts} product${lowStockProducts > 1 ? "s" : ""} low on stock`);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">BYASHARA STORE — Live Analytics</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3.5"
        >
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300 font-medium">{alerts.join(" · ")}</p>
          <Link href="/admin/orders" className="ml-auto text-xs text-amber-400 hover:text-white font-semibold underline shrink-0">
            Review
          </Link>
        </motion.div>
      )}

      {/* KPI row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          sub={`${format(now, "MMMM yyyy")}`}
          icon={TrendingUp}
          trend={revenueTrend}
          colorClass="bg-[#FF6B00] text-[#FF6B00]"
          delay={0}
        />
        <KpiCard
          title="WhatsApp Orders"
          value={orders.length.toString()}
          sub={`${pendingOrders} pending`}
          icon={MessageCircle}
          colorClass="bg-green-500 text-green-400"
          delay={0.05}
        />
        <KpiCard
          title="Active Products"
          value={activeProducts.toString()}
          sub={`${categories.length} categories`}
          icon={Package}
          colorClass="bg-blue-500 text-blue-400"
          delay={0.1}
        />
        <KpiCard
          title="Pending Approval"
          value={pendingProducts.toString()}
          sub="Draft + pending products"
          icon={Clock}
          colorClass="bg-amber-500 text-amber-400"
          delay={0.15}
        />
      </div>

      {/* KPI row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Customers"
          value={customers.length.toString()}
          sub="Guest WhatsApp buyers"
          icon={Users}
          colorClass="bg-pink-500 text-pink-400"
          delay={0.2}
        />
        <KpiCard
          title="Delivered Orders"
          value={deliveredOrders.toString()}
          sub="Successfully completed"
          icon={CheckCircle2}
          colorClass="bg-emerald-500 text-emerald-400"
          delay={0.25}
        />
        <KpiCard
          title="This Month Revenue"
          value={formatCurrency(revenueThisMonth)}
          sub={format(now, "MMMM")}
          icon={Zap}
          colorClass="bg-violet-500 text-violet-400"
          delay={0.3}
        />
        <KpiCard
          title="Categories"
          value={categories.length.toString()}
          sub={`${activeProducts} products listed`}
          icon={Layers}
          colorClass="bg-teal-500 text-teal-400"
          delay={0.35}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue area chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-[#111111] border border-white/10 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-white">Revenue Overview</h3>
              <p className="text-xs text-gray-500">Last 6 months · from WhatsApp orders</p>
            </div>
            {revenueTrend !== 0 && (
              <div className={`flex items-center gap-1 text-xs font-semibold ${revenueTrend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {revenueTrend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {revenueTrend >= 0 ? "+" : ""}{revenueTrend}% vs last month
              </div>
            )}
          </div>
          {revenueChart.every((d) => d.revenue === 0) ? (
            <div className="h-[220px] flex flex-col items-center justify-center text-center">
              <ShoppingBag className="h-8 w-8 text-gray-700 mb-2" />
              <p className="text-sm text-gray-500">No orders yet</p>
              <p className="text-xs text-gray-600">Revenue will appear here once orders are placed</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }}
                  tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)} />
                <Tooltip
                  contentStyle={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: 12 }}
                  formatter={(v: number) => [formatCurrency(v), "Revenue"]}
                  labelStyle={{ color: "#fff" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Category pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-[#111111] border border-white/10 rounded-2xl p-5"
        >
          <h3 className="text-sm font-bold text-white mb-1">Products by Category</h3>
          <p className="text-xs text-gray-500 mb-4">Active listings breakdown</p>
          {categoryChart.length === 0 ? (
            <div className="h-[200px] flex flex-col items-center justify-center text-center">
              <Layers className="h-7 w-7 text-gray-700 mb-2" />
              <p className="text-sm text-gray-500">No active products</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={categoryChart} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {categoryChart.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: 12 }}
                    formatter={(v: number) => [`${v}%`, "Share"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {categoryChart.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ background: cat.color }} />
                      <span className="text-gray-400 truncate max-w-[120px]">{cat.name}</span>
                    </div>
                    <span className="font-semibold text-white">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Province chart + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Province bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#111111] border border-white/10 rounded-2xl p-5"
        >
          <h3 className="text-sm font-bold text-white mb-1">Orders by Location</h3>
          <p className="text-xs text-gray-500 mb-4">Rwanda & DRC delivery zones</p>
          {provinceChart.length === 0 ? (
            <div className="h-[240px] flex flex-col items-center justify-center text-center">
              <XCircle className="h-7 w-7 text-gray-700 mb-2" />
              <p className="text-sm text-gray-500">No orders placed yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={provinceChart} layout="vertical" barSize={8}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6B7280" }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }} width={65} />
                <Tooltip
                  contentStyle={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: 12 }}
                  formatter={(v: number) => [v, "Orders"]}
                />
                <Bar dataKey="orders" fill="#FF6B00" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
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
            <Link href="/admin/orders" className="text-xs text-[#FF6B00] hover:text-white flex items-center gap-1 transition-colors">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center px-6">
              <ShoppingBag className="h-8 w-8 text-gray-700 mb-3" />
              <p className="text-sm font-semibold text-white mb-1">No orders yet</p>
              <p className="text-xs text-gray-500">Orders appear here instantly when customers send a WhatsApp order from the cart.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentOrders.map((order, i) => {
                const sc = STATUS_CONFIG[order.status];
                const itemSummary = order.items.map((it) => `${it.name} ×${it.qty}`).join(", ");
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full gradient-orange flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {order.customer[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white group-hover:text-[#FF6B00] transition-colors">
                          {order.customer}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                          {itemSummary} · {order.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-white">{formatCurrency(order.total)}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{order.id}</p>
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.color}`}>
                        {sc.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
