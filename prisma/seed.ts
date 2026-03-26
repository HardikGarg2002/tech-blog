import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Next.js", slug: "nextjs", color: "#000000", icon: "Layers" },
  { name: "Databases", slug: "databases", color: "#336791", icon: "Database" },
  { name: "Architecture", slug: "architecture", color: "#6366f1", icon: "GitBranch" },
  { name: "DevOps", slug: "devops", color: "#f97316", icon: "Server" },
  { name: "Frontend", slug: "frontend", color: "#06b6d4", icon: "Monitor" },
  { name: "Backend", slug: "backend", color: "#22c55e", icon: "Code2" },
  { name: "Tools & DX", slug: "tools-dx", color: "#8b5cf6", icon: "Wrench" },
  { name: "AI & ML", slug: "ai-ml", color: "#ec4899", icon: "Cpu" },
];

async function main() {
  console.log("Seeding categories...");
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log("Seeding admin user...");
  // Using ADMIN_PASSWORD from env or "changeme" as fallback
  const password = process.env.ADMIN_PASSWORD || "changeme";
  const hash = await bcrypt.hash(password, 12);
  
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@example.com" },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      passwordHash: hash,
    },
  });

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
