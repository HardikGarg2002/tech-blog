# Layer Separation Patch Plan
# Modifications to: `claude-code-execution-plan.md`

> **Purpose:** Fix UI / Service / Repository / DB layer separation.
> **Do NOT rewrite the existing plan.** Apply these changes on top of it.
> **Reference spec:** `tech-blog-platform-spec.md`

---

## Architectural Rule — Enforce This Everywhere

The existing plan has API routes calling Prisma directly and pages calling API routes
internally. Replace that with this strict 4-layer call chain:

```
[ UI Layer ]         src/app/** + src/components/**
      │  calls only ▼
[ Service Layer ]    src/services/**
      │  calls only ▼
[ Repository Layer ] src/repositories/**
      │  calls only ▼
[ Database ]         Prisma Client (src/lib/prisma.ts)
```

**Hard rules for Claude Code to enforce:**
- `src/app/**` and `src/components/**` → NEVER import from `@prisma/client` or `src/lib/prisma`
- `src/services/**` → NEVER import `prisma` directly, only import from `src/repositories/**`
- `src/repositories/**` → ONLY import `prisma` from `src/lib/prisma`, no Zod, no HTTP, no `revalidatePath`
- API routes (`src/app/api/**`) → NEVER import `prisma` directly, only call service functions
- Services own: Zod validation, error handling, `revalidatePath()`, business rules
- Repositories own: all SQL/Prisma queries, pagination math, raw DB types

---

## Patch 1 — Add Repository Layer (New Phase — Insert After Phase 1)

**Insert as Phase 1.6 in the existing plan.**

Create one repository file per domain. Each file exports pure async functions.
No validation. No error formatting. No HTTP concepts. Just DB queries.

---

### File: `src/repositories/post.repository.ts`

```ts
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
```

---

### File: `src/repositories/category.repository.ts`

```ts
import { prisma } from "@/lib/prisma";

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
      _count: { select: { posts: true } },
    },
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
```

---

### File: `src/repositories/project.repository.ts`

```ts
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function findAllProjects() {
  return prisma.project.findMany({
    include: { categories: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function findProjectBySlug(slug: string) {
  return prisma.project.findUnique({
    where: { slug },
    include: { categories: { include: { category: true } } },
  });
}

export async function createProject(data: Prisma.ProjectUncheckedCreateInput) {
  return prisma.project.create({ data });
}

export async function updateProject(id: string, data: Prisma.ProjectUncheckedUpdateInput) {
  return prisma.project.update({ where: { id }, data });
}

export async function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
}

export async function findAllProjectSlugs() {
  return prisma.project.findMany({ select: { slug: true, updatedAt: true } });
}
```

---

### File: `src/repositories/tag.repository.ts`

```ts
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
```

---

### File: `src/repositories/media.repository.ts`

```ts
import { prisma } from "@/lib/prisma";

export async function createMediaRecord(data: {
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  linkedTo?: string;
}) {
  return prisma.media.create({ data });
}

export async function findAllMedia() {
  return prisma.media.findMany({ orderBy: { createdAt: "desc" } });
}

export async function deleteOrphanedMedia(olderThanDays = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);
  return prisma.media.deleteMany({
    where: { linkedTo: null, createdAt: { lt: cutoff } },
  });
}
```

---

## Patch 2 — Add Service Layer (New Phase — Insert After Patch 1)

**Insert as Phase 1.7 in the existing plan.**

Services are the only place for: Zod validation, slug uniqueness checks,
reading time calculation, `revalidatePath`, error throwing, and business rules.

---

### File: `src/lib/errors.ts`

Create this before writing any service:

```ts
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const Errors = {
  NOT_FOUND: (entity: string, id: string) =>
    new AppError("NOT_FOUND", `${entity} not found: ${id}`, 404),
  SLUG_CONFLICT: (slug: string) =>
    new AppError("SLUG_CONFLICT", `Slug already exists: ${slug}`, 409),
  INVALID_INPUT: (msg: string) =>
    new AppError("INVALID_INPUT", msg, 422),
  UPLOAD_REJECTED: (msg: string) =>
    new AppError("UPLOAD_REJECTED", msg, 400),
  UNAUTHORIZED: () =>
    new AppError("UNAUTHORIZED", "Authentication required", 401),
};
```

---

### File: `src/services/post.service.ts`

