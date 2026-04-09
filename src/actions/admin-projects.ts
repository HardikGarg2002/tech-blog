"use server";

import { auth } from "@/lib/auth";
import * as projectService from "@/services/project.service";
import * as projectItemService from "@/services/projectItem.service";
import * as projectSectionService from "@/services/projectSection.service";
import * as postService from "@/services/post.service";
import type { ProjectItem } from "@prisma/client";
import type {
  AdminProjectItemApiRow,
  AdminProjectSummaryFromApi,
  AdminSectionOption,
  AdminUnlinkedPostOption,
} from "@/types/admin";
import { actionError, type ActionResult } from "./action-result";

async function requireAdmin(): Promise<ActionResult<never> | { ok: true }> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Unauthorized", code: "UNAUTHORIZED" };
  }
  return { ok: true };
}

export type AdminProjectDashboardPayload = {
  project: AdminProjectSummaryFromApi;
  items: AdminProjectItemApiRow[];
};

export async function loadAdminProjectDashboard(
  projectId: string,
): Promise<ActionResult<AdminProjectDashboardPayload>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    const project = await projectService.getProjectById(projectId);
    const items = await projectItemService.getProjectSidebar(projectId);
    return {
      ok: true,
      data: {
        project: project as AdminProjectSummaryFromApi,
        items: items as AdminProjectItemApiRow[],
      },
    };
  } catch (err) {
    return actionError(err);
  }
}

export async function refreshProjectSidebarItems(
  projectId: string,
): Promise<ActionResult<AdminProjectItemApiRow[]>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    const items = await projectItemService.getProjectSidebar(projectId);
    return { ok: true, data: items as AdminProjectItemApiRow[] };
  } catch (err) {
    return actionError(err);
  }
}

export async function publishProjectItem(
  projectId: string,
  itemId: string,
): Promise<ActionResult<void>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    const project = await projectService.getProjectById(projectId);
    await projectItemService.publishDocItem(itemId, project.slug);
    return { ok: true, data: undefined };
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteProjectItem(
  projectId: string,
  itemId: string,
): Promise<ActionResult<void>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    const project = await projectService.getProjectById(projectId);
    await projectItemService.deleteItem(itemId, project.slug);
    return { ok: true, data: undefined };
  } catch (err) {
    return actionError(err);
  }
}

export async function createProjectDocItem(
  projectId: string,
  input: { title: string; body: string; sectionId?: string },
): Promise<ActionResult<ProjectItem>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    const item = await projectItemService.createDocItem({
      projectId,
      title: input.title,
      body: input.body,
      sectionId: input.sectionId,
    });
    return { ok: true, data: item };
  } catch (err) {
    return actionError(err);
  }
}

export async function createProjectSection(
  projectId: string,
  title: string,
): Promise<ActionResult<{ id: string; title: string; order: number }>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    const section = await projectSectionService.createSection({ projectId, title });
    return {
      ok: true,
      data: { id: section.id, title: section.title, order: section.order },
    };
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteProjectSection(
  projectId: string,
  sectionId: string,
): Promise<ActionResult<void>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    const project = await projectService.getProjectById(projectId);
    await projectSectionService.deleteSection(sectionId, project.slug);
    return { ok: true, data: undefined };
  } catch (err) {
    return actionError(err);
  }
}

export async function listPromotablePosts(): Promise<ActionResult<AdminUnlinkedPostOption[]>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    const posts = await postService.getUnlinkedPosts();
    return {
      ok: true,
      data: posts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        type: p.type,
      })),
    };
  } catch (err) {
    return actionError(err);
  }
}

export async function promotePostToProject(
  projectId: string,
  input: { postId: string; sectionId?: string; order?: number },
): Promise<ActionResult<ProjectItem>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    const item = await projectItemService.createPostItem({
      projectId,
      postId: input.postId,
      sectionId: input.sectionId,
      order: input.order,
    });
    return { ok: true, data: item };
  } catch (err) {
    return actionError(err);
  }
}

export type DocItemEditorPayload = {
  projectSlug: string;
  item: {
    title: string;
    slug: string;
    body: string;
    sectionId: string;
    order: string;
    status: string;
  };
  sections: AdminSectionOption[];
};

export async function loadDocItemEditor(
  projectId: string,
  itemId: string,
): Promise<ActionResult<DocItemEditorPayload>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    const project = await projectService.getProjectById(projectId);
    const raw = await projectItemService.getItemById(itemId);
    if (raw.projectId !== projectId) {
      return { ok: false, error: "Item not in this project", code: "NOT_FOUND" };
    }
    const sectionRows = await projectSectionService.getSectionsForProject(projectId);
    const sections: AdminSectionOption[] = sectionRows.map((s) => ({
      id: s.id,
      title: s.title,
      order: s.order,
    }));

    return {
      ok: true,
      data: {
        projectSlug: project.slug,
        item: {
          title: raw.title ?? "",
          slug: raw.slug,
          body: raw.body ?? "",
          sectionId: raw.sectionId ?? "",
          order: String(raw.order ?? ""),
          status: raw.status,
        },
        sections,
      },
    };
  } catch (err) {
    return actionError(err);
  }
}

export async function updateDocItemFields(
  projectId: string,
  itemId: string,
  input: {
    title: string;
    slug: string;
    body: string;
    sectionId: string | null;
    order?: number;
  },
): Promise<ActionResult<void>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    const project = await projectService.getProjectById(projectId);
    await projectItemService.updateDocItem(itemId, project.slug, {
      title: input.title,
      slug: input.slug,
      body: input.body,
      sectionId: input.sectionId,
      order: input.order,
    });
    return { ok: true, data: undefined };
  } catch (err) {
    return actionError(err);
  }
}

export async function publishDocItemFromEditor(
  projectId: string,
  itemId: string,
): Promise<ActionResult<void>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    const project = await projectService.getProjectById(projectId);
    await projectItemService.publishDocItem(itemId, project.slug);
    return { ok: true, data: undefined };
  } catch (err) {
    return actionError(err);
  }
}

export async function createAdminProject(
  input: Parameters<typeof projectService.createProject>[0],
): Promise<ActionResult<{ id: string; slug: string }>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    const project = await projectService.createProject(input);
    return { ok: true, data: { id: project.id, slug: project.slug } };
  } catch (err) {
    return actionError(err);
  }
}

export async function updateAdminProject(
  id: string,
  input: Parameters<typeof projectService.updateProject>[1],
): Promise<ActionResult<void>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    await projectService.updateProject(id, input);
    return { ok: true, data: undefined };
  } catch (err) {
    return actionError(err);
  }
}

