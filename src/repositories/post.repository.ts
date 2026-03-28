import { prisma } from "@/lib/prisma";
import { PostStatus, Prisma } from "@prisma/client";

export type PostFindManyArgs = {
  status?: PostStatus;
  categorySlug?: string;
  tagSlug?: string;
  page?: number;
  perPage?: number;
};

export async function findManyPosts({
  status = PostStatus.PUBLISHED,
  categorySlug,
  tagSlug,
  page = 1,
  perPage = 10,
}: PostFindManyArgs) {
  const where: Prisma.PostWhereInput = {
    status,
    ...(categorySlug && {
      categories: { some: { category: { slug: categorySlug } } },
    }),
    ...(tagSlug && {
      tags: { some: { tag: { slug: tagSlug } } },
    }),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { categories: { include: { category: true } }, tags: { include: { tag: true } } },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.post.count({ where }),
  ]);

  return { posts, total };
}

export async function findPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: { categories: { include: { category: true } }, tags: { include: { tag: true } } },
  });
}

export async function findPostById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: { categories: { include: { category: true } }, tags: { include: { tag: true } } },
  });
}

export async function findAllPublishedSlugs() {
  return prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    select: { slug: true, updatedAt: true },
  });
}

export async function createPost(data: Prisma.PostUncheckedCreateInput) {
  return prisma.post.create({ data });
}

export async function updatePost(id: string, data: Prisma.PostUncheckedUpdateInput) {
  return prisma.post.update({ where: { id }, data });
}

export async function deletePost(id: string) {
  return prisma.post.delete({ where: { id } });
}

export async function slugExists(slug: string) {
  const post = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
  return !!post;
}

export async function countPosts() {
  return prisma.post.groupBy({ by: ["status"], _count: { _all: true } });
}
