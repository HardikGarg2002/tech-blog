import type { MetadataRoute } from "next";
import { getAllPublishedSlugs } from "@/services/post.service";
import { getAllProjectSlugs } from "@/services/project.service";
import { getAllCategorySlugs } from "@/services/category.service";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, projects, categories] = await Promise.all([
    getAllPublishedSlugs(),
    getAllProjectSlugs(),
    getAllCategorySlugs(),
  ]);

  const now = new Date();

  return [
    { url: siteConfig.url, lastModified: now },
    { url: `${siteConfig.url}/blog`, lastModified: now },
    { url: `${siteConfig.url}/projects`, lastModified: now },
    { url: `${siteConfig.url}/search`, lastModified: now },
    ...posts.map((post) => ({
      url: `${siteConfig.url}/blog/${post.slug}`,
      lastModified: post.updatedAt,
    })),
    ...projects.map((project) => ({
      url: `${siteConfig.url}/projects/${project.slug}`,
      lastModified: project.updatedAt,
    })),
    ...categories.map((category) => ({
      url: `${siteConfig.url}/category/${category.slug}`,
      lastModified: category.createdAt,
    })),
  ];
}
