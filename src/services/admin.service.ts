import * as postRepo from "@/repositories/post.repository";
import * as projectRepo from "@/repositories/project.repository";
import * as categoryRepo from "@/repositories/category.repository";
import * as mediaRepo from "@/repositories/media.repository";

export async function getDashboardStats() {
  const [
    postGroups,
    projectGroups,
    totalCategories,
    totalMedia,
    recentPosts,
    recentProjects,
  ] = await Promise.all([
    postRepo.countPosts(),
    projectRepo.countProjects(),
    categoryRepo.countCategories(),
    mediaRepo.countMedia(),
    postRepo.findRecentPosts(5),
    projectRepo.findRecentProjects(5),
  ]);

  const postCount = (status: string) =>
    postGroups.find((g: any) => g.status === status)?._count._all ?? 0;
  const projectCount = (status: string) =>
    projectGroups.find((g: any) => g.status === status)?._count._all ?? 0;

  return {
    totalPosts: postGroups.reduce((s: number, g: any) => s + g._count._all, 0),
    publishedPosts: postCount("PUBLISHED"),
    draftPosts: postCount("DRAFT"),
    totalProjects: projectGroups.reduce((s: number, g: any) => s + g._count._all, 0),
    activeProjects: projectCount("ACTIVE"),
    totalCategories,
    totalMedia,
    recentPosts,
    recentProjects,
  };
}
