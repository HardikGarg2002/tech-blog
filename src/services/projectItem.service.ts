import { z } from "zod";
import { ItemStatus } from "@prisma/client";
import { uniqueSlug } from "@/lib/slugify";
import { Errors } from "@/lib/errors";
import * as itemRepo from "@/repositories/projectItem.repository";
import * as postRepo from "@/repositories/post.repository";
import * as projectRepo from "@/repositories/project.repository";
import { revalidatePath } from "next/cache";

export const createDocItemSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1).max(200),
  slug: z.string().optional(),
  body: z.string().min(1),
  order: z.number().int().optional(),
  sectionId: z.string().optional(),
});

export const createPostItemSchema = z.object({
  projectId: z.string(),
  postId: z.string(),
  slug: z.string().optional(),
  order: z.number().int().optional(),
  sectionId: z.string().optional(),
});

export async function createDocItem(input: z.infer<typeof createDocItemSchema>) {
  const parsed = createDocItemSchema.safeParse(input);
  if (!parsed.success) throw Errors.INVALID_INPUT(parsed.error.message);

  const { projectId, title, body, sectionId, slug: customSlug } = parsed.data;

  const slug = await uniqueSlug(
    customSlug ?? title,
    (s) => itemRepo.itemSlugExists(projectId, s)
  );

  const order = parsed.data.order ?? (await itemRepo.getMaxOrder(projectId)) + 1;

  const item = await itemRepo.createDocItem({ projectId, slug, title, body, order, sectionId });

  const project = await projectRepo.findProjectById(projectId);
  if (project) revalidatePath(`/projects/${project.slug}`);
  return item;
}

export async function createPostItem(input: z.infer<typeof createPostItemSchema>) {
  const parsed = createPostItemSchema.safeParse(input);
  if (!parsed.success) throw Errors.INVALID_INPUT(parsed.error.message);

  const { projectId, postId, sectionId, slug: customSlug } = parsed.data;

  const post = await postRepo.findPostById(postId);
  if (!post) throw Errors.NOT_FOUND("Post", postId);

  const slug = await uniqueSlug(
    customSlug ?? post.slug,
    (s) => itemRepo.itemSlugExists(projectId, s)
  );

  const order = parsed.data.order ?? (await itemRepo.getMaxOrder(projectId)) + 1;

  await postRepo.updatePost(postId, { linkedProjectId: projectId, type: "PROJECT_WRITEUP" });

  const item = await itemRepo.createPostItem({ projectId, postId, slug, order, sectionId });

  const project = await projectRepo.findProjectById(projectId);
  if (project) revalidatePath(`/projects/${project.slug}`);
  revalidatePath(`/blog/${post.slug}`);
  return item;
}

export async function publishDocItem(id: string, projectSlug: string) {
  await itemRepo.updateDocItem(id, { status: ItemStatus.PUBLISHED });
  revalidatePath(`/projects/${projectSlug}`);
}

export async function unpublishDocItem(id: string, projectSlug: string) {
  await itemRepo.updateDocItem(id, { status: ItemStatus.DRAFT });
  revalidatePath(`/projects/${projectSlug}`);
}

export async function updateDocItem(
  id: string,
  projectSlug: string,
  data: Partial<{ title: string; body: string; order: number; sectionId: string | null; slug: string; status: ItemStatus }>
) {
  const updated = await itemRepo.updateDocItem(id, data);
  revalidatePath(`/projects/${projectSlug}`);
  return updated;
}

export async function deleteItem(id: string, projectSlug: string) {
  await itemRepo.deleteItem(id);
  revalidatePath(`/projects/${projectSlug}`);
}

export async function getProjectSidebar(projectId: string) {
  return itemRepo.findItemsByProject(projectId);
}

export async function getProjectItemBySlug(projectId: string, slug: string) {
  const item = await itemRepo.findPublishedItemBySlug(projectId, slug);
  if (!item) throw Errors.NOT_FOUND("ProjectItem", slug);
  return item;
}

export async function getItemById(id: string) {
  const item = await itemRepo.findItemById(id);
  if (!item) throw Errors.NOT_FOUND("ProjectItem", id);
  return item;
}

export async function getAllDocItems() {
  return itemRepo.findAllDocItems();
}
