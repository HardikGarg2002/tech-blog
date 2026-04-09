"use server";

import { auth } from "@/lib/auth";
import * as categoryService from "@/services/category.service";
import { actionError, type ActionResult } from "./action-result";

async function requireAdmin(): Promise<ActionResult<never> | { ok: true }> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Unauthorized", code: "UNAUTHORIZED" };
  }
  return { ok: true };
}

type CategoryWithCounts = Awaited<ReturnType<typeof categoryService.getAllCategoriesWithCounts>>[number];

export async function listAdminCategories(): Promise<ActionResult<CategoryWithCounts[]>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    const categories = await categoryService.getAllCategoriesWithCounts();
    return { ok: true, data: categories };
  } catch (err) {
    return actionError(err);
  }
}

export async function createAdminCategory(
  input: Parameters<typeof categoryService.createCategory>[0],
): Promise<ActionResult<{ id: string; name: string; slug: string }>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    const cat = await categoryService.createCategory(input);
    return { ok: true, data: { id: cat.id, name: cat.name, slug: cat.slug } };
  } catch (err) {
    return actionError(err);
  }
}

export async function updateAdminCategory(
  id: string,
  input: Parameters<typeof categoryService.updateCategory>[1],
): Promise<ActionResult<void>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    await categoryService.updateCategory(id, input);
    return { ok: true, data: undefined };
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteAdminCategory(id: string): Promise<ActionResult<void>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    await categoryService.deleteCategory(id);
    return { ok: true, data: undefined };
  } catch (err) {
    return actionError(err);
  }
}
