"use server";

import { auth } from "@/lib/auth";
import { getDashboardStats } from "@/services/admin.service";
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
    const stats = await getDashboardStats();
    return {
      ok: true,
      data: stats,
    };
  } catch (err) {
    return actionError(err);
  }
}
