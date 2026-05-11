import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding BOUTIQUE BYASHARA database...");

  // Admin user
  const adminPassword = await bcrypt.hash("admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@byashara.com" },
    update: {},
    create: {
      email: "admin@byashara.com",
      name: "Boutique Byashara Admin",
      password: adminPassword,
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅ Admin:", admin.email);

  // Vendor user
  const vendorPassword = await bcrypt.hash("vendor@123", 12);
  const vendorUser = await prisma.user.upsert({
    where: { email: "vendor@techkigali.com" },
    update: {},
    create: {
      email: "vendor@techkigali.com",
      name: "TechKigali Manager",
      password: vendorPassword,
      role: "VENDOR",
    },
  });

  const vendor = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      businessName: "TechKigali Ltd",
      description: "Leading electronics distributor in Kigali",
      phone: "+250780000001",
      whatsapp: "+250780000001",
      address: "Kigali, Rwanda",
      status: "VERIFIED",
    },
  });
  console.log("✅ Vendor:", vendor.businessName);

  // Categories
  const categories = [
    { name: "Smartphones", slug: "smartphones", icon: "smartphone" },
    { name: "Laptops", slug: "laptops", icon: "laptop" },
    { name: "TVs", slug: "tvs", icon: "tv" },
    { name: "Audio", slug: "audio", icon: "speaker" },
    { name: "Networking", slug: "networking", icon: "wifi" },
    { name: "CCTV & Security", slug: "cctv", icon: "camera" },
    { name: "Gaming", slug: "gaming", icon: "gamepad" },
    { name: "Solar Electronics", slug: "solar", icon: "sun" },
    { name: "Smart Home", slug: "smart-home", icon: "home" },
    { name: "Accessories", slug: "accessories", icon: "zap" },
    { name: "Printers", slug: "printers", icon: "printer" },
    { name: "Repair Tools", slug: "repair-tools", icon: "wrench" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Categories seeded");

  // Provinces
  const provinces = [
    { name: "Kigali City", country: "RWANDA" as const, shippingFee: 2000, deliveryDays: 1 },
    { name: "Eastern Province", country: "RWANDA" as const, shippingFee: 5000, deliveryDays: 2 },
    { name: "Western Province", country: "RWANDA" as const, shippingFee: 5000, deliveryDays: 2 },
    { name: "Northern Province", country: "RWANDA" as const, shippingFee: 5000, deliveryDays: 2 },
    { name: "Southern Province", country: "RWANDA" as const, shippingFee: 5000, deliveryDays: 2 },
    { name: "Goma, North Kivu", country: "DRC" as const, shippingFee: 15000, deliveryDays: 4 },
    { name: "Bukavu, South Kivu", country: "DRC" as const, shippingFee: 15000, deliveryDays: 5 },
  ];

  for (const p of provinces) {
    await prisma.province.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
  }
  console.log("✅ Provinces seeded");

  // Site settings
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      whatsappNumber: "+250788628417",
      currency: "RWF",
      siteName: "BOUTIQUE BYASHARA",
    },
  });
  console.log("✅ Site settings seeded");

  console.log("\n🎉 BOUTIQUE BYASHARA database seeded successfully!");
  console.log("\nCredentials:");
  console.log("  Admin: admin@byashara.com / admin@123");
  console.log("  Vendor: vendor@techkigali.com / vendor@123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
