import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const order = await prisma.order.update({ where: { id }, data: body });
    return NextResponse.json({ ...order, items: JSON.parse(order.items), createdAt: order.createdAt.getTime() });
  } catch (err) {
    console.error("[ORDERS_PATCH]", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[ORDERS_DELETE]", err);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
