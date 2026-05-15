import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, location, total, items, isRetail } = await req.json();
    const trimmed = name.trim();
    const now = new Date();

    const existing = await prisma.customer.findFirst({
      where: { name: { equals: trimmed } },
    });

    let customer;
    if (existing) {
      customer = await prisma.customer.update({
        where: { id: existing.id },
        data: {
          location,
          orderCount: { increment: 1 },
          totalSpent: { increment: total },
          lastOrderAt: now,
          orders: {
            create: { items: JSON.stringify(items), total, location, isRetail },
          },
        },
        include: { orders: { orderBy: { createdAt: "desc" } } },
      });
    } else {
      customer = await prisma.customer.create({
        data: {
          name: trimmed,
          location,
          orderCount: 1,
          totalSpent: total,
          firstOrderAt: now,
          lastOrderAt: now,
          orders: {
            create: { items: JSON.stringify(items), total, location, isRetail },
          },
        },
        include: { orders: { orderBy: { createdAt: "desc" } } },
      });
    }

    return NextResponse.json({
      ...customer,
      firstOrderAt: customer.firstOrderAt.getTime(),
      lastOrderAt: customer.lastOrderAt.getTime(),
      createdAt: customer.createdAt.getTime(),
      orders: customer.orders.map((o) => ({
        ...o,
        items: JSON.parse(o.items),
        createdAt: o.createdAt.getTime(),
      })),
    });
  } catch (err) {
    console.error("[CUSTOMERS_RECORD]", err);
    return NextResponse.json({ error: "Failed to record customer order" }, { status: 500 });
  }
}
