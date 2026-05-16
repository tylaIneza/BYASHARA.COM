import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const ago24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const ago7d  = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Fetch raw view data in parallel
    const [views24h, views7d, engagements7d, viewsToday, allViewsToday] = await Promise.all([
      prisma.productView.groupBy({
        by: ["productId", "productName"],
        where: { createdAt: { gte: ago24h } },
        _count: { id: true },
      }),
      prisma.productView.groupBy({
        by: ["productId"],
        where: { createdAt: { gte: ago7d } },
        _count: { id: true },
      }),
      prisma.productEngagement.groupBy({
        by: ["productId", "eventType"],
        where: { createdAt: { gte: ago7d } },
        _count: { id: true },
      }),
      // unique visitors today (by visitorId)
      prisma.productView.findMany({
        where: { createdAt: { gte: startOfToday } },
        select: { visitorId: true },
        distinct: ["visitorId"],
      }),
      // total views today (raw count)
      prisma.productView.count({ where: { createdAt: { gte: startOfToday } } }),
    ]);

    // Build lookup maps
    const views7dMap = new Map(views7d.map((v) => [v.productId, v._count.id]));

    const engMap = new Map<string, { cartAdds: number; waClicks: number }>();
    for (const e of engagements7d) {
      const ex = engMap.get(e.productId) ?? { cartAdds: 0, waClicks: 0 };
      if (e.eventType === "add_to_cart")    ex.cartAdds  += e._count.id;
      if (e.eventType === "whatsapp_click") ex.waClicks  += e._count.id;
      engMap.set(e.productId, ex);
    }

    // Fetch product slugs/images for trending products
    const productIds = views24h.map((v) => v.productId);
    const products = productIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, slug: true, imageUrl: true, price: true, salePrice: true, currency: true, category: true },
        })
      : [];
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Compute trending scores
    const trending = views24h
      .map((v) => {
        const v7d = views7dMap.get(v.productId) ?? 0;
        const eng = engMap.get(v.productId) ?? { cartAdds: 0, waClicks: 0 };
        const trendScore = v._count.id * 3 + v7d + eng.cartAdds * 2 + eng.waClicks * 2;
        const product = productMap.get(v.productId);
        return {
          productId:   v.productId,
          productName: v.productName,
          slug:        product?.slug ?? "",
          imageUrl:    product?.imageUrl ?? null,
          price:       product?.price ?? 0,
          salePrice:   product?.salePrice ?? null,
          currency:    product?.currency ?? "RWF",
          category:    product?.category ?? "",
          views24h:    v._count.id,
          views7d:     v7d,
          cartAdds:    eng.cartAdds,
          waClicks:    eng.waClicks,
          trendScore,
        };
      })
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, 10)
      .map((item, i) => ({ ...item, rank: i + 1 }));

    // Hourly view counts for the last 24 hours
    const hourlyMap = new Map<string, number>();
    for (let h = 23; h >= 0; h--) {
      const d = new Date(now.getTime() - h * 60 * 60 * 1000);
      const key = `${String(d.getHours()).padStart(2, "0")}:00`;
      hourlyMap.set(key, 0);
    }
    const rawHourly = await prisma.productView.findMany({
      where: { createdAt: { gte: ago24h } },
      select: { createdAt: true },
    });
    for (const row of rawHourly) {
      const key = `${String(row.createdAt.getHours()).padStart(2, "0")}:00`;
      if (hourlyMap.has(key)) hourlyMap.set(key, (hourlyMap.get(key) ?? 0) + 1);
    }
    const hourlyViews = [...hourlyMap.entries()].map(([hour, views]) => ({ hour, views }));

    return NextResponse.json({
      trending,
      viewsToday: allViewsToday,
      uniqueVisitorsToday: viewsToday.length,
      hourlyViews,
    });
  } catch (err) {
    console.error("[TRENDING_GET]", err);
    return NextResponse.json({ error: "Failed to fetch trending data" }, { status: 500 });
  }
}
