import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding BYASHARA STORE database...");

  // Default admin user
  const adminPassword = await bcrypt.hash("admin@123", 12);
  await prisma.user.upsert({
    where: { email: "admin@byashara.com" },
    update: {},
    create: {
      email: "admin@byashara.com",
      name: "Byashara Store Admin",
      password: adminPassword,
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅ Admin user seeded: admin@byashara.com / admin@123");

  // Default categories
  const categories = [
    { name: "Smartphones",  slug: "smartphones",  color: "#3B82F6", emoji: "📱" },
    { name: "Laptops",      slug: "laptops",      color: "#8B5CF6", emoji: "💻" },
    { name: "TVs",          slug: "tvs",          color: "#EF4444", emoji: "📺" },
    { name: "Audio",        slug: "audio",        color: "#EC4899", emoji: "🔊" },
    { name: "Networking",   slug: "networking",   color: "#06B6D4", emoji: "📡" },
    { name: "CCTV",         slug: "cctv",         color: "#F59E0B", emoji: "📷" },
    { name: "Gaming",       slug: "gaming",       color: "#10B981", emoji: "🎮" },
    { name: "Solar",        slug: "solar",        color: "#EAB308", emoji: "☀️" },
    { name: "Smart Home",   slug: "smart-home",   color: "#14B8A6", emoji: "🏠" },
    { name: "Accessories",  slug: "accessories",  color: "#F97316", emoji: "🔌" },
    { name: "Printers",     slug: "printers",     color: "#6366F1", emoji: "🖨️" },
    { name: "Repair Tools", slug: "repair-tools", color: "#84CC16", emoji: "🔧" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Categories seeded");

  console.log("\n🎉 Database seeded successfully!");
  console.log("   Login: admin@byashara.com  /  admin@123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
