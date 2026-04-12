import * as postRepo from "@/repositories/post.repository";
import * as projectRepo from "@/repositories/project.repository";
import * as categoryRepo from "@/repositories/category.repository";
import * as mediaRepo from "@/repositories/media.repository";

type CountGroup = { status: string; _count: { _all: number } };

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
    (postGroups as CountGroup[]).find((g) => g.status === status)?._count._all ?? 0;
  const projectCount = (status: string) =>
    (projectGroups as CountGroup[]).find((g) => g.status === status)?._count._all ?? 0;

  return {
    totalPosts: (postGroups as CountGroup[]).reduce((sum, group) => sum + group._count._all, 0),
    publishedPosts: postCount("PUBLISHED"),
    draftPosts: postCount("DRAFT"),
    totalProjects: (projectGroups as CountGroup[]).reduce(
      (sum, group) => sum + group._count._all,
      0
    ),
    activeProjects: projectCount("ACTIVE"),
    totalCategories,
    totalMedia,
    recentPosts,
    recentProjects,
  };
}
