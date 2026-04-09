import { PrismaClient, PostStatus, PostType, ProjectStatus, ItemStatus, ProjectItemType } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

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

const tags = [
  { name: "React", slug: "react" },
  { name: "Node.js", slug: "nodejs" },
  { name: "TypeScript", slug: "typescript" },
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "Docker", slug: "docker" },
  { name: "AWS", slug: "aws" },
  { name: "Tailwind CSS", slug: "tailwind-css" },
  { name: "Prisma", slug: "prisma" },
];

async function main() {
  console.log("Seeding categories...");
  const createdCategories = [];
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories.push(created);
  }

  console.log("Seeding tags...");
  const createdTags = [];
  for (const tag of tags) {
    const created = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
    createdTags.push(created);
  }

  console.log("Seeding admin user...");
  const password = process.env.ADMIN_PASSWORD || "changeme";
  const hash = await bcrypt.hash(password, 12);
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: hash,
    },
  });

  console.log("Seeding projects...");
  const project = await prisma.project.upsert({
    where: { slug: "tech-blog-template" },
    update: {},
    create: {
      name: "Modern Tech Blog Template",
      slug: "tech-blog-template",
      description: "A high-performance, SEO-optimized tech blog template built with Next.js 15, Prisma, and Tailwind CSS.",
      status: ProjectStatus.ACTIVE,
      repoUrl: "https://github.com/example/tech-blog",
      liveUrl: "https://tech-blog-demo.vercel.app",
      techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL"],
      body: "## About this project\n\nThis project was built to provide a modern foundation for developers to share their technical knowledge...",
      categories: {
        create: [
          { category: { connect: { slug: "nextjs" } } },
          { category: { connect: { slug: "architecture" } } },
        ]
      }
    },
  });

  console.log("Seeding project sections...");
  const section1 = await prisma.projectSection.create({
    data: {
      title: "Getting Started",
      order: 1,
      projectId: project.id,
    }
  });

  console.log("Seeding posts...");
  const posts = [
    {
      title: "Mastering Next.js 15 Server Components",
      slug: "mastering-nextjs-15-server-components",
      excerpt: "A deep dive into the latest patterns and best practices for Server Components in Next.js 15.",
      body: "Server Components are the foundation of modern Next.js applications...",
      status: PostStatus.PUBLISHED,
      type: PostType.CONCEPT,
      publishedAt: new Date(),
      categories: {
        create: [{ category: { connect: { slug: "nextjs" } } }]
      },
      tags: {
        create: [
          { tag: { connect: { slug: "react" } } },
          { tag: { connect: { slug: "typescript" } } }
        ]
      }
    },
    {
      title: "Optimizing PostgreSQL Performance",
      slug: "optimizing-postgresql-performance",
      excerpt: "Learn how to identify and fix common performance bottlenecks in PostgreSQL databases.",
      body: "Performance optimization is a critical skill for any backend developer...",
      status: PostStatus.PUBLISHED,
      type: PostType.CONCEPT,
      publishedAt: new Date(),
      categories: {
        create: [{ category: { connect: { slug: "databases" } } }]
      },
      tags: {
        create: [
          { tag: { connect: { slug: "postgresql" } } },
          { tag: { connect: { slug: "prisma" } } }
        ]
      }
    },
    {
      title: "Building a Design System with Tailwind CSS",
      slug: "design-system-tailwind",
      excerpt: "How to leverage Tailwind's utility-first approach to create a scalable design system.",
      body: "Utility-first CSS has changed the way we build interfaces...",
      status: PostStatus.DRAFT,
      type: PostType.TOOL,
      categories: {
        create: [{ category: { connect: { slug: "frontend" } } }]
      },
      tags: {
        create: [{ tag: { connect: { slug: "tailwind-css" } } }]
      }
    }
  ];

  for (const postData of posts) {
    await prisma.post.upsert({
      where: { slug: postData.slug },
      update: {},
      create: postData,
    });
  }

  console.log("Linking post to project...");
  const nextjsPost = await prisma.post.findUnique({ where: { slug: "mastering-nextjs-15-server-components" } });
  if (nextjsPost) {
    await prisma.projectItem.create({
      data: {
        type: ProjectItemType.POST,
        order: 1,
        slug: "mastering-nextjs-15",
        projectId: project.id,
        sectionId: section1.id,
        postId: nextjsPost.id,
        status: ItemStatus.PUBLISHED,
      }
    });

    // Also link it via the direct relation if needed
    await prisma.post.update({
      where: { id: nextjsPost.id },
      data: { linkedProjectId: project.id }
    });
  }

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
