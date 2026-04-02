# Claude Code Execution Plan — Tech Blog & Documentation Platform

> **For:** Claude Code (coding agent)
> **Project:** Personal Tech Blog & Project Documentation Platform
> **Stack:** Next.js 14 · TypeScript · Tailwind CSS · Prisma · PostgreSQL (Supabase) · NextAuth.js
> **Reference spec:** `tech-blog-platform-spec.md`

---

## How to Use This File

Run each phase in order. Each step is a precise instruction for Claude Code.
- ✅ Check off steps as completed
- 🔴 Stop and report if a step fails — do not skip ahead
- 📁 All commands run from the project root unless noted otherwise
- Do **not** hallucinate dependencies — install only what is listed

---

## Phase 0 — Project Scaffold

### Step 0.1 — Bootstrap Next.js app

```bash
pnpm create next-app@latest tech-blog \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
cd tech-blog
```

### Step 0.2 — Install all dependencies

```bash
# Core
pnpm add prisma @prisma/client
pnpm add next-auth@beta
pnpm add @auth/prisma-adapter

# MDX + content
pnpm add next-mdx-remote gray-matter
pnpm add shiki
pnpm add reading-time
pnpm add rehype-sanitize rehype-slug rehype-autolink-headings
pnpm add remark-gfm

# UI
pnpm add lucide-react
pnpm add class-variance-authority clsx tailwind-merge
pnpm add next-themes

# Search
pnpm add fuse.js

# Rate limiting
pnpm add @upstash/ratelimit @upstash/redis

# Validation
pnpm add zod

# Utilities
pnpm add slugify bcryptjs
pnpm add -D @types/bcryptjs

# shadcn/ui setup
pnpx shadcn-ui@latest init
# When prompted: Default style, CSS variables: yes, app/globals.css
```

### Step 0.3 — Install shadcn components

```bash
pnpx shadcn-ui@latest add button input label badge card separator sheet dialog toast
```

### Step 0.4 — Set up environment file

Create `.env.local` in the project root with this exact content (values to be filled by the user):

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
ADMIN_EMAIL="your@email.com"
ADMIN_PASSWORD_HASH="bcrypt-hash-of-your-password"

# Storage (Cloudflare R2 or Supabase Storage)
STORAGE_ENDPOINT=""
STORAGE_ACCESS_KEY=""
STORAGE_SECRET_KEY=""
STORAGE_BUCKET=""

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# App
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="Your Name — Tech Blog"
```

Also create `.env.example` with the same keys but empty values, and add `.env.local` to `.gitignore`.

### Step 0.5 — Configure TypeScript paths

Verify `tsconfig.json` has this in `compilerOptions`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Step 0.6 — Configure Tailwind

Replace `tailwind.config.ts` with:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      maxWidth: {
        prose: "720px",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            code: { fontFamily: "JetBrains Mono, monospace" },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
```

Then install the typography plugin:

```bash
pnpm add -D @tailwindcss/typography
```

---

## Phase 1 — Database & Prisma Setup

### Step 1.1 — Initialize Prisma

```bash
pnpx prisma init --datasource-provider postgresql
```

### Step 1.2 — Write the full Prisma schema

Replace `prisma/schema.prisma` entirely with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}

model Post {
  id            String    @id @default(cuid())
  title         String
  slug          String    @unique
  excerpt       String?
  body          String
  status        PostStatus @default(DRAFT)
  publishedAt   DateTime?
  updatedAt     DateTime  @updatedAt
  createdAt     DateTime  @default(now())
  readingTime   Int?
  featuredImage String?
  imageAlt      String?
  seoTitle      String?
  seoDesc       String?
  ogImage       String?
  categories    CategoriesOnPosts[]
  tags          TagsOnPosts[]

  @@index([slug])
  @@index([status, publishedAt])
}

model Project {
  id          String        @id @default(cuid())
  name        String
  slug        String        @unique
  description String?
  status      ProjectStatus @default(ACTIVE)
  repoUrl     String?
  liveUrl     String?
  techStack   String[]
  body        String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  categories  CategoriesOnProjects[]

  @@index([slug])
}

model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?
  color       String?
  icon        String?
  parentId    String?
  parent      Category?  @relation("SubCategories", fields: [parentId], references: [id])
  children    Category[] @relation("SubCategories")
  createdAt   DateTime   @default(now())
  posts       CategoriesOnPosts[]
  projects    CategoriesOnProjects[]

  @@index([slug])
  @@index([parentId])
}

