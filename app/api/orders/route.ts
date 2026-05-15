import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
    const mapped = orders.map((o) => ({
      ...o,
      items: JSON.parse(o.items),
      createdAt: o.createdAt.getTime(),
    }));
    return NextResponse.json(mapped);
  } catch (err) {
    console.error("[ORDERS_GET]", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, ...rest } = body;
    const order = await prisma.order.create({
      data: { ...rest, items: JSON.stringify(items) },
    });
    return NextResponse.json({
      ...order,
      items,
      createdAt: order.createdAt.getTime(),
    });
  } catch (err) {
    console.error("[ORDERS_POST]", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.order.deleteMany();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[ORDERS_DELETE_ALL]", err);
    return NextResponse.json({ error: "Failed to clear orders" }, { status: 500 });
  }
}
