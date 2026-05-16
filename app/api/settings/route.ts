import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const DEFAULTS: Record<string, string> = {
  whatsappNumber: "+250788628417",
};

export async function GET() {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map: Record<string, string> = { ...DEFAULTS };
    for (const row of rows) map[row.key] = row.value;
    return NextResponse.json(map);
  } catch {
    return NextResponse.json(DEFAULTS);
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const allowed = ["whatsappNumber"];
  const updates = Object.entries(body).filter(([k]) => allowed.includes(k));

  if (updates.length === 0) {
    return NextResponse.json({ error: "No valid keys" }, { status: 400 });
  }

  await Promise.all(
    updates.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: value as string },
        create: { key, value: value as string },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
