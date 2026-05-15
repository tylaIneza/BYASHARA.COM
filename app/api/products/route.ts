import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    const mapped = products.map((p) => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
    }));
    return NextResponse.json(mapped);
  } catch (err) {
    console.error("[PRODUCTS_GET]", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { images, ...rest } = body;
    const product = await prisma.product.create({
      data: {
        ...rest,
        images: images ? JSON.stringify(images) : null,
      },
    });
    return NextResponse.json({ ...product, images: images ?? [] });
  } catch (err) {
    console.error("[PRODUCTS_POST]", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