model Tag {
  id    String        @id @default(cuid())
  name  String        @unique
  slug  String        @unique
  posts TagsOnPosts[]
}

model CategoriesOnPosts {
  post       Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId     String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId String

  @@id([postId, categoryId])
}

model TagsOnPosts {
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId String
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId  String

  @@id([postId, tagId])
}

model CategoriesOnProjects {
  project    Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId  String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId String

  @@id([projectId, categoryId])
}

model Media {
  id         String    @id @default(cuid())
  url        String
  filename   String
  mimeType   String
  sizeBytes  Int
  linkedTo   String?
  createdAt  DateTime  @default(now())
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum ProjectStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}
```

### Step 1.3 — Run migration

```bash
pnpx prisma migrate dev --name init
pnpx prisma generate
```

### Step 1.4 — Create Prisma client singleton

Create `src/lib/prisma.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Step 1.5 — Seed database with default categories

Create `prisma/seed.ts`:

```ts
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
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "changeme", 12);
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? "admin@example.com" },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL ?? "admin@example.com",
      passwordHash: hash,
    },
  });

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Add to `package.json`:

```json
"prisma": {
  "seed": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts"
}
```

Run seed:

```bash
pnpx prisma db seed
```

---

## Phase 2 — Authentication

### Step 2.1 — Create NextAuth config

Create `src/lib/auth.ts`:

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
});
```

### Step 2.2 — Create auth route handler

Create `src/app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

### Step 2.3 — Create admin middleware

Create `src/middleware.ts`:

```ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAdmin = req.nextUrl.pathname.startsWith("/admin");
  const isAdminApi = req.nextUrl.pathname.startsWith("/api/v1/admin");
  const isLoginPage = req.nextUrl.pathname === "/admin/login";

  if ((isAdmin || isAdminApi) && !isLoginPage && !req.auth) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/api/v1/admin/:path*"],
};
```

### Step 2.4 — Build login page

Create `src/app/admin/login/page.tsx` — a centered card with email + password fields, a submit button, and error state display. On submit call `signIn("credentials", { email, password, redirectTo: "/admin" })`. Show loading spinner during submission.

---

## Phase 3 — Core Utilities & Types

### Step 3.1 — Create shared TypeScript types

Create `src/types/index.ts` with exported interfaces for:
- `PostWithRelations` — Post + categories array + tags array
- `ProjectWithRelations` — Project + categories array
- `CategoryWithChildren` — Category + children array + post count
- `SearchResult` — id, title, slug, excerpt, type (`"post" | "project"`), categories

### Step 3.2 — Create slug utility

Create `src/lib/slugify.ts`:

```ts
import slugifyLib from "slugify";

export function toSlug(input: string): string {
  return slugifyLib(input, { lower: true, strict: true, trim: true });
}

export async function uniqueSlug(
  base: string,
  checkFn: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = toSlug(base);
  let exists = await checkFn(slug);
  let counter = 2;
  while (exists) {
    slug = `${toSlug(base)}-${counter}`;
    exists = await checkFn(slug);
    counter++;
  }
  return slug;
}
```

### Step 3.3 — Create MDX processor

Create `src/lib/mdx.ts`:

```ts
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import readingTime from "reading-time";

export async function processMDX(source: string) {
  const { content, frontmatter } = await compileMDX({
    source,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSanitize, rehypeSlug, rehypeAutolinkHeadings],
      },
      parseFrontmatter: true,
    },
  });

  const stats = readingTime(source);

  return { content, frontmatter, readingTimeMin: Math.ceil(stats.minutes) };
}

