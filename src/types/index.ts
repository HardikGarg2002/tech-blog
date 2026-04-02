import type { Post, Category, Tag, Project } from "@prisma/client";

export type PostWithRelations = Post & {
  categories: {
    category: Category;
  }[];
  tags: {
    tag: Tag;
  }[];
};

export type ProjectWithRelations = Project & {
  categories: {
    category: Category;
  }[];
};

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