```ts
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { PostStatus } from "@prisma/client";
import readingTime from "reading-time";
import { toSlug, uniqueSlug } from "@/lib/slugify";
import { Errors } from "@/lib/errors";
import * as postRepo from "@/repositories/post.repository";
import * as tagRepo from "@/repositories/tag.repository";

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional(),
  body: z.string().min(1),
  categories: z.array(z.string()).min(1).max(5),
  tags: z.array(z.string()).optional(),
  featuredImage: z.string().url().optional(),
  imageAlt: z.string().optional(),
  seoTitle: z.string().max(60).optional(),
  seoDesc: z.string().max(160).optional(),
  ogImage: z.string().url().optional(),
  slug: z.string().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export async function createPost(input: CreatePostInput) {
  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) throw Errors.INVALID_INPUT(parsed.error.message);

  const { title, body, tags = [], categories, slug: customSlug, ...rest } = parsed.data;

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

  return updated;
}

export async function deletePost(id: string) {
  const post = await postRepo.findPostById(id);
  if (!post) throw Errors.NOT_FOUND("Post", id);

  await postRepo.deletePost(id);

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
}

export async function getPublishedPost(slug: string) {
  const post = await postRepo.findPostBySlug(slug);
  if (!post || post.status !== PostStatus.PUBLISHED)
    throw Errors.NOT_FOUND("Post", slug);
  return post;
}

export async function listPosts(args: postRepo.PostFindManyArgs) {
  const { posts, total } = await postRepo.findManyPosts(args);
  const perPage = args.perPage ?? 10;
  return {
    data: posts,
    meta: {
      page: args.page ?? 1,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
}
```

---

### File: `src/services/category.service.ts`

```ts
import { z } from "zod";
import { toSlug, uniqueSlug } from "@/lib/slugify";
import { Errors } from "@/lib/errors";
import * as categoryRepo from "@/repositories/category.repository";

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().optional(),
  parentId: z.string().optional(),
});

export async function createCategory(input: z.infer<typeof createCategorySchema>) {
  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) throw Errors.INVALID_INPUT(parsed.error.message);

  const slug = await uniqueSlug(
    parsed.data.slug ?? parsed.data.name,
    (s) => categoryRepo.categorySlugExists(s)
  );

  return categoryRepo.createCategory({ ...parsed.data, slug });
}

export async function deleteCategory(id: string) {
  const cat = await categoryRepo.findCategoryById(id);
  if (!cat) throw Errors.NOT_FOUND("Category", id);

  if (cat._count.posts > 0) {
    // Allow deletion — associations are cascade-removed by Prisma
    // but warn in the return value so the UI can inform the user
  }

  await categoryRepo.deleteCategory(id);
  return { orphanedPosts: cat._count.posts };
}

export async function getAllCategories() {
  return categoryRepo.findAllCategories();
}

export async function getCategoryWithPosts(slug: string) {
  const cat = await categoryRepo.findCategoryBySlug(slug);
  if (!cat) throw Errors.NOT_FOUND("Category", slug);
  return cat;
}
```

---

### File: `src/services/project.service.ts`

```ts
import { z } from "zod";
import { toSlug, uniqueSlug } from "@/lib/slugify";
import { Errors } from "@/lib/errors";
import * as projectRepo from "@/repositories/project.repository";

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).default("ACTIVE"),
  repoUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  techStack: z.array(z.string()).default([]),
  body: z.string().min(1),
  categories: z.array(z.string()).min(1),
});

export async function createProject(input: z.infer<typeof createProjectSchema>) {
  const parsed = createProjectSchema.safeParse(input);
  if (!parsed.success) throw Errors.INVALID_INPUT(parsed.error.message);

  const { name, categories, ...rest } = parsed.data;
  const slug = await uniqueSlug(name, async (s) => !!(await projectRepo.findProjectBySlug(s)));

  return projectRepo.createProject({
    ...rest,
    name,
    slug,
    categories: {
      create: categories.map((categoryId) => ({ categoryId })),
    },
  });
}

export async function getAllProjects() {
  return projectRepo.findAllProjects();
}

export async function getProject(slug: string) {
  const project = await projectRepo.findProjectBySlug(slug);
  if (!project) throw Errors.NOT_FOUND("Project", slug);
  return project;
}
```

---

### File: `src/services/upload.service.ts`

```ts
import { Errors } from "@/lib/errors";
import * as mediaRepo from "@/repositories/media.repository";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export async function uploadMedia(file: File): Promise<{ url: string }> {
  if (!ALLOWED_TYPES.includes(file.type))
    throw Errors.UPLOAD_REJECTED(`File type not allowed: ${file.type}`);
  if (file.size > MAX_BYTES)
    throw Errors.UPLOAD_REJECTED(`File too large: ${file.size} bytes (max 5MB)`);

  // Upload to S3-compatible storage
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const client = new S3Client({
    region: "auto",
    endpoint: process.env.STORAGE_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY!,
      secretAccessKey: process.env.STORAGE_SECRET_KEY!,
    },
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET!,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    })
  );

  const url = `${process.env.STORAGE_ENDPOINT}/${process.env.STORAGE_BUCKET}/${filename}`;

  await mediaRepo.createMediaRecord({
    url,
    filename,
    mimeType: file.type,
    sizeBytes: file.size,
  });

  return { url };
}
```