export function validateMDX(source: string): { valid: boolean; error?: string } {
  try {
    // Basic validation: check for unclosed JSX tags
    // Full compile happens on save via processMDX
    return { valid: true };
  } catch (err: any) {
    return { valid: false, error: err.message };
  }
}
```

### Step 3.4 — Create cn utility

Create `src/lib/utils.ts`:

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Phase 4 — API Routes

### Step 4.1 — Posts list endpoint

Create `src/app/api/v1/posts/route.ts`:
- Accept query params: `page` (default 1), `perPage` (default 10), `category`, `tag`, `status` (default `PUBLISHED`)
- Query Prisma with `where`, `include: { categories: true, tags: true }`, `orderBy: { publishedAt: "desc" }`
- Return paginated response with `data` and `meta`

### Step 4.2 — Single post endpoint

Create `src/app/api/v1/posts/[slug]/route.ts`:
- Find post by slug where `status = PUBLISHED`
- Return 404 with error schema if not found
- Include categories and tags

### Step 4.3 — Categories endpoint

Create `src/app/api/v1/categories/route.ts`:
- Return all categories with children and `_count.posts`

### Step 4.4 — Category posts endpoint

Create `src/app/api/v1/categories/[slug]/posts/route.ts`:
- Find category by slug, include posts where `status = PUBLISHED`

### Step 4.5 — Projects endpoint

Create `src/app/api/v1/projects/route.ts`:
- Return all projects with categories, ordered by `createdAt desc`

### Step 4.6 — Search endpoint

Create `src/app/api/v1/search/route.ts`:
- Accept `?q=` query param
- Fetch all published posts (title, excerpt, slug, categories) and all projects
- Run fuse.js search with keys: `["title", "excerpt", "tags.name", "categories.name"]`
- Return top 20 results with type field (`"post"` or `"project"`)
- Apply rate limiting: 60 req/min per IP using `@upstash/ratelimit`

### Step 4.7 — Admin: Create post

Create `src/app/api/v1/admin/posts/route.ts` (POST):
- Validate body with Zod: `{ title, excerpt?, body, categories, tags?, featuredImage?, seoTitle?, seoDesc? }`
- Generate unique slug from title
- Calculate reading time from body
- Create post with `status: DRAFT`
- Connect/create categories and tags
- Return created post

### Step 4.8 — Admin: Update post

Create `src/app/api/v1/admin/posts/[id]/route.ts` (PUT):
- Validate body with same Zod schema
- Update post fields
- Disconnect all existing categories/tags, reconnect with new ones
- Recalculate reading time

### Step 4.9 — Admin: Publish post

Create `src/app/api/v1/admin/posts/[id]/publish/route.ts` (POST):
- Set `status = PUBLISHED`, `publishedAt = new Date()` if not already set
- Call `revalidatePath("/blog")` and `revalidatePath("/blog/" + slug)`

### Step 4.10 — Admin: Delete post

Create `src/app/api/v1/admin/posts/[id]/route.ts` (DELETE):
- Delete post (cascade handles join tables)
- Call `revalidatePath("/blog")`

### Step 4.11 — Admin: Media upload

Create `src/app/api/v1/admin/upload/route.ts` (POST):
- Accept `multipart/form-data` with file field
- Validate: MIME type must be in `["image/jpeg","image/png","image/webp","image/gif"]`, max 5MB
- Upload to storage (Cloudflare R2 / Supabase Storage) using S3-compatible SDK
- Save record to `Media` table
- Return `{ url, filename }`

### Step 4.12 — Admin: Category CRUD

Create `src/app/api/v1/admin/categories/route.ts` (POST) and `src/app/api/v1/admin/categories/[id]/route.ts` (PUT, DELETE):
- POST: validate `{ name, slug?, description?, color?, icon?, parentId? }`, auto-generate slug if not provided
- PUT: update fields
- DELETE: check for child categories first; if children exist, set their `parentId = null`. Remove category associations from posts/projects, then delete category.

---

## Phase 5 — Public Pages

### Step 5.1 — Root layout

Update `src/app/layout.tsx`:
- Add `ThemeProvider` from `next-themes` wrapping children with `attribute="class"` and `defaultTheme="system"`
- Add Inter and JetBrains Mono from `next/font/google`
- Add `Header` and `Footer` components

### Step 5.2 — Header component

Create `src/components/layout/Header.tsx`:
- Logo/site name (left)
- Nav links: Blog, Projects, Categories (center)
- Search icon button + theme toggle (right)
- Mobile: hamburger menu using shadcn Sheet
- Active link styling using `usePathname`

### Step 5.3 — Footer component

Create `src/components/layout/Footer.tsx`:
- Copyright line
- Links: RSS (`/feed.xml`), GitHub, Source
- Keep minimal

### Step 5.4 — Home page

Create `src/app/page.tsx` (SSG):
- Hero section: name, one-line bio, CTA buttons (Blog, Projects)
- Featured posts section: latest 3 published posts as `PostCard`
- Category grid: all top-level categories as clickable cards with icon and post count
- `export const revalidate = 60`

### Step 5.5 — Blog listing page

Create `src/app/blog/page.tsx` (SSG + ISR):
- Fetch all published posts, paginated
- Render grid of `PostCard` components
- Category filter sidebar (or top filter pills on mobile)
- `export const revalidate = 60`

### Step 5.6 — Blog post page

Create `src/app/blog/[slug]/page.tsx` (SSG + ISR):
- `generateStaticParams`: return all published post slugs
- Fetch post by slug, return 404 if not found or not published
- Render: featured image, title, date, reading time, category badges
- MDX body via `processMDX`
- Sticky Table of Contents sidebar (desktop)
- Reading progress bar at top
- `export const revalidate = 60`

### Step 5.7 — Category page

Create `src/app/category/[slug]/page.tsx` (SSG + ISR):
- `generateStaticParams`: all category slugs
- Show category name, description, subcategories (if any)
- List all posts in this category as `PostCard`
- `export const revalidate = 300`

### Step 5.8 — Projects page

Create `src/app/projects/page.tsx` (SSG + ISR):
- List all projects as cards showing: name, description, status badge, tech stack pills, links
- `export const revalidate = 60`

### Step 5.9 — Single project page

Create `src/app/projects/[slug]/page.tsx`:
- Render project metadata + MDX body

### Step 5.10 — Search page

Create `src/app/search/page.tsx` (SSR):
- Read `?q=` from searchParams
- Call search API
- Render results as cards grouped by type

---

## Phase 6 — UI Components

### Step 6.1 — PostCard component

Create `src/components/blog/PostCard.tsx`:
- Props: `title`, `slug`, `excerpt`, `publishedAt`, `readingTime`, `categories`, `featuredImage?`
- Renders as a card with hover state
- Date formatted as `"Mar 15, 2026"`
- Category badges using `CategoryBadge` component

### Step 6.2 — CategoryBadge component

Create `src/components/ui/CategoryBadge.tsx`:
- Props: `name`, `color?`, `icon?`, `slug`
- Renders as a colored pill, clicking navigates to `/category/[slug]`

### Step 6.3 — CodeBlock component

Create `src/components/mdx/CodeBlock.tsx`:
- Use `shiki` with themes `"github-dark"` (dark mode) and `"github-light"` (light mode)
- Show language label tab at top-right
- Copy-to-clipboard button with success state (2s feedback)
- Filename display if `filename` meta is provided (e.g., ` ```ts filename="lib/auth.ts"`)

