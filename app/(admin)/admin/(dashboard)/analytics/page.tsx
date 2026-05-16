"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  TrendingUp, TrendingDown, BarChart2, Package, Users,
  MessageCircle, MapPin, Star, ShoppingBag, RefreshCw,
  Truck, Clock, CheckCircle2, XCircle, Zap, Award,
} from "lucide-react";

/* ── Types ── */
interface AnalyticsData {
  revenue: { total: number; thisMonth: number; lastMonth: number; today: number; avgOrderValue: number; growth: number };
  orders: { total: number; thisMonth: number; delivered: number; byStatus: Record<string, number> };
  products: {
    total: number; active: number; outOfStock: number;
    topBySales: { name: string; sku: string; soldCount: number; category: string; rating: number }[];
    byCategory: { category: string; count: number; totalSold: number }[];
  };
  customers: {
    total: number; newThisMonth: number;
    topBySpend: { name: string; location: string; totalSpent: number; orderCount: number }[];
  };
  provinces: { location: string; revenue: number; orderCount: number }[];
  vendors: { vendor: string; productCount: number; totalSold: number; avgRating: number }[];
  revenueByDay: { date: string; label: string; revenue: number; orders: number }[];
  revenueByMonth: { month: string; revenue: number; orders: number }[];
}

/* ── Helpers ── */
function fmtRwf(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

const STATUS_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING:    { label: "Pending",    color: "#F59E0B", icon: Clock },
  CONFIRMED:  { label: "Confirmed",  color: "#3B82F6", icon: CheckCircle2 },
  PROCESSING: { label: "Processing", color: "#F97316", icon: RefreshCw },
  DISPATCHED: { label: "Dispatched", color: "#8B5CF6", icon: Truck },
  DELIVERED:  { label: "Delivered",  color: "#10B981", icon: CheckCircle2 },
  CANCELLED:  { label: "Cancelled",  color: "#EF4444", icon: XCircle },
};

const PIE_COLORS = ["#FF6B00","#3B82F6","#10B981","#8B5CF6","#F59E0B","#EC4899","#06B6D4","#F97316","#84CC16","#A78BFA"];

