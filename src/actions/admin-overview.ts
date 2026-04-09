"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { actionError, type ActionResult } from "./action-result";

async function requireAdmin(): Promise<ActionResult<never> | { ok: true }> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Unauthorized", code: "UNAUTHORIZED" };
  }
  return { ok: true };
}

export type DashboardStats = {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalProjects: number;
  activeProjects: number;
  totalCategories: number;
  totalMedia: number;
  recentPosts: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    createdAt: Date;
  }>;
  recentProjects: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    createdAt: Date;
  }>;
};

export async function loadDashboardStats(): Promise<ActionResult<DashboardStats>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    const [postGroups, projectGroups, totalCategories, totalMedia, recentPosts, recentProjects] =
      await Promise.all([
        prisma.post.groupBy({ by: ["status"], _count: { _all: true } }),
        prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
        prisma.category.count(),
        prisma.media.count(),
        prisma.post.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, title: true, slug: true, status: true, createdAt: true },
        }),
        prisma.project.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, name: true, slug: true, status: true, createdAt: true },
        }),
      ]);

    const postCount = (status: string) =>
      postGroups.find((g) => g.status === status)?._count._all ?? 0;
    const projectCount = (status: string) =>
      projectGroups.find((g) => g.status === status)?._count._all ?? 0;

    return {
      ok: true,
      data: {
        totalPosts: postGroups.reduce((s: number, g) => s + g._count._all, 0),
        publishedPosts: postCount("PUBLISHED"),
        draftPosts: postCount("DRAFT"),
        totalProjects: projectGroups.reduce((s: number, g) => s + g._count._all, 0),
        activeProjects: projectCount("ACTIVE"),
        totalCategories,
        totalMedia,
        recentPosts,
        recentProjects,
      },
    };
  } catch (err) {
    return actionError(err);
  }
}