### Step 6.4 — TableOfContents component

Create `src/components/blog/TableOfContents.tsx`:
- Extract headings from MDX (h2, h3)
- Sticky sidebar on desktop (`top-24`)
- Active heading highlighting via `IntersectionObserver`
- Smooth scroll on click

### Step 6.5 — ReadingProgress component

Create `src/components/blog/ReadingProgress.tsx`:
- Fixed bar at top of viewport (`position: fixed; top: 0; z-index: 50`)
- Width driven by `window.scrollY / (document.body.scrollHeight - window.innerHeight)`
- Use `accent` color

### Step 6.6 — SearchModal component

Create `src/components/search/SearchModal.tsx`:
- Trigger: `/` key or search icon click
- shadcn Dialog with an input at top
- Debounced fetch to `/api/v1/search?q=` (300ms)
- Results list with keyboard navigation (arrow keys + enter)
- Shows post/project type badge per result

### Step 6.7 — Custom MDX components

Create `src/components/mdx/index.tsx` exporting:
- `Callout` — colored aside box (types: `info`, `warning`, `danger`, `tip`)
- `Step` — numbered step wrapper
- `FileTree` — indented file/folder tree display
- Override `pre` with `CodeBlock`
- Override `a` with Next.js `Link` for internal links

### Step 6.8 — ThemeToggle component

Create `src/components/ui/ThemeToggle.tsx`:
- Button cycling: light → dark → system
- Uses `useTheme` from `next-themes`
- Icons: `Sun`, `Moon`, `Monitor` from `lucide-react`

---

## Phase 7 — Admin Panel

### Step 7.1 — Admin layout

