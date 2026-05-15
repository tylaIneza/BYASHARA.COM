import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: { orders: { orderBy: { createdAt: "desc" } } },
      orderBy: { lastOrderAt: "desc" },
    });
    const mapped = customers.map((c) => ({
      ...c,
      firstOrderAt: c.firstOrderAt.getTime(),
      lastOrderAt: c.lastOrderAt.getTime(),
      createdAt: c.createdAt.getTime(),
      orders: c.orders.map((o) => ({
        ...o,
        items: JSON.parse(o.items),
        createdAt: o.createdAt.getTime(),
      })),
    }));
    return NextResponse.json(mapped);
  } catch (err) {
    console.error("[CUSTOMERS_GET]", err);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.customer.deleteMany();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[CUSTOMERS_DELETE_ALL]", err);
    return NextResponse.json({ error: "Failed to clear customers" }, { status: 500 });
  }
}
