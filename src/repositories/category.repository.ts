import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";

export async function findAllCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: true,
      _count: { select: { posts: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function findCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      children: true,
      posts: {
        include: {
          post: {
            include: {
              categories: { include: { category: true } },
              tags: { include: { tag: true } },
              linkedProject: true,
            },
          },
        },
      },
      projects: {
        where: { project: { status: { not: ProjectStatus.ARCHIVED } } },
        include: {
          project: {
            include: {
              categories: { include: { category: true } },
              items: { select: { id: true, type: true } },
            },
          },
        },
      },
      _count: { select: { posts: true } },
    },
  });
}

export async function findPublishedDocItemsByCategory(categoryId: string) {
  return prisma.projectItem.findMany({
    where: {
      type: "DOC",
      status: "PUBLISHED",
      project: {
        categories: { some: { categoryId } },
        status: { not: ProjectStatus.ARCHIVED },
      },
    },
    include: {
      project: true,
      section: true,
    },
    orderBy: { order: "asc" },
  });
}

export async function findCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: { children: true, _count: { select: { posts: true } } },
  });
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
}) {
  return prisma.category.create({ data });
}

export async function updateCategory(id: string, data: Partial<{
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  parentId: string | null;
}>) {
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  // Orphan children first
  await prisma.category.updateMany({
    where: { parentId: id },
    data: { parentId: null },
  });
  return prisma.category.delete({ where: { id } });
}

export async function categorySlugExists(slug: string) {
  const cat = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
  return !!cat;
}
