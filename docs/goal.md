# Product Goal — Personal Tech Platform

**Version:** 1.0
**Status:** Finalized

---

## What This Is

A personal website that serves as three things at once:

1. **A tech blog** — where I write about everything I learn, explore, or figure out in tech
2. **A project documentation hub** — where each project I build gets its own mini docs site
3. **A knowledge base** — organized by technology so anything I've ever written is findable

This is not a CMS for others. It is not a SaaS product. It is a solo, single-author site that reflects how I actually think and work — by building things and documenting them deeply.

---

## The Core Problem It Solves

When I learn something or build something, that knowledge lives in my head, in scattered notes, or in a GitHub README nobody reads. This platform gives that knowledge a permanent, structured, public home — organized in a way that is useful both to me as a reference and to others who stumble upon it.

---

## Who It Is For

**Primary:** Me — as a writing and reference tool I use daily.

**Secondary:** Other developers who find my content via search, social, or direct links and want to read about a specific technology, tool, or project.

There are no user accounts, no comments, no community. It is a read-only public site with a private admin.

---

## The Three Pillars

### 1. Blog

A place for all written content — regardless of whether it's tied to a project or not.

Every post belongs to one of three types:

- **Concept** — explains a technology, pattern, or idea I learned (e.g. "How B-tree indexing works", "Understanding Next.js middleware")
- **Tool** — documents a specific tool, library, or feature I used (e.g. "Prisma joins explained", "Using Upstash for rate limiting")
- **Project writeup** — a narrative about building something; always linked to a project

All posts appear on the global `/blog` page. Posts linked to a project show a badge with the project name. Standalone posts show no badge.

A post always lives at `/blog/[slug]`. Even if it is later linked to a project, its URL never changes.

---

### 2. Projects

Each project I build gets its own mini documentation site — not a single page, but a structured space with a sidebar, chapters, and content.

A project contains:

- **Overview** — the project name, description, status, repo link, live link, tech stack, and categories
- **Doc pages** — structured reference content I write (setup guides, architecture decisions, database design, lessons learned, etc.)
- **Blog posts** — narrative writeups linked to this project, appearing in the sidebar alongside doc pages

The sidebar is organized into sections (like a real docs site) with manually ordered pages. Some pages are standalone; others are grouped under a named section.

**Example project sidebar:**
```
Overview
─────────────────────────
Getting started
  └─ Installation
  └─ Environment setup
─────────────────────────
Architecture
  └─ System design
  └─ Database schema
  └─ Why I chose Supabase     ← blog post
─────────────────────────
Lessons learned               ← standalone blog post
```

All project content lives under `/projects/[slug]/[page-slug]`. Blog posts that appear inside a project also remain accessible at `/blog/[slug]` with a canonical URL pointing there.

A project is never deleted — only archived. Archiving hides it from listings but keeps all URLs alive.

---

### 3. Categories

One global category system applies to everything — blog posts, doc pages, and projects alike.

Categories are technology-based:

| Category | Examples of content |
|---|---|
| Next.js | App Router guide, middleware post, blog platform project |
| Databases | PostgreSQL indexing post, Prisma setup doc, schema design doc |
| Architecture | System design post, API design doc |
| DevOps | CI/CD setup doc, Docker post |
| Frontend | React patterns post, CSS architecture doc |
| Backend | Auth system doc, REST API design post |
| Tools & DX | VSCode setup post, Git workflow doc |
| AI & ML | Prompting guide post, embedding search doc |

A `/categories/[slug]` page shows all content tagged with that category, grouped into three sections: Projects, Doc pages, Posts.

Categories support subcategories (e.g. Databases → PostgreSQL, Redis).

---

## Content Relationships

```
Standalone post ──────────────────────────── appears on /blog
                                                    │
                        can be promoted to a project│
                                                    ▼
Project ──── Overview
         ├── Doc pages  ──────────────────── appear in project sidebar
         └── Blog posts ──────────────────── appear in project sidebar
                         │                   AND on /blog with badge
                         └── canonical URL always /blog/[slug]

All content ──── tagged with categories ──── appear on /categories/[slug]
```

---

## What Success Looks Like

**For me as the author:**
- I can write a post and publish it in under 5 minutes from the admin
- I can create a new project, add sections, add doc pages, and link posts to it — all from one dashboard
- Everything I've written is findable by topic in under 10 seconds
- The site works as my personal reference — I can look up anything I documented

**For a reader:**
- Landing on a blog post feels like reading a well-formatted dev article — clean, code-highlighted, with a table of contents
- Landing on a project feels like reading a real documentation site — sidebar navigation, ordered chapters, clear structure
- Browsing by category shows a rich mix of everything I've written on that topic
- The site is fast, works on mobile, and supports dark mode

---

## What This Is Not

- Not a multi-author platform
- Not a community or forum
- Not a newsletter or subscription product (may be added later)
- Not a portfolio with pretty animations — content and structure come first
- Not a wiki that anyone else can edit

---

## Technical Constraints

- Single author, single admin user
- Deployed on Vercel, database on Supabase (PostgreSQL)
- All content written in MDX (Markdown + JSX components)
- No client-side rendering for public pages — SSG with ISR
- Admin is client-side only — no SEO needed there
- Mobile-first, dark mode by default, no ads ever

---

## The One Sentence

> A personal site where every project I build becomes a mini docs site, every concept I learn becomes a blog post, and everything is organized so that anyone — including future me — can find it.

---

*This document defines the goal. Everything else — architecture, data models, execution plan — exists to serve this goal.*
