import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    await prisma.notification.updateMany({ where: { read: false }, data: { read: true } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[NOTIFICATIONS_READ_ALL]", err);
    return NextResponse.json({ error: "Failed to mark all read" }, { status: 500 });
  }
}
