import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "24");
    const skip = (page - 1) * limit;

    const where = {
      status: "ACTIVE" as const,
      ...(category && { category: { slug: category } }),
      ...(q && { name: { contains: q, mode: "insensitive" as const } }),
      ...(featured === "true" && { featured: true }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          priceTiers: { orderBy: { minQty: "asc" } },
          category: true,
          vendor: { select: { businessName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        brand: p.brand,
        moq: p.moq,
        stock: p.stock,
        imageUrl: p.images[0]?.url ?? null,
        price: Number(p.priceTiers[0]?.price ?? 0),
        category: p.category.name,
        vendorName: p.vendor.businessName,
        featured: p.featured,
        soldCount: p.soldCount,
      })),
      total,
      pages: Math.ceil(total / limit),
      page,
    });
  } catch (err) {
    console.error("[PRODUCTS_GET]", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
