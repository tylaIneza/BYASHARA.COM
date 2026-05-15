import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    const mapped = notifications.map((n) => ({
      ...n,
      createdAt: n.createdAt.getTime(),
    }));
    return NextResponse.json(mapped);
  } catch (err) {
    console.error("[NOTIFICATIONS_GET]", err);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const notif = await prisma.notification.create({ data: body });
    return NextResponse.json({ ...notif, createdAt: notif.createdAt.getTime() });
  } catch (err) {
    console.error("[NOTIFICATIONS_POST]", err);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.notification.deleteMany();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[NOTIFICATIONS_DELETE_ALL]", err);
    return NextResponse.json({ error: "Failed to clear notifications" }, { status: 500 });
  }
}
