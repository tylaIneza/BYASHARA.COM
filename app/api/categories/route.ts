import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { createdAt: "asc" } });
    return NextResponse.json(categories);
  } catch (err) {
    console.error("[CATEGORIES_GET]", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const category = await prisma.category.create({ data: body });
    return NextResponse.json(category);
  } catch (err) {
    console.error("[CATEGORIES_POST]", err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