Install the S3 client:

```bash
pnpm add @aws-sdk/client-s3
```

---

## Patch 3 — Fix All API Routes to Use Services Only

**Applies to:** Existing Phase 4 (Steps 4.1 through 4.12)

**Rule:** Every API route must follow this exact pattern. No direct Prisma. No direct repo calls.

```ts
// src/app/api/v1/posts/route.ts  ← CORRECT pattern
import { NextRequest, NextResponse } from "next/server";
import { listPosts } from "@/services/post.service";
import { AppError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const result = await listPosts({
      page: Number(searchParams.get("page") ?? 1),
      perPage: Number(searchParams.get("perPage") ?? 10),
      categorySlug: searchParams.get("category") ?? undefined,
      tagSlug: searchParams.get("tag") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AppError)
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
    return NextResponse.json({ error: { code: "INTERNAL", message: "Server error" } }, { status: 500 });
  }
}
```

Apply this pattern to every route in Phase 4. Specifically:

| Route file | Must call | Must NOT call |
|---|---|---|
| `api/v1/posts/route.ts` | `post.service.listPosts` | `prisma.*` |
| `api/v1/posts/[slug]/route.ts` | `post.service.getPublishedPost` | `prisma.*` |
| `api/v1/categories/route.ts` | `category.service.getAllCategories` | `prisma.*` |
| `api/v1/categories/[slug]/posts/route.ts` | `category.service.getCategoryWithPosts` | `prisma.*` |
| `api/v1/projects/route.ts` | `project.service.getAllProjects` | `prisma.*` |
| `api/v1/search/route.ts` | `post.service.listPosts` + `project.service.getAllProjects` | `prisma.*` |
| `api/v1/admin/posts/route.ts` | `post.service.createPost` | `prisma.*` |
| `api/v1/admin/posts/[id]/route.ts` | `post.service.updatePost` / `post.service.deletePost` | `prisma.*` |
| `api/v1/admin/posts/[id]/publish/route.ts` | `post.service.publishPost` | `prisma.*` |
| `api/v1/admin/categories/route.ts` | `category.service.createCategory` | `prisma.*` |
| `api/v1/admin/categories/[id]/route.ts` | `category.service.deleteCategory` | `prisma.*` |
| `api/v1/admin/upload/route.ts` | `upload.service.uploadMedia` | `prisma.*` |

---

## Patch 4 — Fix Pages & Server Components to Use Services Only

**Applies to:** Existing Phase 5 (all public pages) and Phase 7 (admin panel)

Pages are RSCs and can call service functions directly (no need to go through API routes for server-side fetching). They must never import from repositories or prisma.

**Correct pattern for a page:**

```ts
// src/app/blog/[slug]/page.tsx  ← CORRECT
import { getPublishedPost } from "@/services/post.service";
import { notFound } from "next/navigation";

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  let post;
  try {
    post = await getPublishedPost(params.slug);
  } catch {
    notFound();
  }
  // render post...
}
```

**Wrong pattern — fix anywhere it appears:**

```ts
// ❌ WRONG — page calling prisma directly
import { prisma } from "@/lib/prisma";
const post = await prisma.post.findUnique(...)

// ❌ WRONG — page calling repository directly
import { findPostBySlug } from "@/repositories/post.repository";

// ❌ WRONG — SSR page calling its own API route via fetch
const res = await fetch("/api/v1/posts/" + slug)
```

Apply this correction to:
- `src/app/page.tsx` → call `post.service.listPosts` + `category.service.getAllCategories`
- `src/app/blog/page.tsx` → call `post.service.listPosts`
- `src/app/blog/[slug]/page.tsx` → call `post.service.getPublishedPost`
- `src/app/category/[slug]/page.tsx` → call `category.service.getCategoryWithPosts`
- `src/app/projects/page.tsx` → call `project.service.getAllProjects`
- `src/app/projects/[slug]/page.tsx` → call `project.service.getProject`
- `src/app/admin/page.tsx` → call `post.service.listPosts` (all statuses)
- `src/app/admin/posts/page.tsx` → call `post.service.listPosts`
- `src/app/admin/posts/[id]/edit/page.tsx` → call `post.service` to load post
- `src/app/admin/categories/page.tsx` → call `category.service.getAllCategories`

