import { z } from "zod";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { PostStatus } from "@prisma/client";
import readingTime from "reading-time";
import { toSlug, uniqueSlug } from "@/lib/slugify";
import { Errors } from "@/lib/errors";
import * as postRepo from "@/repositories/post.repository";
import * as tagRepo from "@/repositories/tag.repository";

/** Invalidates `unstable_cache` entries for public `listPosts` queries. */
export const POSTS_LIST_CACHE_TAG = "posts-list";

function stablePublishedListKey(args: postRepo.PostFindManyArgs): string {
  const base: Record<string, unknown> = {
    status: PostStatus.PUBLISHED,
    page: args.page ?? 1,
    perPage: args.perPage ?? 10,
    categorySlug: args.categorySlug ?? null,
    tagSlug: args.tagSlug ?? null,
    type: args.type ?? null,
    forCard: args.forCard ?? false,
  };
  if (args.linkedProjectId !== undefined) {
    base.linkedProjectId = args.linkedProjectId;
  }
  return JSON.stringify(base);
}

function parsePublishedListKey(key: string): postRepo.PostFindManyArgs {
  const row = JSON.parse(key) as Record<string, unknown>;
  return {
    status: PostStatus.PUBLISHED,
    page: row.page as number,
    perPage: row.perPage as number,
    categorySlug: row.categorySlug === null ? undefined : (row.categorySlug as string),
    tagSlug: row.tagSlug === null ? undefined : (row.tagSlug as string),
    type: row.type === null ? undefined : (row.type as postRepo.PostFindManyArgs["type"]),
    forCard: row.forCard === true,
    ...(typeof row.linkedProjectId !== "undefined"
      ? { linkedProjectId: row.linkedProjectId as string | null }
      : {}),
  };
}

const cachedPublishedPostList = unstable_cache(
  async (argsKey: string) => postRepo.findManyPosts(parsePublishedListKey(argsKey)),
  ["list-posts"],
  { revalidate: 60, tags: [POSTS_LIST_CACHE_TAG] },
);

export async function getAllPublishedSlugs() {
  return postRepo.findAllPublishedSlugs();
}

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional(),
  body: z.string().min(1),
  categories: z.array(z.string()).min(1).max(5),
  tags: z.array(z.string()).optional(),
  featuredImage: z.string().url().optional().or(z.literal("")),
  imageAlt: z.string().optional(),
  seoTitle: z.string().max(60).optional(),
  seoDesc: z.string().max(160).optional(),
  ogImage: z.string().url().optional().or(z.literal("")),
  slug: z.string().optional(),
  type: z.enum(["CONCEPT", "TOOL", "PROJECT_WRITEUP"]).default("CONCEPT"),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export async function createPost(input: CreatePostInput) {
  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) throw Errors.INVALID_INPUT(parsed.error.message);

  const { title, body, tags = [], categories, slug: customSlug, type, ...rest } = parsed.data;

  const slug = await uniqueSlug(
    customSlug ?? title,
    (s) => postRepo.slugExists(s)
  );

  const readMins = Math.ceil(readingTime(body).minutes);

  // Resolve tags
  const tagConnections = await Promise.all(
    tags.map((name) => tagRepo.findOrCreateTag(name, toSlug(name)))
  );

  const post = await postRepo.createPost({
    ...rest,
    title,
    body,
    slug,
    type,
    readingTime: readMins,
    status: PostStatus.DRAFT,
    categories: {
      create: categories.map((categoryId) => ({ categoryId })),
    },
    tags: {
      create: tagConnections.map((tag) => ({ tagId: tag.id })),
    },
  });

  return post;
}

export async function updatePost(id: string, input: Partial<CreatePostInput>) {
  const existing = await postRepo.findPostById(id);
  if (!existing) throw Errors.NOT_FOUND("Post", id);

  const readMins = input.body
    ? Math.ceil(readingTime(input.body).minutes)
    : existing.readingTime;

  // Disconnect all existing relations, reconnect with new ones
  await postRepo.updatePost(id, {
    ...input,
    readingTime: readMins,
    categories: input.categories
      ? {
          deleteMany: {},
          create: input.categories.map((categoryId) => ({ categoryId })),
        }
      : undefined,
    tags: input.tags
      ? {
          deleteMany: {},
          create: await Promise.all(
            input.tags.map(async (name) => {
              const tag = await tagRepo.findOrCreateTag(name, toSlug(name));
              return { tagId: tag.id };
            })
          ),
        }
      : undefined,
  });

  revalidateTag(POSTS_LIST_CACHE_TAG, "max");

  return postRepo.findPostById(id);
}

export async function publishPost(id: string) {
  const post = await postRepo.findPostById(id);
  if (!post) throw Errors.NOT_FOUND("Post", id);

  const updated = await postRepo.updatePost(id, {
    status: PostStatus.PUBLISHED,
    publishedAt: post.publishedAt ?? new Date(),
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidateTag(POSTS_LIST_CACHE_TAG, "max");

  return updated;
}

export async function deletePost(id: string) {
  const post = await postRepo.findPostById(id);
  if (!post) throw Errors.NOT_FOUND("Post", id);

  await postRepo.deletePost(id);

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidateTag(POSTS_LIST_CACHE_TAG, "max");
}

export async function getPublishedPost(slug: string) {
  const post = await postRepo.findPostBySlug(slug);
  if (!post || post.status !== PostStatus.PUBLISHED)
    throw Errors.NOT_FOUND("Post", slug);
  return post;
}

export async function listPosts(args: postRepo.PostFindManyArgs) {
  const status = args.status ?? PostStatus.PUBLISHED;
  const merged: postRepo.PostFindManyArgs = { ...args, status };
  const perPage = merged.perPage ?? 10;

  const { posts, total } =
    status === PostStatus.PUBLISHED
      ? await cachedPublishedPostList(stablePublishedListKey(merged))
      : await postRepo.findManyPosts(merged);

  return {
    data: posts,
    meta: {
      page: merged.page ?? 1,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
}

export async function getUnlinkedPosts() {
  return postRepo.findUnlinkedPublishedPosts();
}

export async function getAdminAllPosts(args: { page?: number; perPage?: number; status?: PostStatus } = {}) {
  const page = args.page ?? 1;
  const perPage = args.perPage ?? 20;
  return postRepo.findManyPosts({ page, perPage, status: args.status });
}

export async function getAdminPost(id: string) {
  const post = await postRepo.findPostById(id);
  if (!post) throw Errors.NOT_FOUND("Post", id);
  return post;
}

