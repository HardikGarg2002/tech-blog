# Claude Code Execution Plan — Project Mini-Site Addition
# New phases only — runs AFTER execution-plan.md is complete

> **Depends on:** `execution-plan.md` (all 11 phases done)
> **Architecture reference:** `content-architecture.md`
> **Layer rules:** `layer-separation-patch.md` (strict UI → Service → Repository → DB)

---

## What This Plan Adds

The base plan built a blog + basic project page. This plan turns projects into
full mini doc-sites with:

- `ProjectSection` — named sidebar groups
- `ProjectItem` — unified doc page or blog post inside a project
- Sidebar layout with mixed flat + grouped navigation
- Project-scoped URLs `/projects/[slug]/[item-slug]`
- Promote a standalone post into a project
- Project admin dashboard with sidebar manager
- `/admin/docs` section for managing doc pages across all projects
- Updated category pages that surface all content types

---

## Phase A — Schema: Add ProjectSection and ProjectItem

### Step A.1 — Add models to Prisma schema

Open `prisma/schema.prisma` and add the following models. Do not touch any existing model except `Post` and `Project` as noted below.

```prisma
model ProjectSection {
  id        String        @id @default(cuid())
  title     String
  order     Int
  projectId String
  project   Project       @relation(fields: [projectId], references: [id])
  items     ProjectItem[]
  createdAt DateTime      @default(now())

  @@index([projectId])
  @@index([projectId, order])
}

model ProjectItem {
  id        String          @id @default(cuid())
  type      ProjectItemType
  order     Int
  slug      String
  projectId String
  project   Project         @relation(fields: [projectId], references: [id])
  sectionId String?
  section   ProjectSection? @relation(fields: [sectionId], references: [id], onDelete: SetNull)
  status    ItemStatus      @default(DRAFT)
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt

  // DOC type fields
  title     String?
  body      String?

  // POST type fields
  postId    String?
  post      Post?           @relation(fields: [postId], references: [id], onDelete: SetNull)

  @@unique([projectId, slug])
  @@index([projectId, order])
  @@index([sectionId])
  @@index([postId])
}

enum ProjectItemType {
  DOC
  POST
}

enum ItemStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### Step A.2 — Update Post model

Add this field to the existing `Post` model:

```prisma
linkedProjectId String?
linkedProject   Project?      @relation("PostToProject", fields: [linkedProjectId], references: [id], onDelete: SetNull)
projectItems    ProjectItem[]

@@index([linkedProjectId])
```

Also add `type` enum and field to `Post`:

```prisma
enum PostType {
  CONCEPT
  TOOL
  PROJECT_WRITEUP
}

// inside Post model:
type  PostType @default(CONCEPT)
```

### Step A.3 — Update Project model

Add these relations to the existing `Project` model:

```prisma
sections     ProjectSection[]
items        ProjectItem[]
linkedPosts  Post[]           @relation("PostToProject")
```

### Step A.4 — Run migration

```bash
npx prisma migrate dev --name add-project-items-and-sections
npx prisma generate
```

Verify migration succeeds with zero errors before continuing.

---

## Phase B — Repository Layer

Create one file per new domain. Follow the same pattern as existing repositories —
pure Prisma queries only, no validation, no business logic.

### Step B.1 — Create `src/repositories/projectItem.repository.ts`

```ts
import { prisma } from "@/lib/prisma";
import { ProjectItemType, ItemStatus, Prisma } from "@prisma/client";

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

  // DOC items: check own status
  if (item.type === ProjectItemType.DOC && item.status !== ItemStatus.PUBLISHED) {
    return null;
  }

  // POST items: check linked post status
  if (item.type === ProjectItemType.POST && item.post?.status !== "PUBLISHED") {
    return null;
  }

  return item;
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
```

### Step B.2 — Create `src/repositories/projectSection.repository.ts`

```ts
import { prisma } from "@/lib/prisma";