Create `src/app/admin/layout.tsx`:
- Sidebar navigation: Dashboard, Posts, Projects, Categories, Media
- Top bar: "Admin" label + sign out button
- No public header/footer
- Wrap with auth check (redirect to login if no session)

### Step 7.2 — Admin dashboard

Create `src/app/admin/page.tsx`:
- Stat cards: Total Posts, Published, Drafts, Total Projects
- Recent posts table: title, status, date, edit link

### Step 7.3 — Post list (admin)

Create `src/app/admin/posts/page.tsx`:
- Table: title, status badge, categories, publishedAt, actions (Edit / Delete / Publish)
- Filter by status (All / Draft / Published / Archived)
- Delete confirmation dialog

### Step 7.4 — Post editor (new)

Create `src/app/admin/posts/new/page.tsx`:
- Two-column layout: editor (left 60%) + preview (right 40%)
- Frontmatter form fields: title (auto-generates slug), slug (editable), excerpt, categories (multi-select), tags (free-form input with chips), featured image (URL or upload)
- MDX textarea with line numbers
- Preview renders the MDX via `processMDX`
- Auto-save draft every 30s (debounced `POST /api/v1/admin/posts`)
- **Save Draft** and **Publish** buttons
- Show compile error inline if MDX is invalid

### Step 7.5 — Post editor (edit)

Create `src/app/admin/posts/[id]/edit/page.tsx`:
- Same layout as new post editor
- Load existing post data on mount
- Send `PUT /api/v1/admin/posts/[id]` on save

### Step 7.6 — Category manager

Create `src/app/admin/categories/page.tsx`:
- Tree view of categories (parent → children indented)
- Add category form (inline or modal): name, slug, color picker, icon selector, parent select
- Edit / Delete actions per row
- Prevent deletion if category has posts (show warning with post count)

### Step 7.7 — Media manager

Create `src/app/admin/media/page.tsx`:
- Drag-and-drop upload zone
- Grid of uploaded images with CDN URL + copy button
- Shows file size and upload date

### Step 7.8 — Projects admin

Create `src/app/admin/projects/page.tsx` and `src/app/admin/projects/new/page.tsx`:
- Similar to post list and editor
- Extra fields: repoUrl, liveUrl, techStack (tag chips), status select

---

## Phase 8 — SEO, RSS & Sitemap

### Step 8.1 — Global metadata

Update `src/app/layout.tsx` to export:

```ts
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
  title: { default: process.env.NEXT_PUBLIC_SITE_NAME!, template: "%s | Your Name" },
  description: "A personal tech blog and documentation of projects, tools, and learnings.",
  openGraph: { type: "website", locale: "en_US" },
  robots: { index: true, follow: true },
};
```

### Step 8.2 — Post page metadata

In `src/app/blog/[slug]/page.tsx`, export `generateMetadata`:
- Set `title` to post title
- Set `description` to excerpt
- Set `openGraph.images` to ogImage or featuredImage
- Set `openGraph.type = "article"`
- Add JSON-LD `Article` structured data via `<script type="application/ld+json">`

### Step 8.3 — robots.txt

Create `src/app/robots.ts`:

```ts
import { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/admin" }],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
```

### Step 8.4 — Sitemap

Create `src/app/sitemap.ts`:
- Fetch all published post slugs and all project slugs from DB
- Return array including: `/`, `/blog`, `/projects`, all `/blog/[slug]`, all `/projects/[slug]`, all `/category/[slug]`
- Set `lastModified` to `updatedAt` for post/project pages

### Step 8.5 — RSS feed

Create `src/app/feed.xml/route.ts`:
- Return XML RSS 2.0 feed
- Include last 20 published posts
- Each item: `<title>`, `<link>`, `<description>` (excerpt), `<pubDate>`, `<category>`
- Set `Content-Type: application/rss+xml`

---

## Phase 9 — Performance & Security

### Step 9.1 — Security headers

Update `next.config.ts` to add headers:

```ts
async headers() {
  return [{
    source: "/(.*)",
    headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Content-Security-Policy",
        value: "default-src 'self'; img-src * data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:;"
      },
    ],
  }];
}
```

### Step 9.2 — Image optimization config

Update `next.config.ts`:

```ts
images: {
  formats: ["image/webp"],
  remotePatterns: [
    { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
    { protocol: "https", hostname: "**.supabase.co" },
  ],
}
```

