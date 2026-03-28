import { prisma } from "@/lib/prisma";

export async function findOrCreateTag(name: string, slug: string) {
  return prisma.tag.upsert({
    where: { slug },
    update: {},
    create: { name, slug },
  });
}

export async function findAllTags() {
  return prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
}
