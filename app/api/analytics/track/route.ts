import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, productName, sessionId, visitorId, eventType, value, referrer } = body;

    if (!productId || !sessionId || !visitorId || !eventType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (eventType === "view") {
      // Upsert: unique per [productId, sessionId] — naturally prevents duplicate counting
      await prisma.productView.upsert({
        where: { productId_sessionId: { productId, sessionId } },
        create: { productId, productName: productName ?? "", sessionId, visitorId, referrer },
        update: {},
      });
    } else {
      // Engagement events: add_to_cart, whatsapp_click
      await prisma.productEngagement.create({
        data: { productId, productName: productName ?? "", visitorId, eventType, value: value ?? null },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[TRACK_POST]", err);
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 });
  }
}
