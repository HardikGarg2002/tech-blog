import type { Post, Category, Tag, Project, ProjectItem, ProjectSection } from "@prisma/client";

export type {
  AdminSectionOption,
  AdminProjectSummaryFromApi,
  AdminProjectIdSlug,
  AdminProjectItemApiRow,
  AdminDocItemFromItemsApi,
  AdminUnlinkedPostOption,
  AdminPromotePostModalProps,
} from "./admin";

export type PostWithRelations = Post & {
  categories: {
    category: Category;
  }[];
  tags: {
    tag: Tag;
  }[];
  linkedProject?: Project | null;
};

export type ProjectWithRelations = Project & {
  categories: {
    category: Category;
  }[];
};

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

export type CategoryWithChildren = Category & {
  children?: Category[];
  _count?: {
    posts: number;
    projects: number;
  };
};

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  type: "post" | "project";
  categories: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
