import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[CUSTOMERS_DELETE]", err);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