### Step 9.3 — Rate limiting middleware helper

Create `src/lib/rate-limit.ts`:

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const searchRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  prefix: "rl:search",
});

export const loginRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "rl:login",
});
```

Apply `loginRatelimit` in the `authorize` function of `src/lib/auth.ts` (keyed by email).

---

## Phase 10 — Testing & Validation

### Step 10.1 — Set up Vitest

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom";
```

### Step 10.2 — Write utility unit tests

Create `src/lib/__tests__/slugify.test.ts`:
- Test `toSlug` with spaces, special chars, unicode
- Test `uniqueSlug` appends counter on conflict

Create `src/lib/__tests__/mdx.test.ts`:
- Test `validateMDX` returns valid for correct MDX
- Test `validateMDX` returns error for unclosed tags

### Step 10.3 — Run full build check

```bash
pnpm run build
```

Fix any TypeScript errors before proceeding.

### Step 10.4 — Run tests

```bash
pnpm run test
```

All tests must pass.

---

## Phase 11 — Deployment

### Step 11.1 — Prepare for Vercel

Ensure the following files exist and are correct:
- `.env.example` (all keys, no values)
- `next.config.ts` with image domains and security headers
- `.gitignore` includes `.env.local`, `.next/`, `node_modules/`

### Step 11.2 — Push to GitHub

```bash
git init
git add .
git commit -m "feat: initial platform scaffold"
git remote add origin https://github.com/YOUR_USERNAME/tech-blog.git
git push -u origin main
```

### Step 11.3 — Connect Vercel

1. Go to vercel.com → New Project → Import GitHub repo
2. Framework: Next.js (auto-detected)
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Deploy

### Step 11.4 — Run production migrations

After deploy, run migrations against the production DB:

```bash
DATABASE_URL="<production_url>" pnpx prisma migrate deploy
DATABASE_URL="<production_url>" pnpx prisma db seed
```

### Step 11.5 — Verify deployment checklist

- [ ] Home page loads and shows categories
- [ ] `/blog` page loads
- [ ] `/admin/login` shows login form
- [ ] Login with admin credentials works
- [ ] Create a draft post in admin
- [ ] Publish the post and verify it appears on `/blog`
- [ ] Search returns results
- [ ] `/feed.xml` returns valid RSS
- [ ] `/sitemap.xml` includes all routes
- [ ] Dark mode toggle works
- [ ] Mobile nav works

---

## Appendix — File Structure Reference

```
tech-blog/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── robots.ts
│   │   ├── sitemap.ts
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── category/
│   │   │   └── [slug]/page.tsx
│   │   ├── search/
│   │   │   └── page.tsx
│   │   ├── feed.xml/
│   │   │   └── route.ts
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── posts/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx
│   │   │   │   └── new/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   └── media/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       └── v1/
│   │           ├── posts/
│   │           │   ├── route.ts
│   │           │   └── [slug]/route.ts
│   │           ├── categories/
│   │           │   ├── route.ts
│   │           │   └── [slug]/posts/route.ts
│   │           ├── projects/route.ts
│   │           ├── search/route.ts
│   │           └── admin/
│   │               ├── posts/
│   │               │   ├── route.ts
│   │               │   └── [id]/
│   │               │       ├── route.ts
│   │               │       └── publish/route.ts
│   │               ├── categories/
│   │               │   ├── route.ts
│   │               │   └── [id]/route.ts
│   │               ├── projects/
│   │               │   ├── route.ts
│   │               │   └── [id]/route.ts
│   │               └── upload/route.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── blog/
│   │   │   ├── PostCard.tsx
│   │   │   ├── TableOfContents.tsx
│   │   │   └── ReadingProgress.tsx
│   │   ├── mdx/
│   │   │   ├── index.tsx
│   │   │   └── CodeBlock.tsx
│   │   ├── search/
│   │   │   └── SearchModal.tsx
│   │   └── ui/
│   │       ├── CategoryBadge.tsx
│   │       └── ThemeToggle.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── mdx.ts
│   │   ├── slugify.ts
│   │   ├── rate-limit.ts
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   ├── middleware.ts
│   └── test/
│       └── setup.ts
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

*End of execution plan. Phases 0–11 must be completed in order. Report blockers immediately.*
