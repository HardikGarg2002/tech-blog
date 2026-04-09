"use server";

import { auth } from "@/lib/auth";
import * as postService from "@/services/post.service";
import { actionError, type ActionResult } from "./action-result";
import type { PostStatus } from "@prisma/client";

async function requireAdmin(): Promise<ActionResult<never> | { ok: true }> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Unauthorized", code: "UNAUTHORIZED" };
  }
  return { ok: true };
}

export async function listAdminPosts(args: {
  page?: number;
  perPage?: number;
  status?: PostStatus;
} = {}): Promise<ActionResult<Awaited<ReturnType<typeof postService.getAdminAllPosts>>>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    const result = await postService.getAdminAllPosts(args);
    return { ok: true, data: result };
  } catch (err) {
    return actionError(err);
  }
}

export async function getAdminPostById(
  id: string,
): Promise<ActionResult<Awaited<ReturnType<typeof postService.getAdminPost>>>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    const post = await postService.getAdminPost(id);
    return { ok: true, data: post };
  } catch (err) {
    return actionError(err);
  }
}

export async function createAdminPost(
  input: postService.CreatePostInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    const post = await postService.createPost(input);
    return { ok: true, data: { id: post.id, slug: post.slug } };
  } catch (err) {
    return actionError(err);
  }
}

export async function updateAdminPost(
  id: string,
  input: Partial<postService.CreatePostInput>,
): Promise<ActionResult<void>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    await postService.updatePost(id, input);
    return { ok: true, data: undefined };
  } catch (err) {
    return actionError(err);
  }
}

export async function publishAdminPost(id: string): Promise<ActionResult<void>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    await postService.publishPost(id);
    return { ok: true, data: undefined };
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteAdminPost(id: string): Promise<ActionResult<void>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    await postService.deletePost(id);
    return { ok: true, data: undefined };
  } catch (err) {
    return actionError(err);
  }
}
