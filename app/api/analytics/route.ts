import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [activeOrders, allOrdersRaw, allProducts, allCustomers] = await Promise.all([
      prisma.order.findMany({
        where: { status: { not: "CANCELLED" } },
        select: { total: true, status: true, location: true, createdAt: true },
      }),
      prisma.order.findMany({
        select: { status: true, total: true, createdAt: true },
      }),
      prisma.product.findMany({
        select: {
          name: true, sku: true, category: true, vendor: true,
          soldCount: true, rating: true, price: true, status: true, stock: true,
        },
      }),
      prisma.customer.findMany({
        select: { name: true, location: true, totalSpent: true, orderCount: true, createdAt: true },
        orderBy: { totalSpent: "desc" },
      }),
    ]);

    // ── Revenue ──
    const totalRevenue = activeOrders.reduce((s, o) => s + o.total, 0);
    const thisMonthActive = activeOrders.filter((o) => o.createdAt >= startOfThisMonth);
    const lastMonthActive = activeOrders.filter(
      (o) => o.createdAt >= startOfLastMonth && o.createdAt <= endOfLastMonth,
    );
    const todayActive = activeOrders.filter((o) => o.createdAt >= startOfToday);

    const thisMonthRevenue = thisMonthActive.reduce((s, o) => s + o.total, 0);
    const lastMonthRevenue = lastMonthActive.reduce((s, o) => s + o.total, 0);
    const todayRevenue = todayActive.reduce((s, o) => s + o.total, 0);
    const avgOrderValue = activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0;
    const revenueGrowth =
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : thisMonthRevenue > 0
        ? 100
        : 0;

    // ── Orders by status ──
    const byStatus: Record<string, number> = {};
    for (const o of allOrdersRaw) {
      byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    }

    // ── Province analytics ──
    const provinceMap = new Map<string, { revenue: number; orderCount: number }>();
    for (const o of activeOrders) {
      const loc = (o.location || "Unknown").trim();
      const ex = provinceMap.get(loc) ?? { revenue: 0, orderCount: 0 };
      provinceMap.set(loc, { revenue: ex.revenue + o.total, orderCount: ex.orderCount + 1 });
    }
    const provinces = [...provinceMap.entries()]
      .map(([location, d]) => ({ location, ...d }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // ── Vendor analytics ──
    const vendorMap = new Map<string, { productCount: number; totalSold: number; ratings: number[] }>();
    for (const p of allProducts) {
      const v = (p.vendor || "").trim();
      if (!v) continue;
      const ex = vendorMap.get(v) ?? { productCount: 0, totalSold: 0, ratings: [] };
      vendorMap.set(v, {
        productCount: ex.productCount + 1,
        totalSold: ex.totalSold + p.soldCount,
        ratings: p.rating > 0 ? [...ex.ratings, p.rating] : ex.ratings,
      });
    }
    const vendors = [...vendorMap.entries()]
      .map(([vendor, d]) => ({
        vendor,
        productCount: d.productCount,
        totalSold: d.totalSold,
        avgRating: d.ratings.length > 0 ? d.ratings.reduce((a, b) => a + b) / d.ratings.length : 0,
      }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 8);

    // ── Top products by sold count ──
    const topProducts = [...allProducts]
      .filter((p) => p.soldCount > 0)
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 8)
      .map((p) => ({
        name: p.name,
        sku: p.sku,
        soldCount: p.soldCount,
        category: p.category,
        rating: p.rating,
      }));

    // ── Category breakdown ──
    const catMap = new Map<string, { count: number; totalSold: number }>();
    for (const p of allProducts) {
      const cat = (p.category || "Uncategorized").trim() || "Uncategorized";
      const ex = catMap.get(cat) ?? { count: 0, totalSold: 0 };
      catMap.set(cat, { count: ex.count + 1, totalSold: ex.totalSold + p.soldCount });
    }
    const byCategory = [...catMap.entries()]
      .map(([category, d]) => ({ category, ...d }))
      .sort((a, b) => b.totalSold - a.totalSold);

    // ── Revenue by day (last 30 days) ──
    const dayMap = new Map<string, { revenue: number; orders: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      dayMap.set(key, { revenue: 0, orders: 0 });
    }
    for (const o of activeOrders) {
      if (o.createdAt < thirtyDaysAgo) continue;
      const key = o.createdAt.toISOString().split("T")[0];
      if (!dayMap.has(key)) continue;
      const ex = dayMap.get(key)!;
      dayMap.set(key, { revenue: ex.revenue + o.total, orders: ex.orders + 1 });
    }
    const revenueByDay = [...dayMap.entries()].map(([date, d]) => ({
      date,
      label: date.slice(5), // MM-DD
      ...d,
    }));

    // ── Revenue by month (last 6 months) ──
    const monthMap = new Map<string, { revenue: number; orders: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("default", { month: "short" });
      monthMap.set(key, { revenue: 0, orders: 0 });
      void label;
    }
    for (const o of allOrdersRaw) {
      if (o.status === "CANCELLED") continue;
      const d = o.createdAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap.has(key)) continue;
      const ex = monthMap.get(key)!;
      monthMap.set(key, { revenue: ex.revenue + o.total, orders: ex.orders + 1 });
    }
    const revenueByMonth = [...monthMap.entries()].map(([key, d]) => {
      const [year, month] = key.split("-");
      const date = new Date(Number(year), Number(month) - 1, 1);
      return {
        month: date.toLocaleString("default", { month: "short" }),
        ...d,
      };
    });

    return NextResponse.json({
      revenue: {
        total: totalRevenue,
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        today: todayRevenue,
        avgOrderValue,
        growth: revenueGrowth,
      },
      orders: {
        total: allOrdersRaw.length,
        thisMonth: thisMonthActive.length,
        delivered: activeOrders.filter((o) => o.status === "DELIVERED").length,
        byStatus,
      },
      products: {
        total: allProducts.length,
        active: allProducts.filter((p) => p.status === "ACTIVE").length,
        outOfStock: allProducts.filter((p) => p.stock === 0).length,
        topBySales: topProducts,
        byCategory,
      },
      customers: {
        total: allCustomers.length,
        newThisMonth: allCustomers.filter((c) => c.createdAt >= startOfThisMonth).length,
        topBySpend: allCustomers.slice(0, 8),
      },
      provinces,
      vendors,
      revenueByDay,
      revenueByMonth,
    });
  } catch (err) {
    console.error("[ANALYTICS_GET]", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