---

## Patch 5 — Updated Folder Structure

**Replace** the file structure in the Appendix of the existing plan with this:

```
src/
├── app/                        ← UI Layer (pages + API route handlers only)
│   ├── api/
│   │   └── v1/
│   │       ├── posts/
│   │       ├── categories/
│   │       ├── projects/
│   │       ├── search/
│   │       └── admin/
│   ├── blog/
│   ├── category/
│   ├── projects/
│   ├── search/
│   └── admin/
│
├── components/                 ← UI Layer (React components only)
│   ├── blog/
│   ├── mdx/
│   ├── layout/
│   ├── search/
│   └── ui/
│
├── services/                   ← Service Layer (business logic + validation)
│   ├── post.service.ts
│   ├── category.service.ts
│   ├── project.service.ts
│   └── upload.service.ts
│
├── repositories/               ← Repository Layer (DB queries only)
│   ├── post.repository.ts
│   ├── category.repository.ts
│   ├── project.repository.ts
│   ├── tag.repository.ts
│   └── media.repository.ts
│
├── lib/                        ← Shared infrastructure
│   ├── prisma.ts               ← Prisma singleton (imported ONLY by repositories)
│   ├── auth.ts
│   ├── mdx.ts
│   ├── slugify.ts
│   ├── rate-limit.ts
│   ├── errors.ts               ← AppError class + Errors helpers
│   └── utils.ts
│
├── types/
│   └── index.ts
└── middleware.ts
```

---

## Patch 6 — Prisma Schema Fix (Patch to Phase 1.2)

The existing schema uses raw `String` for category/tag relations on `Post` create.
Add explicit relation mode to prevent Prisma ambiguity warnings with Supabase:

Add this line to the `datasource db` block in `prisma/schema.prisma`:

```prisma
datasource db {
  provider     = "postgresql"
  url          = env("DATABASE_URL")
  relationMode = "prisma"   // ← ADD THIS for Supabase compatibility
}
```

Also add a missing `@@index` for `CategoriesOnPosts` and `TagsOnPosts` which are needed for efficient reverse lookups:

```prisma
model CategoriesOnPosts {
  // ... existing fields
  @@index([categoryId])   // ← ADD
}

model TagsOnPosts {
  // ... existing fields
  @@index([tagId])        // ← ADD
}

model CategoriesOnProjects {
  // ... existing fields
  @@index([categoryId])   // ← ADD
}
```

After editing schema, run:

```bash
pnpx prisma migrate dev --name add-relation-indexes
pnpx prisma generate
```

---

## Patch 7 — Prisma Setup Fix (Patch to Phase 1.3)

The existing plan seeds using `ADMIN_PASSWORD` env var which is not in `.env.local`.
Fix the seed script to read from the correct var:

In `prisma/seed.ts`, change:

```ts
// BEFORE
const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "changeme", 12);

// AFTER
const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD_HASH ?? "changeme", 12);
```

Wait — `ADMIN_PASSWORD_HASH` is already hashed in the env. The seed should hash the plain password at seed time. Change `.env.local` to add:

```env
ADMIN_PASSWORD="your-plain-password-here"   # used only for seeding, not stored
```

And update seed:

```ts
const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 12);
```

Remove `ADMIN_PASSWORD` from `.env.local` after seeding. Document this in a `## Seeding` comment in seed.ts.

---

## Summary — Order of Application

Apply patches in this order within the existing execution plan:

```
Existing Phase 0   (unchanged)
Existing Phase 1   (Steps 1.1–1.5 unchanged, then apply Patch 6 + Patch 7)
NEW     Phase 1.6  → Apply Patch 1 (add all repository files)
NEW     Phase 1.7  → Apply Patch 2 (add all service files + errors.ts)
Existing Phase 2   (auth — unchanged)
Existing Phase 3   (utilities — unchanged)
Existing Phase 4   (API routes — apply Patch 3 to every route)
Existing Phase 5   (public pages — apply Patch 4)
Existing Phase 6   (UI components — unchanged)
Existing Phase 7   (admin panel — apply Patch 4)
Existing Phase 8   (SEO/RSS — unchanged)
Existing Phase 9   (security — unchanged)
Existing Phase 10  (testing — unchanged)
Existing Phase 11  (deployment — unchanged)
Appendix           (replace folder structure with Patch 5)
```

---

*Apply this patch file alongside `claude-code-execution-plan.md`. Do not modify the original plan file.*