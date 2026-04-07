/**
 * JSON/API shapes used by admin client components (`fetch` to `/api/v1/...`).
 * Keeps a single definition per entity instead of duplicating `interface` blocks.
 */

/** Section option for dropdowns and lists (promote modal, doc editor, project dashboard). */
export type AdminSectionOption = {
  id: string;
  title: string;
  /** Set when derived from nested `section` on a project item. */
  order?: number;
};

/** Row from `GET /api/v1/projects` (listed projects). */
export type AdminProjectSummaryFromApi = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  repoUrl: string | null;
  liveUrl: string | null;
  techStack: string[];
  categories: { category: { id: string; name: string } }[];
};

/** Minimal identifiers for resolving slug from admin route `projectId`. */
export type AdminProjectIdSlug = {
  id: string;
  slug: string;
};

/** Row from `GET /api/v1/projects/:slug/items` on the project dashboard. */
export type AdminProjectItemApiRow = {
  id: string;
  type: "DOC" | "POST";
  status: string;
  slug: string;
  order: number;
  title: string | null;
  sectionId: string | null;
  post?: { title: string; slug: string } | null;
  section?: { title: string; order?: number } | null;
};

/** Doc item fields when reading the items list on the doc editor page. */
export type AdminDocItemFromItemsApi = {
  id: string;
  title: string | null;
  slug: string;
  body: string | null;
  sectionId: string | null;
  order: number;
  status: string;
  section?: { title: string } | null;
};

/** Entry in the unlinked-posts list for “promote to project”. */
export type AdminUnlinkedPostOption = {
  id: string;
  title: string;
  slug: string;
  type: string;
};

export type AdminPromotePostModalProps = {
  open: boolean;
  onClose: () => void;
  projectId: string;
  sections: AdminSectionOption[];
  onSuccess: () => void;
};
