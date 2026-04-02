# Technical Specification: Personal Tech Blog & Documentation Platform

**Version:** 1.0.0  
**Date:** 2026-03-18  
**Status:** Draft

---

## Table of Contents

1. [Overview](#1-overview)
2. [Goals & Non-Goals](#2-goals--non-goals)
3. [User Personas](#3-user-personas)
4. [System Architecture](#4-system-architecture)
5. [Tech Stack](#5-tech-stack)
6. [Feature Specifications](#6-feature-specifications)
7. [Data Models](#7-data-models)
8. [API Design](#8-api-design)
9. [Frontend Architecture](#9-frontend-architecture)
10. [Content & Category System](#10-content--category-system)
11. [Authentication & Authorization](#11-authentication--authorization)
12. [Search System](#12-search-system)
13. [Performance & Caching Strategy](#13-performance--caching-strategy)
14. [SEO Strategy](#14-seo-strategy)
15. [Edge Cases & Error Handling](#15-edge-cases--error-handling)
16. [Security Considerations](#16-security-considerations)
17. [Deployment & DevOps](#17-deployment--devops)
18. [Future Roadmap](#18-future-roadmap)

---

## 1. Overview

### 1.1 Product Summary

A personal web platform for publishing tech blog posts and documenting learnings about technologies, tools, and projects. Content is organized into structured categories (e.g., Next.js, Databases, Architecture, etc.) allowing visitors to browse by topic and the author to maintain a living reference for their own knowledge base.

### 1.2 Core Value Propositions

- **Personal knowledge base:** Acts as a second brain — searchable, categorized notes and learnings.
- **Public portfolio:** Demonstrates technical depth to potential collaborators or employers.
- **Structured documentation:** Every article is tied to a category/tag, making knowledge retrieval fast.
- **Developer-first writing experience:** Markdown-based writing with code block support, syntax highlighting, and diagram embeds.

---

## 2. Goals & Non-Goals

### Goals

- [ ] Publish and manage blog posts and project documentation
- [ ] Organize content by category (Next.js, Databases, Architecture, etc.) and tags
- [ ] Support rich Markdown / MDX content with code highlighting
- [ ] Fast, SEO-optimized public-facing pages
- [ ] Simple admin interface for creating/editing posts (author only)
- [ ] Search functionality across all posts
- [ ] RSS feed for subscribers
- [ ] Reading time estimates and table of contents per post

### Non-Goals (v1.0)

- Multi-author / team collaboration
- Comments or discussion threads
- Paid subscriptions or paywalled content
- Native mobile app
- Email newsletter (deferred to v2)

---

## 3. User Personas

### 3.1 Visitor (Public User)

- A developer or tech professional landing via Google, social media, or direct link
- Wants to read a specific article or browse by technology
- Does NOT need an account
- Cares about load speed, readability, and code formatting

### 3.2 Author (You)

- The sole content creator and admin
- Needs to write in Markdown with live preview
- Needs to assign categories, tags, status (draft/published), and cover images
- Accesses admin dashboard via secure login

---

## 4. System Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Internet                         │
└────────────────────────┬────────────────────────────────┘
                         │
                ┌────────▼────────┐
                │   CDN (Edge)    │  ← Static assets, cached HTML
                │  Vercel / CF    │
                └────────┬────────┘
                         │
          ┌──────────────▼──────────────┐
          │       Next.js App           │
          │  (App Router, SSG + ISR)    │
          │  - Public blog pages        │
          │  - Admin dashboard (RSC)    │
          └──────┬──────────┬───────────┘
                 │          │
    ┌────────────▼──┐  ┌────▼──────────────┐
    │  Content API  │  │   Auth Provider   │
    │  (Route       │  │  (NextAuth.js /   │
    │   Handlers)   │  │   Clerk)          │
    └────────┬──────┘  └───────────────────┘
             │
    ┌────────▼────────┐
    │   Database      │  ← PostgreSQL (Neon / Supabase)
    │   Prisma ORM    │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │  File Storage   │  ← Cover images, assets
    │  (Cloudinary /  │
    │   Uploadthing)  │
    └─────────────────┘
```

### 4.2 Rendering Strategy

| Page Type             | Strategy         | Reason                                      |
|-----------------------|------------------|---------------------------------------------|
| Home / Category list  | SSG + ISR        | Fast load, revalidated on new post          |
| Individual post       | SSG + ISR        | SEO critical, pre-rendered at build         |
| Search results        | CSR              | Dynamic, user-driven query                  |
| Admin dashboard       | SSR              | Auth-protected, always fresh                |
| 404 / Error pages     | Static           | No dynamic data needed                      |

ISR revalidation window: **60 seconds** for post pages, **300 seconds** for category/home pages.

---

## 5. Tech Stack

| Layer             | Technology                      | Rationale                                               |
|-------------------|---------------------------------|---------------------------------------------------------|
| Framework         | Next.js 14+ (App Router)        | SSG, ISR, Server Components, file-based routing         |
| Language          | TypeScript                      | Type safety across frontend and backend                 |
| Styling           | Tailwind CSS + shadcn/ui        | Utility-first, fast component development               |
| Database          | PostgreSQL via Neon (serverless) | Free tier, scalable, serverless-friendly               |
| ORM               | Prisma                          | Type-safe queries, easy migrations                      |
| Auth              | NextAuth.js (or Clerk)          | Simple credentials/OAuth login for author               |
| Content Format    | MDX                             | Markdown + React components in posts                    |
| Syntax Highlight  | Shiki or Prism.js               | Beautiful code blocks                                   |
| Search            | Fuse.js (client) or Algolia     | Full-text search across posts                           |
| Image Storage     | Cloudinary or Uploadthing       | Optimized image upload and delivery                     |
| Deployment        | Vercel                          | Native Next.js support, edge functions, analytics       |

---

## 6. Feature Specifications

### 6.1 Public Blog

#### 6.1.1 Home Page
- Hero section with recent/featured posts
- Category filter chips (Next.js, Database, Architecture, etc.)
- Paginated post list (10 posts per page)
- Search bar linking to `/search`

#### 6.1.2 Post Detail Page (`/blog/[slug]`)
- Title, cover image, reading time, publish date
- Author byline
- Category badge + tags
- Auto-generated Table of Contents (from headings)
- MDX-rendered content with:
  - Syntax-highlighted code blocks
  - Copy-to-clipboard button on code blocks
  - Embedded diagrams (Mermaid.js support)
  - Callout/note/warning components
- Previous / Next post navigation (within same category)
- Share buttons (Twitter/X, LinkedIn, copy link)

#### 6.1.3 Category Page (`/category/[slug]`)
- Category title + description
- All posts in that category (paginated, 10/page)
- Tag cloud for that category

#### 6.1.4 Tags Page (`/tags/[tag]`)
- All posts with the given tag

#### 6.1.5 About Page
- Static page about the author

#### 6.1.6 RSS Feed (`/rss.xml`)
- Auto-generated from published posts
- Includes title, description, link, pubDate

---

### 6.2 Admin Dashboard (`/admin`)

> Access restricted to authenticated author only.

#### 6.2.1 Post Management
- List all posts (draft + published) with status badges
- Create new post
- Edit existing post
- Delete post (soft delete → archived status)
- Publish / Unpublish toggle

#### 6.2.2 Post Editor
- Rich Markdown editor with live split-pane preview
- Fields:
  - Title
  - Slug (auto-generated, editable)
  - Category (dropdown, required)
  - Tags (multi-select, creatable)
  - Cover Image (upload or URL)
  - Excerpt / Description (for SEO meta)
  - Status: `draft` | `published`
  - Published date (auto or manual)
- Word count + estimated reading time (live)
- Save as draft / Publish buttons

#### 6.2.3 Category Management
- Create / edit / delete categories
- Assign color and icon per category
- Reorder categories (drag and drop)

#### 6.2.4 Tag Management
- View all tags and post counts
- Rename or merge tags

---

## 7. Data Models

### 7.1 Post

```prisma
model Post {
  id          String     @id @default(cuid())
  title       String
  slug        String     @unique
  excerpt     String?
  content     String     // MDX/Markdown raw string
  coverImage  String?    // URL
  status      PostStatus @default(DRAFT)
  readingTime Int?       // in minutes, computed on save
  publishedAt DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  categoryId  String
  category    Category   @relation(fields: [categoryId], references: [id])
  tags        PostTag[]

  @@index([slug])
  @@index([categoryId])
  @@index([status])
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### 7.2 Category

```prisma
model Category {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  color       String?  // hex color
  icon        String?  // emoji or icon name
  order       Int      @default(0)
  createdAt   DateTime @default(now())

  posts       Post[]
}
```

### 7.3 Tag

```prisma
model Tag {
  id    String    @id @default(cuid())
  name  String    @unique
  slug  String    @unique
  posts PostTag[]
}
```

### 7.4 PostTag (Join Table)

```prisma
model PostTag {
  postId String
  tagId  String

  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
}
```

### 7.5 User (Author)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String   // hashed (bcrypt)
  role      Role     @default(AUTHOR)
  createdAt DateTime @default(now())
}

enum Role {
  AUTHOR
  ADMIN
}
```

---

## 8. API Design

All API routes are under `/api/` using Next.js Route Handlers.

### 8.1 Public Endpoints

| Method | Endpoint                   | Description                        |
|--------|----------------------------|------------------------------------|
| GET    | `/api/posts`               | List published posts (paginated)   |
| GET    | `/api/posts/[slug]`        | Get single post by slug            |
| GET    | `/api/categories`          | List all categories                |
| GET    | `/api/categories/[slug]`   | Get category + its posts           |
| GET    | `/api/tags`                | List all tags                      |
| GET    | `/api/tags/[slug]`         | Get tag + its posts                |
| GET    | `/api/search?q=[query]`    | Full-text search across posts      |

### 8.2 Admin Endpoints (Auth Required)

| Method | Endpoint                       | Description                        |
|--------|--------------------------------|------------------------------------|
| GET    | `/api/admin/posts`             | List all posts (all statuses)      |
| POST   | `/api/admin/posts`             | Create new post                    |
| PUT    | `/api/admin/posts/[id]`        | Update post                        |
| DELETE | `/api/admin/posts/[id]`        | Soft delete (archive) post         |
| POST   | `/api/admin/categories`        | Create category                    |
| PUT    | `/api/admin/categories/[id]`   | Update category                    |
| DELETE | `/api/admin/categories/[id]`   | Delete category                    |
| POST   | `/api/admin/upload`            | Upload cover image                 |

### 8.3 Pagination Query Params

All list endpoints support:
- `?page=1` — page number (default: 1)
- `?limit=10` — items per page (default: 10, max: 50)
- `?category=[slug]` — filter by category
- `?tag=[slug]` — filter by tag
- `?sort=latest|oldest` — sort order

### 8.4 Standard Response Format

Success:
```json
{
  "success": true,
  "data": { "..." : "..." },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

Error:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Post not found"
  }
}
```

---

## 9. Frontend Architecture

### 9.1 Folder Structure

```
/app
  /(public)
    /page.tsx                   → Home
    /blog/[slug]/page.tsx       → Post detail
    /category/[slug]/page.tsx   → Category listing
    /tags/[tag]/page.tsx        → Tag listing
    /search/page.tsx            → Search results
    /about/page.tsx             → About page
  /(admin)
    /admin/page.tsx             → Dashboard
    /admin/posts/page.tsx       → Post list
    /admin/posts/new/page.tsx   → Create post
    /admin/posts/[id]/page.tsx  → Edit post
    /admin/categories/page.tsx  → Category management
  /api/
    /posts/route.ts
    /posts/[slug]/route.ts
    /categories/route.ts
    /search/route.ts
    /admin/...

/components
  /ui/            → shadcn/ui base components
  /blog/          → PostCard, PostList, CategoryBadge, TagChip
  /mdx/           → MDXRenderer, Callout, CodeBlock, TOC
  /admin/         → PostEditor, CategoryForm, ImageUpload
  /layout/        → Navbar, Footer, Sidebar

/lib
  /prisma.ts      → Prisma client singleton
  /mdx.ts         → MDX parse/compile utilities
  /reading-time.ts → Reading time calculator
  /search.ts      → Fuse.js search setup
  /auth.ts        → NextAuth config

/types
  /index.ts       → Shared TypeScript interfaces

/prisma
  /schema.prisma
  /seed.ts
```

### 9.2 Key Components

**`<PostCard />`**  
Props: `title`, `slug`, `excerpt`, `category`, `tags`, `readingTime`, `publishedAt`, `coverImage`

**`<MDXRenderer />`**  
- Accepts raw MDX string
- Renders with custom components: `<Callout>`, `<CodeBlock>`, `<Diagram>`
- Wraps Shiki for syntax highlighting

**`<TOC />`** (Table of Contents)  
- Parses `h2` and `h3` from MDX content
- Sticky sidebar on desktop, collapsible on mobile
- Highlights active heading on scroll

---

## 10. Content & Category System

### 10.1 Default Categories (Seed Data)

| Category     | Slug           | Color     | Description                                     |
|--------------|----------------|-----------|-------------------------------------------------|
| Next.js      | `nextjs`       | `#000000` | App router, RSC, SSG/ISR, performance           |
| Databases    | `databases`    | `#336791` | PostgreSQL, Redis, indexing, query optimization |
| Architecture | `architecture` | `#FF6B35` | System design, patterns, scalability            |
| DevOps       | `devops`       | `#2496ED` | Docker, CI/CD, Vercel, deployment               |
| TypeScript   | `typescript`   | `#3178C6` | Types, generics, utility types                  |
| Tools        | `tools`        | `#6C757D` | VS Code, CLI tools, productivity                |
| Projects     | `projects`     | `#28A745` | Personal project documentation                  |

### 10.2 Reading Time Calculation

```ts
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
```

### 10.3 Slug Generation

```ts
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
```

Slugs must be unique — if a conflict exists, append `-2`, `-3`, etc.

---

## 11. Authentication & Authorization

### 11.1 Strategy

- Single author — no public registration
- Credentials login (email + password) via NextAuth.js
- JWT session stored in HTTP-only cookie
- Session expires after 7 days (sliding expiry)

### 11.2 Middleware Protection

```ts
// middleware.ts
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
```

All `/admin/*` routes redirect to `/login` if unauthenticated.

### 11.3 Password Policy

- Minimum 12 characters
- Stored as bcrypt hash (salt rounds: 12)
- No password reset flow in v1 (manual DB update acceptable)

---

## 12. Search System

### 12.1 Client-Side Search (v1 — Fuse.js)

- On app load, fetch a lightweight search index: `{ id, title, excerpt, tags, category }`
- Fuse.js performs fuzzy search client-side
- Results ranked by: title match > tag match > excerpt match
- Index cached in memory, refreshed on page reload

### 12.2 Search Index Endpoint

```
GET /api/search/index
→ Returns array of { id, slug, title, excerpt, category, tags }
```

### 12.3 Future: Full-Text Search (v2)

- Migrate to PostgreSQL full-text search using `tsvector` + `tsquery`
- Or integrate Algolia for advanced ranking and typo-tolerance

---

## 13. Performance & Caching Strategy

### 13.1 Next.js Caching

- Post pages: `revalidate = 60` (ISR)
- Category/home pages: `revalidate = 300`
- Admin pages: `no-store` (always fresh)

### 13.2 Image Optimization

- All images served via `next/image`
- Cover images uploaded to Cloudinary with automatic WebP conversion
- Lazy loading enabled by default
- `sizes` prop configured per layout breakpoint

### 13.3 Bundle Optimization

- Dynamic imports for heavy components: MDX renderer, admin editor
- `@next/bundle-analyzer` used in CI to monitor bundle size
- Font preloading via `next/font`

### 13.4 Core Web Vitals Targets

| Metric | Target   |
|--------|----------|
| LCP    | < 2.5s   |
| FID    | < 100ms  |
| CLS    | < 0.1    |
| TTFB   | < 600ms  |

---

## 14. SEO Strategy

### 14.1 Metadata (per post)

```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  return {
    title: `${post.title} | Your Blog Name`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
      type: 'article',
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}
```

### 14.2 Structured Data (JSON-LD)

Each post page includes `Article` schema:
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Post title",
  "author": { "@type": "Person", "name": "Your Name" },
  "datePublished": "2026-01-01",
  "image": "https://..."
}
```

### 14.3 Sitemap

Auto-generated at `/sitemap.xml` via Next.js `sitemap.ts`:
- All published posts
- All category pages
- All tag pages
- Static pages (home, about)

---

## 15. Edge Cases & Error Handling

### 15.1 Content Edge Cases

| Case | Handling |
|------|----------|
| Post slug collision | Append `-2`, `-3` suffix on save |
| Empty category | Show "Uncategorized" fallback |
| Very long post (>10k words) | TOC still renders; reading time still calculated |
| Invalid MDX syntax | Show parse error in admin editor; block publish |
| Missing cover image | Show gradient placeholder based on category color |
| Deleted category with posts | Prevent deletion if posts exist; prompt reassignment |

### 15.2 API Edge Cases

| Case | Handling |
|------|----------|
| Post not found (`/blog/bad-slug`) | Return 404, render custom 404 page |
| Unauthenticated admin access | Redirect to `/login` with `callbackUrl` |
| Duplicate slug on create | Return 409 Conflict with suggestion |
| Image upload fails | Return error, show retry UI, do not block post save |
| DB connection timeout | Return 503 with retry-after header |
| Search with empty query | Return empty results array, not an error |

### 15.3 UI Edge Cases

| Case | Handling |
|------|----------|
| Very long post title | Truncate with ellipsis on cards; full title on post page |
| Post with no tags | Hide tag section silently |
| No posts in category | Show empty state with CTA to browse other categories |
| No search results | Show "No results found" with suggested categories |
| Offline / network error | Show toast notification with retry button |

---

## 16. Security Considerations

### 16.1 Input Sanitization

- All user-supplied content (post title, slug, tags) sanitized server-side before DB insert
- MDX content rendered in sandboxed context — no arbitrary script execution
- Slugs validated against regex: `/^[a-z0-9-]+$/`

### 16.2 Auth Security

- Admin routes protected by middleware (not just client-side redirect)
- CSRF protection enabled via NextAuth.js
- Rate limiting on `/api/auth/signin`: max 5 attempts per 15 min per IP

### 16.3 HTTP Security Headers

```ts
// next.config.ts
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=()' },
]
```

### 16.4 Environment Variables

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_CLOUD_NAME=
```

Never commit to version control. Stored in Vercel environment settings.

---

## 17. Deployment & DevOps

### 17.1 Environments

| Environment | Branch | URL               | DB          |
|-------------|--------|-------------------|-------------|
| Production  | `main` | `yourdomain.com`  | Neon prod   |
| Preview     | PRs    | `*.vercel.app`    | Neon dev    |
| Local       | any    | `localhost:3000`  | Local PG    |

### 17.2 CI/CD Pipeline (GitHub Actions)

```yaml
on: [push, pull_request]
jobs:
  lint:   # ESLint + TypeScript check
  test:   # Unit tests (Vitest)
  build:  # next build
  deploy: # Vercel deploy (on main merge)
```

### 17.3 Database Migrations

- Managed via Prisma Migrate
- `prisma migrate dev` in local development
- `prisma migrate deploy` in CI before each deployment
- Seed script at `prisma/seed.ts` populates default categories

### 17.4 Monitoring

- Vercel Analytics: Core Web Vitals + traffic
- Sentry: Error tracking (frontend + API routes)
- Uptime: BetterUptime or UptimeRobot (free tier)

---

## 18. Future Roadmap

### v2.0

- [ ] Email newsletter integration (Resend + React Email)
- [ ] Post view count tracking
- [ ] Comment system (giscus — GitHub Discussions-based)
- [ ] Dark/light mode toggle
- [ ] Series / multi-part post support (e.g., "Next.js Deep Dive — Part 1, 2, 3")
- [ ] PostgreSQL full-text search upgrade
- [ ] Draft auto-save to localStorage

### v3.0

- [ ] AI-powered related post suggestions
- [ ] Interactive code playgrounds (embedded StackBlitz)
- [ ] Public roadmap / changelog page
- [ ] Bookmarks / reading list for visitors

---

## Appendix A: Glossary

| Term  | Definition                                                      |
|-------|-----------------------------------------------------------------|
| MDX   | Markdown + JSX — allows React components inside Markdown files  |
| ISR   | Incremental Static Regeneration — Next.js hybrid rendering mode |
| RSC   | React Server Components                                         |
| Slug  | URL-friendly version of a title (e.g., `my-nextjs-post`)        |
| CUID  | Collision-resistant unique ID (used as primary keys)            |

---

*This document is a living specification. Update version and date on each revision.*