/* ── Sub-components ── */
function KpiCard({
  title, value, sub, icon: Icon, colorClass, trend, delay,
}: {
  title: string; value: string; sub: string; icon: React.ElementType;
  colorClass: string; trend?: number; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#111111] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 transition-all"
    >
      <div className={`absolute top-0 right-0 h-24 w-24 rounded-full blur-2xl opacity-10 ${colorClass}`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-opacity-15 ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-black text-white mb-0.5">{value}</div>
      <div className="text-xs text-gray-500">{title}</div>
      {sub && <div className="text-[11px] text-gray-600 mt-0.5">{sub}</div>}
    </motion.div>
  );
}

function SectionCard({ title, icon: Icon, children, delay = 0, className = "" }: {
  title: string; icon: React.ElementType; children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-[#111111] border border-white/10 rounded-2xl p-5 ${className}`}
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="h-7 w-7 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-[#FF6B00]" />
        </div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function ProgressBar({ value, max, color = "#FF6B00" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-white/5 rounded-xl animate-pulse ${className}`} />;
}

/* ── Custom Tooltip ── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-gray-400 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold text-white">
          {p.name === "revenue" ? `${fmtRwf(p.value)} RWF` : `${p.value} orders`}
        </p>
      ))}
    </div>
  );
}

/* ── Main Page ── */
export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        setData(await res.json());
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString()}`
              : "Loading live data from database…"}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* ── KPI Cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Revenue"
            value={`${fmtRwf(data.revenue.total)} RWF`}
            sub={`Today: ${fmtRwf(data.revenue.today)} RWF`}
            icon={TrendingUp}
            colorClass="bg-[#FF6B00] text-[#FF6B00]"
            trend={data.revenue.growth}
            delay={0}
          />
          <KpiCard
            title="Total Orders"
            value={data.orders.total.toString()}
            sub={`This month: ${data.orders.thisMonth}`}
            icon={MessageCircle}
            colorClass="bg-blue-500 text-blue-400"
            delay={0.05}
          />
          <KpiCard
            title="Total Customers"
            value={data.customers.total.toString()}
            sub={`New this month: ${data.customers.newThisMonth}`}
            icon={Users}
            colorClass="bg-emerald-500 text-emerald-400"
            delay={0.1}
          />
          <KpiCard
            title="Avg Order Value"
            value={`${fmtRwf(data.revenue.avgOrderValue)} RWF`}
            sub={`Delivered: ${data.orders.delivered} orders`}
            icon={ShoppingBag}
            colorClass="bg-violet-500 text-violet-400"
            delay={0.15}
          />
        </div>
      )}

      {/* ── Revenue Trend (30 days) ── */}
      {loading ? (
        <Skeleton className="h-72" />
      ) : data && (
        <SectionCard title="Revenue — Last 30 Days" icon={BarChart2} delay={0.2}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.revenueByDay} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => fmtRwf(v)}
                width={55}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke="#FF6B00"
                strokeWidth={2}
                fill="url(#revGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#FF6B00" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>
      )}

      {/* ── Monthly Revenue + Order Status ── */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Monthly comparison */}
          <SectionCard title="Revenue by Month (6 months)" icon={TrendingUp} delay={0.25}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.revenueByMonth} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmtRwf(v)} width={50} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="revenue" name="revenue" fill="#FF6B00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          {/* Order status breakdown */}
          <SectionCard title="Order Status Breakdown" icon={MessageCircle} delay={0.3}>
            <div className="space-y-3">
              {Object.entries(data.orders.byStatus).map(([status, count]) => {
                const meta = STATUS_META[status] ?? { label: status, color: "#6b7280", icon: Clock };
                const StatusIcon = meta.icon;
                const total = Object.values(data.orders.byStatus).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                        <span className="text-xs text-gray-300">{meta.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{count}</span>
                        <span className="text-[10px] text-gray-600">{pct}%</span>
                      </div>
                    </div>
                    <ProgressBar value={count} max={total} color={meta.color} />
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Province Revenue + Category Pie ── */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      ) : data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Province analytics */}
          <SectionCard title="Revenue by Province / Location" icon={MapPin} delay={0.35}>
            {data.provinces.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {data.provinces.map((p, i) => {
                  const max = data.provinces[0].revenue;
                  return (
                    <div key={p.location}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-600 w-4">{i + 1}</span>
                          <span className="text-xs text-gray-300 truncate max-w-[140px]">{p.location}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] text-gray-500">{p.orderCount} orders</span>
                          <span className="text-xs font-bold text-white">{fmtRwf(p.revenue)} RWF</span>
                        </div>
                      </div>
                      <ProgressBar
                        value={p.revenue}
                        max={max}
                        color={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* Category distribution */}
          <SectionCard title="Products by Category" icon={Package} delay={0.4}>
            {data.products.byCategory.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-8">No products yet</p>
            ) : (
              <div className="flex gap-4 items-center">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie
                      data={data.products.byCategory.slice(0, 8)}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={2}
                    >
                      {data.products.byCategory.slice(0, 8).map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-2 text-xs">
                            <p className="text-white font-bold">{payload[0].name}</p>
                            <p className="text-gray-400">{payload[0].value} products</p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2 min-w-0">
                  {data.products.byCategory.slice(0, 8).map((cat, i) => (
                    <div key={cat.category} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-[11px] text-gray-400 truncate flex-1">{cat.category}</span>
                      <span className="text-[11px] font-semibold text-white shrink-0">{cat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* ── Top Products + Vendor Performance ── */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Top products */}
          <SectionCard title="Top Products by Units Sold" icon={Zap} delay={0.45}>
            {data.products.topBySales.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-8">No sales recorded yet</p>
            ) : (
              <div className="space-y-3">
                {data.products.topBySales.map((p, i) => {
                  const max = data.products.topBySales[0].soldCount;
                  return (
                    <div key={p.sku}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-bold text-[#FF6B00] w-4 shrink-0">#{i + 1}</span>
                          <div className="min-w-0">
                            <p className="text-xs text-white font-medium truncate">{p.name}</p>
                            <p className="text-[10px] text-gray-600">{p.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {p.rating > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                              <Star className="h-2.5 w-2.5 fill-amber-400" />{p.rating.toFixed(1)}
                            </span>
                          )}
                          <span className="text-xs font-bold text-white">{p.soldCount} sold</span>
                        </div>
                      </div>
                      <ProgressBar value={p.soldCount} max={max} color="#FF6B00" />
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* Vendor performance */}
          <SectionCard title="Vendor Performance" icon={Award} delay={0.5}>
            {data.vendors.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-8">No vendor data yet</p>
            ) : (
              <div className="space-y-3">
                {data.vendors.map((v, i) => (
                  <div key={v.vendor} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className="h-8 w-8 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center text-xs font-black text-[#FF6B00] shrink-0">
                      {v.vendor[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{v.vendor}</p>
                      <p className="text-[10px] text-gray-500">{v.productCount} products</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-right">
                      {v.avgRating > 0 && (
                        <div className="flex items-center gap-0.5 text-[10px] text-amber-400">
                          <Star className="h-2.5 w-2.5 fill-amber-400" />
                          {v.avgRating.toFixed(1)}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-white">{v.totalSold}</p>
                        <p className="text-[10px] text-gray-600">sold</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* ── Top Customers ── */}
      {loading ? (
        <Skeleton className="h-64" />
      ) : data && data.customers.topBySpend.length > 0 && (
        <SectionCard title="Top Customers by Revenue" icon={Users} delay={0.55}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left pb-3 text-gray-500 font-medium w-8">#</th>
                  <th className="text-left pb-3 text-gray-500 font-medium">Customer</th>
                  <th className="text-left pb-3 text-gray-500 font-medium">Location</th>
                  <th className="text-center pb-3 text-gray-500 font-medium">Orders</th>
                  <th className="text-right pb-3 text-gray-500 font-medium">Total Spent</th>
                  <th className="text-right pb-3 text-gray-500 font-medium">Avg / Order</th>
                </tr>
              </thead>
              <tbody>
                {data.customers.topBySpend.map((c, i) => (
                  <tr key={c.name} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="py-3 text-gray-600">{i + 1}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-[#FF6B00]/10 flex items-center justify-center text-[10px] font-black text-[#FF6B00]">
                          {c.name[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-white">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-400">{c.location}</td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400 font-bold">{c.orderCount}</span>
                    </td>
                    <td className="py-3 text-right font-bold text-white">{fmtRwf(c.totalSpent)} RWF</td>
                    <td className="py-3 text-right text-gray-400">
                      {c.orderCount > 0 ? `${fmtRwf(c.totalSpent / c.orderCount)} RWF` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* ── Product Stock Summary ── */}
      {loading ? null : data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-4"
        >
          {[
            { label: "Total Products", value: data.products.total, color: "text-white", bg: "bg-white/5" },
            { label: "Active Listings", value: data.products.active, color: "text-emerald-400", bg: "bg-emerald-400/10" },
            { label: "Out of Stock", value: data.products.outOfStock, color: "text-red-400", bg: "bg-red-400/10" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border border-white/10 p-4 text-center ${s.bg}`}>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
