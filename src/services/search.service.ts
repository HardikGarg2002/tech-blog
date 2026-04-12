import Fuse from "fuse.js";
import { listPosts } from "@/services/post.service";
import { getListedProjects } from "@/services/project.service";
import type { PostCardModel, ProjectWithRelations, SearchResult } from "@/types";

export async function performSiteSearch(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const [postsData, projects] = await Promise.all([
    listPosts({ perPage: 100, forCard: true }),
    getListedProjects(),
  ]);

  const formattedPosts = (postsData.data as PostCardModel[]).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    type: "post" as const,
    categories: p.categories.map((cp) => cp.category.name),
    tags: p.tags.map((tp) => tp.tag.name),
  }));

  const formattedProjects = (projects as ProjectWithRelations[]).map((p) => ({
    id: p.id,
    title: p.name,
    slug: p.slug,
    excerpt: p.description,
    type: "project" as const,
    categories: p.categories.map((cp) => cp.category.name),
    tags: p.techStack,
  }));

  const searchData = [...formattedPosts, ...formattedProjects];

  const fuse = new Fuse(searchData, {
    keys: ["title", "excerpt", "categories", "tags"],
    threshold: 0.3,
  });

  return fuse.search(q).slice(0, 20).map((r) => {
    const x = r.item;
    return {
      id: x.id,
      title: x.title,
      slug: x.slug,
      excerpt: x.excerpt,
      type: x.type,
      categories: x.categories,
    };
  });
}
