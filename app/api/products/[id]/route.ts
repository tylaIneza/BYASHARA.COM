import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { images, ...rest } = body;
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(images !== undefined && { images: JSON.stringify(images) }),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json({ ...product, images: product.images ? JSON.parse(product.images) : [] });
  } catch (err) {
    console.error("[PRODUCTS_PATCH]", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PRODUCTS_DELETE]", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