export async function findSectionsByProject(projectId: string) {
  return prisma.projectSection.findMany({
    where: { projectId },
    include: { items: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });
}

export async function findSectionById(id: string) {
  return prisma.projectSection.findUnique({
    where: { id },
    include: { items: true },
  });
}

export async function createSection(data: {
  title: string;
  order: number;
  projectId: string;
}) {
  return prisma.projectSection.create({ data });
}

export async function updateSection(
  id: string,
  data: Partial<{ title: string; order: number }>
) {
  return prisma.projectSection.update({ where: { id }, data });
}

export async function deleteSection(id: string) {
  // Orphan items (set sectionId to null) before deleting
  await prisma.projectItem.updateMany({
    where: { sectionId: id },
    data: { sectionId: null },
  });
  return prisma.projectSection.delete({ where: { id } });
}

export async function getMaxSectionOrder(projectId: string) {
  const result = await prisma.projectSection.aggregate({
    where: { projectId },
    _max: { order: true },
  });
  return result._max.order ?? 0;
}
```

### Step B.3 — Update `src/repositories/post.repository.ts`

Add `type` and `linkedProjectId` filters to `PostFindManyArgs` and `findManyPosts`:

```ts
// Add to PostFindManyArgs type:
type?: PostType;
linkedProjectId?: string;

// Add to where object inside findManyPosts:
...(args.type && { type: args.type }),
...(args.linkedProjectId !== undefined && { linkedProjectId: args.linkedProjectId }),
```

Add a new function for fetching posts eligible to be added to a project
(published posts not yet linked to any project):

```ts
export async function findUnlinkedPublishedPosts() {
  return prisma.post.findMany({
    where: { status: "PUBLISHED", linkedProjectId: null },
    select: { id: true, title: true, slug: true, type: true },
    orderBy: { publishedAt: "desc" },
  });
}
```

---

## Phase C — Service Layer

### Step C.1 — Create `src/services/projectItem.service.ts`

```ts
import { z } from "zod";
import { ItemStatus } from "@prisma/client";
import { toSlug, uniqueSlug } from "@/lib/slugify";
import { Errors } from "@/lib/errors";
import * as itemRepo from "@/repositories/projectItem.repository";
import * as postRepo from "@/repositories/post.repository";
import { revalidatePath } from "next/cache";

export const createDocItemSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1).max(200),
  slug: z.string().optional(),
  body: z.string().min(1),
  order: z.number().int().optional(),
  sectionId: z.string().optional(),
});

export const createPostItemSchema = z.object({
  projectId: z.string(),
  postId: z.string(),
  slug: z.string().optional(),
  order: z.number().int().optional(),
  sectionId: z.string().optional(),
});

export async function createDocItem(input: z.infer<typeof createDocItemSchema>) {
  const parsed = createDocItemSchema.safeParse(input);
  if (!parsed.success) throw Errors.INVALID_INPUT(parsed.error.message);

  const { projectId, title, body, sectionId, slug: customSlug } = parsed.data;

  const slug = await uniqueSlug(
    customSlug ?? title,
    (s) => itemRepo.itemSlugExists(projectId, s)
  );

  const order = parsed.data.order ?? (await itemRepo.getMaxOrder(projectId)) + 1;

  const item = await itemRepo.createDocItem({ projectId, slug, title, body, order, sectionId });

  revalidatePath(`/projects/${projectId}`);
  return item;
}

