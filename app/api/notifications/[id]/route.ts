import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const notif = await prisma.notification.update({ where: { id }, data: body });
    return NextResponse.json({ ...notif, createdAt: notif.createdAt.getTime() });
  } catch (err) {
    console.error("[NOTIFICATIONS_PATCH]", err);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.notification.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[NOTIFICATIONS_DELETE]", err);
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}
