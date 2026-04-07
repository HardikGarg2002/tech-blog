import { prisma } from "@/lib/prisma";
import { ProjectItemType, ItemStatus } from "@prisma/client";

export async function findItemsByProject(projectId: string) {
  return prisma.projectItem.findMany({
    where: { projectId },
    include: {
      section: true,
      post: {
        include: {
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
        },
      },
    },
    orderBy: { order: "asc" },
  });
}

export async function findItemBySlug(projectId: string, slug: string) {
  return prisma.projectItem.findUnique({
    where: { projectId_slug: { projectId, slug } },
    include: {
      section: true,
      post: {
        include: {
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
        },
      },
    },
  });
}

export async function findItemById(id: string) {
  return prisma.projectItem.findUnique({
    where: { id },
    include: {
      section: true,
      post: {
        include: {
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
        },
      },
    },
  });
}

export async function findPublishedItemBySlug(projectId: string, slug: string) {
  const item = await prisma.projectItem.findUnique({
    where: { projectId_slug: { projectId, slug } },
    include: {
      section: true,
      post: {
        include: {
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
        },
      },
    },
  });

  if (!item) return null;

  if (item.type === ProjectItemType.DOC && item.status !== ItemStatus.PUBLISHED) {
    return null;
  }

  if (item.type === ProjectItemType.POST && item.post?.status !== "PUBLISHED") {
    return null;
  }

  return item;
}

export async function findAllPublishedItems() {
  return prisma.projectItem.findMany({
    where: {
      OR: [
        { type: ProjectItemType.DOC, status: ItemStatus.PUBLISHED },
        { type: ProjectItemType.POST, post: { status: "PUBLISHED" } },
      ],
    },
    select: {
      slug: true,
      project: { select: { slug: true } },
    },
  });
}

export async function createDocItem(data: {
  projectId: string;
  slug: string;
  title: string;
  body: string;
  order: number;
  sectionId?: string;
}) {
  return prisma.projectItem.create({
    data: { ...data, type: ProjectItemType.DOC, status: ItemStatus.DRAFT },
  });
}

export async function createPostItem(data: {
  projectId: string;
  postId: string;
  slug: string;
  order: number;
  sectionId?: string;
}) {
  return prisma.projectItem.create({
    data: { ...data, type: ProjectItemType.POST },
  });
}

export async function updateDocItem(
  id: string,
  data: Partial<{ title: string; body: string; order: number; sectionId: string | null; slug: string; status: ItemStatus }>
) {
  return prisma.projectItem.update({ where: { id }, data });
}

export async function deleteItem(id: string) {
  return prisma.projectItem.delete({ where: { id } });
}

export async function itemSlugExists(projectId: string, slug: string) {
  const item = await prisma.projectItem.findUnique({
    where: { projectId_slug: { projectId, slug } },
    select: { id: true },
  });
  return !!item;
}

export async function getMaxOrder(projectId: string) {
  const result = await prisma.projectItem.aggregate({
    where: { projectId },
    _max: { order: true },
  });
  return result._max.order ?? 0;
}

export async function findAllDocItems() {
  return prisma.projectItem.findMany({
    where: { type: ProjectItemType.DOC },
    include: {
      project: true,
      section: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}