export async function createPostItem(input: z.infer<typeof createPostItemSchema>) {
  const parsed = createPostItemSchema.safeParse(input);
  if (!parsed.success) throw Errors.INVALID_INPUT(parsed.error.message);

  const { projectId, postId, sectionId, slug: customSlug } = parsed.data;

  // Verify post exists
  const post = await postRepo.findPostById(postId);
  if (!post) throw Errors.NOT_FOUND("Post", postId);

  const slug = await uniqueSlug(
    customSlug ?? post.slug,
    (s) => itemRepo.itemSlugExists(projectId, s)
  );

  const order = parsed.data.order ?? (await itemRepo.getMaxOrder(projectId)) + 1;

  // Link the post to the project
  await postRepo.updatePost(postId, { linkedProjectId: projectId, type: "PROJECT_WRITEUP" });

  const item = await itemRepo.createPostItem({ projectId, postId, slug, order, sectionId });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/blog/${post.slug}`);
  return item;
}

export async function publishDocItem(id: string, projectSlug: string) {
  const item = await itemRepo.findItemBySlug("", ""); // fetch by id below
  // Use updateDocItem with status
  await itemRepo.updateDocItem(id, { status: ItemStatus.PUBLISHED });
  revalidatePath(`/projects/${projectSlug}`);
}

export async function updateDocItem(
  id: string,
  projectSlug: string,
  data: Partial<{ title: string; body: string; order: number; sectionId: string | null; slug: string; status: ItemStatus }>
) {
  await itemRepo.updateDocItem(id, data);
  revalidatePath(`/projects/${projectSlug}`);
}

export async function deleteItem(id: string, projectSlug: string) {
  await itemRepo.deleteItem(id);
  revalidatePath(`/projects/${projectSlug}`);
}

export async function getProjectSidebar(projectId: string) {
  return itemRepo.findItemsByProject(projectId);
}

export async function getProjectItemBySlug(projectId: string, slug: string) {
  const item = await itemRepo.findPublishedItemBySlug(projectId, slug);
  if (!item) throw Errors.NOT_FOUND("ProjectItem", slug);
  return item;
}
```

### Step C.2 — Create `src/services/projectSection.service.ts`

```ts
import { z } from "zod";
import { Errors } from "@/lib/errors";
import * as sectionRepo from "@/repositories/projectSection.repository";
import { revalidatePath } from "next/cache";

export const createSectionSchema = z.object({
  title: z.string().min(1).max(100),
  projectId: z.string(),
  order: z.number().int().optional(),
});

export async function createSection(input: z.infer<typeof createSectionSchema>) {
  const parsed = createSectionSchema.safeParse(input);
  if (!parsed.success) throw Errors.INVALID_INPUT(parsed.error.message);

  const order =
    parsed.data.order ?? (await sectionRepo.getMaxSectionOrder(parsed.data.projectId)) + 1;

  return sectionRepo.createSection({ ...parsed.data, order });
}

export async function updateSection(
  id: string,
  data: Partial<{ title: string; order: number }>,
  projectSlug: string
) {
  const section = await sectionRepo.findSectionById(id);
  if (!section) throw Errors.NOT_FOUND("ProjectSection", id);

  await sectionRepo.updateSection(id, data);
  revalidatePath(`/projects/${projectSlug}`);
}

export async function deleteSection(id: string, projectSlug: string) {
  const section = await sectionRepo.findSectionById(id);
  if (!section) throw Errors.NOT_FOUND("ProjectSection", id);

  // Items are orphaned (sectionId → null) by the repository
  await sectionRepo.deleteSection(id);
  revalidatePath(`/projects/${projectSlug}`);
}

export async function getSectionsForProject(projectId: string) {
  return sectionRepo.findSectionsByProject(projectId);
}
```

### Step C.3 — Update `src/services/post.service.ts`

Add `type` to `createPostSchema`:

```ts
type: z.enum(["CONCEPT", "TOOL", "PROJECT_WRITEUP"]).default("CONCEPT"),
```

Add `getUnlinkedPosts` function for the "promote post" admin UI:

```ts
export async function getUnlinkedPosts() {
  return postRepo.findUnlinkedPublishedPosts();
}
```

---

## Phase D — API Routes

All routes follow the same pattern from `layer-separation-patch.md`:
call service only, catch `AppError`, never import Prisma or repositories.

### Step D.1 — Project items — public read

Create `src/app/api/v1/projects/[slug]/items/route.ts` (GET):
- Call `projectItem.service.getProjectSidebar` using the project id resolved from slug
- Return full sidebar array for rendering navigation

Create `src/app/api/v1/projects/[slug]/[itemSlug]/route.ts` (GET):
- Resolve project by slug via `project.service.getProject`
- Call `projectItem.service.getProjectItemBySlug`
- Return 404 if not found or not published

### Step D.2 — Project items — admin CRUD

Create `src/app/api/v1/admin/projects/[id]/items/route.ts`:

- POST — create a doc item: call `projectItem.service.createDocItem`
- Body: `{ title, slug?, body, order?, sectionId? }`

Create `src/app/api/v1/admin/projects/[id]/items/[itemId]/route.ts`:

- PUT — update doc item: call `projectItem.service.updateDocItem`
- DELETE — delete item: call `projectItem.service.deleteItem`

Create `src/app/api/v1/admin/projects/[id]/items/promote/route.ts` (POST):
- Body: `{ postId, slug?, order?, sectionId? }`
- Call `projectItem.service.createPostItem`

Create `src/app/api/v1/admin/projects/[id]/items/[itemId]/publish/route.ts` (POST):
- Call `projectItem.service.publishDocItem`

### Step D.3 — Project sections — admin CRUD

Create `src/app/api/v1/admin/projects/[id]/sections/route.ts`:
- POST: call `projectSection.service.createSection`
- Body: `{ title, order? }`

Create `src/app/api/v1/admin/projects/[id]/sections/[sectionId]/route.ts`:
- PUT: call `projectSection.service.updateSection`
- DELETE: call `projectSection.service.deleteSection`

### Step D.4 — Posts: add type filter

Update `src/app/api/v1/posts/route.ts` (GET):
- Add `?type=` query param — pass to `post.service.listPosts`
- Add `?linkedProjectId=` query param — pass to `post.service.listPosts`

---

## Phase E — Public Pages & Layouts

### Step E.1 — Project page with sidebar layout

Create `src/app/projects/[slug]/layout.tsx`:

This is the shell for all project content. It renders:
- Left sidebar (fixed on desktop, drawer on mobile)
- Main content area (right of sidebar)
- Sidebar is populated by `projectItem.service.getProjectSidebar`

**Sidebar rendering logic:**

```
1. Fetch all ProjectItems for the project, ordered by `order`
2. Fetch all ProjectSections for the project, ordered by `order`
3. Build sidebar tree:
   - Items with no sectionId → render flat at their position
   - Items with a sectionId → group under their section label
   - Sort everything together by order
4. Always prepend "Overview" link to /projects/[slug] at the top
```

**Sidebar item appearance:**
- DOC items: plain link with title
- POST items: link with a small "Post" badge (pill) in muted color
- Active item: highlighted with accent left border
- Section label: uppercase muted text, not clickable

### Step E.2 — Project overview page

Create `src/app/projects/[slug]/page.tsx`:

Renders inside the layout from E.1. Shows:
- Project name, description, status badge
- Tech stack pills
- Repo + live URL links
- Categories
- Stats: number of doc pages, number of posts

Call `project.service.getProject` for data.

### Step E.3 — Project item page (doc or post)

Create `src/app/projects/[slug]/[itemSlug]/page.tsx`:

- Call `projectItem.service.getProjectItemBySlug`
- If `item.type === DOC`: render title + MDX body + table of contents
- If `item.type === POST`: render as a blog post (reuse blog post page components)
  - Show "Part of project: [name]" breadcrumb at top
  - Show next/prev item navigation at bottom (previous and next in sidebar order)
- `generateStaticParams`: return all published items across all projects
- `export const revalidate = 60`

**Next/prev navigation logic:**
- Fetch full sidebar for the project
- Flatten all items in order (ignore section grouping for prev/next purposes)
- Find current item's position, return adjacent items

### Step E.4 — Update `/blog` page

Update `src/app/blog/page.tsx`:

- Posts with `linkedProjectId !== null` show a project badge
- Badge shows project name, links to `/projects/[project-slug]`
- Add filter: "All", "Standalone only", "Project posts only"
- Add filter: by type (CONCEPT, TOOL, PROJECT_WRITEUP)

### Step E.5 — Update `/categories/[slug]` page

Update `src/app/category/[slug]/page.tsx`:

Group content into three sections on the page:

```tsx
// Section 1: Projects tagged with this category
<section>
  <h2>Projects</h2>
  {projects.map(p => <ProjectCard key={p.id} project={p} />)}
</section>

// Section 2: Doc pages tagged with this category
<section>
  <h2>Documentation</h2>
  {docItems.map(item => <DocItemCard key={item.id} item={item} />)}
</section>

// Section 3: Blog posts tagged with this category
<section>
  <h2>Posts</h2>
  {posts.map(p => <PostCard key={p.id} post={p} />)}
</section>
```

For doc items on a category page — categories on `ProjectItem` DOC type are inherited from the parent Project's categories. Query: all published DOC items whose parent project has this category.

---

## Phase F — New UI Components

### Step F.1 — `src/components/project/ProjectSidebar.tsx`

Props: `items: ProjectItem[]`, `sections: ProjectSection[]`, `projectSlug: string`, `activeSlug: string`

Renders the sidebar tree. Logic:
- Build a sorted flat list combining sections and unsectioned items by `order`
- Sections render as non-clickable group headers
- Items inside sections render indented below their header
- Active item gets `aria-current="page"` and accent styling

### Step F.2 — `src/components/project/ProjectItemNav.tsx`

Props: `prev: ProjectItem | null`, `next: ProjectItem | null`, `projectSlug: string`

Renders previous/next navigation at the bottom of every project item page:

```
← Previous: Setup & Installation        Architecture: DB Design →
```

### Step F.3 — `src/components/project/ProjectBadge.tsx`

Props: `projectName: string`, `projectSlug: string`

Small pill badge shown on `/blog` listing for posts that belong to a project.
Clicking navigates to `/projects/[projectSlug]`.

### Step F.4 — `src/components/project/ProjectCard.tsx`

Props: `project: ProjectWithRelations`

Card shown on `/projects` listing and on category pages. Shows:
- Name, description, status badge, tech stack pills, category badges
- Doc page count + post count
- Repo and live URL icon links

### Step F.5 — `src/components/project/DocItemCard.tsx`

Props: `item: ProjectItem & { project: Project }`

Card shown on category pages for doc items. Shows:
- Item title
- Project name as subtitle with link
- Status badge

---

## Phase G — Admin: Project Dashboard

### Step G.1 — Project list page

Update `src/app/admin/projects/page.tsx`:
- Table of all projects with status badge, item count, section count
- Actions: Edit metadata, Open dashboard, Archive

### Step G.2 — Project dashboard

Create `src/app/admin/projects/[id]/page.tsx`:

This is the central hub for managing one project. It shows:

**Left panel — Sidebar manager:**
- Visual representation of the current sidebar tree
- Each item shows: order number, title/post title, type badge (DOC/POST), status badge
- Actions per item: Edit, Publish/Unpublish, Delete
- Actions per section: Rename, Delete (items become unsectioned)
- "Add doc page" button → opens inline form: title, slug (auto-generated), body (MDX editor), order, section select
- "Add section" button → inline form: title, order
- "Promote existing post" button → opens modal with searchable list of unlinked published posts

**Right panel — Project metadata:**
- Edit form: name, description, status, repoUrl, liveUrl, techStack (tag chips), categories

### Step G.3 — Doc page editor

Create `src/app/admin/projects/[id]/items/[itemId]/edit/page.tsx`:

Same split-pane MDX editor as blog post editor:
- Left: MDX editor with title, slug, order, section select, status
- Right: live preview
- Auto-save draft every 30s
- Publish button → calls publish endpoint → sets status to PUBLISHED

### Step G.4 — Promote post modal component

Create `src/components/admin/PromotePostModal.tsx`:

- Fetches unlinked published posts via `GET /api/v1/posts?linkedProjectId=null`
- Searchable list of posts
- Select a post → choose order + section → submit
- Calls `POST /api/v1/admin/projects/[id]/items/promote`
- On success: close modal, refresh sidebar manager

---

## Phase H — Admin: /admin/docs Section

### Step H.1 — Docs listing page

Create `src/app/admin/docs/page.tsx`:

- Table of all `ProjectItem` records where `type = DOC` across all projects
- Columns: title, project name, section, status, order, last updated
- Filter by: project, status
- Actions: Edit (opens editor), Publish, Archive, Delete

### Step H.2 — Add to admin sidebar nav

Update `src/app/admin/layout.tsx`:

Add "Docs" to the admin sidebar between "Projects" and "Categories":

```
Dashboard
Posts
Projects
Docs          ← new
Categories
Media
```

---

## Phase I — Types Update

### Step I.1 — Update `src/types/index.ts`

Add these types:

```ts
import { ProjectItem, ProjectSection, ProjectItemType, ItemStatus, PostType } from "@prisma/client";

export type ProjectItemWithRelations = ProjectItem & {
  section: ProjectSection | null;
  post: PostWithRelations | null;
};

export type ProjectSectionWithItems = ProjectSection & {
  items: ProjectItem[];
};

export type SidebarEntry =
  | { kind: "item"; item: ProjectItemWithRelations }
  | { kind: "section"; section: ProjectSectionWithItems; items: ProjectItemWithRelations[] };

export type SidebarTree = SidebarEntry[];
```

Add a `buildSidebarTree` utility function to `src/lib/sidebar.ts`:

```ts
import { ProjectItemWithRelations, ProjectSectionWithItems, SidebarTree } from "@/types";

export function buildSidebarTree(
  items: ProjectItemWithRelations[],
  sections: ProjectSectionWithItems[]
): SidebarTree {
  const sectionMap = new Map(sections.map((s) => [s.id, s]));
  const tree: SidebarTree = [];
  const addedSections = new Set<string>();

  const allEntries = [
    ...items.map((item) => ({ kind: "item" as const, item, order: item.order, sectionId: item.sectionId })),
    ...sections.map((section) => ({ kind: "section-header" as const, section, order: section.order, sectionId: null })),
  ].sort((a, b) => a.order - b.order);

  for (const entry of allEntries) {
    if (entry.kind === "section-header") {
      if (!addedSections.has(entry.section.id)) {
        const sectionItems = items
          .filter((i) => i.sectionId === entry.section.id)
          .sort((a, b) => a.order - b.order);
        tree.push({ kind: "section", section: entry.section, items: sectionItems });
        addedSections.add(entry.section.id);
      }
    } else if (!entry.sectionId) {
      tree.push({ kind: "item", item: entry.item });
    }
  }

  return tree;
}
```

---

## Phase J — Verification

### Step J.1 — Type check and build

```bash
npx tsc --noEmit
npx next build
```

Fix all type errors before continuing.

### Step J.2 — Database integrity check

```bash
npx prisma studio
```

Verify:
- `ProjectItem` table exists with correct columns
- `ProjectSection` table exists with correct columns
- `Post` table has `type` and `linkedProjectId` columns

### Step J.3 — Manual smoke tests

Run `npx next dev` and verify each of the following:

**Project mini-site:**
- [ ] `/projects` lists all projects as cards with correct counts
- [ ] `/projects/[slug]` shows overview page with sidebar
- [ ] Sidebar shows flat items and section groups in correct order
- [ ] `/projects/[slug]/[item-slug]` renders a DOC page with MDX content
- [ ] `/projects/[slug]/[item-slug]` renders a POST page with project breadcrumb
- [ ] Next/prev navigation appears at bottom and links to correct adjacent items
- [ ] Mobile sidebar opens as drawer, closes on navigation

**Blog page:**
- [ ] `/blog` shows both standalone and project posts
- [ ] Project posts have a project badge with correct project name
- [ ] Filter by type works (CONCEPT / TOOL / PROJECT_WRITEUP)
- [ ] Standalone-only filter hides project posts

**Category page:**
- [ ] `/categories/[slug]` shows three sections: Projects, Documentation, Posts
- [ ] All three sections only show content tagged with that category

**Admin:**
- [ ] `/admin/projects/[id]` shows sidebar manager + metadata editor
- [ ] Adding a doc page appears in sidebar manager immediately
- [ ] Adding a section and assigning items to it groups them correctly
- [ ] "Promote existing post" modal lists unlinked posts and links them on submit
- [ ] `/admin/docs` lists all doc pages across projects with correct filters
- [ ] Editing a doc page in the split-pane editor saves correctly
- [ ] Publishing a doc item makes it visible on the public project page

---

## Appendix — New Files Created by This Plan

```
src/
├── repositories/
│   ├── projectItem.repository.ts       ← Phase B.1
│   └── projectSection.repository.ts   ← Phase B.2
│
├── services/
│   ├── projectItem.service.ts          ← Phase C.1
│   └── projectSection.service.ts      ← Phase C.2
│
├── app/
│   ├── projects/
│   │   └── [slug]/
│   │       ├── layout.tsx              ← Phase E.1 (sidebar shell)
│   │       ├── page.tsx                ← Phase E.2 (overview)
│   │       └── [itemSlug]/
│   │           └── page.tsx            ← Phase E.3 (doc or post)
│   │
│   ├── api/v1/
│   │   ├── projects/[slug]/
│   │   │   ├── items/route.ts          ← Phase D.1
│   │   │   └── [itemSlug]/route.ts     ← Phase D.1
│   │   └── admin/projects/[id]/
│   │       ├── items/route.ts          ← Phase D.2
│   │       ├── items/promote/route.ts  ← Phase D.2
│   │       ├── items/[itemId]/route.ts ← Phase D.2
│   │       ├── items/[itemId]/publish/route.ts ← Phase D.2
│   │       ├── sections/route.ts       ← Phase D.3
│   │       └── sections/[sectionId]/route.ts ← Phase D.3
│   │
│   └── admin/
│       ├── projects/
│       │   └── [id]/
│       │       ├── page.tsx            ← Phase G.2 (project dashboard)
│       │       └── items/[itemId]/edit/page.tsx ← Phase G.3
│       └── docs/
│           └── page.tsx                ← Phase H.1
│
├── components/
│   ├── project/
│   │   ├── ProjectSidebar.tsx          ← Phase F.1
│   │   ├── ProjectItemNav.tsx          ← Phase F.2
│   │   ├── ProjectBadge.tsx            ← Phase F.3
│   │   ├── ProjectCard.tsx             ← Phase F.4
│   │   └── DocItemCard.tsx             ← Phase F.5
│   └── admin/
│       └── PromotePostModal.tsx        ← Phase G.4
│
└── lib/
    └── sidebar.ts                      ← Phase I.1 (buildSidebarTree)
```

---

*Run phases A → J in order. Do not skip. Report any migration or type errors immediately.*