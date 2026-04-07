import { z } from "zod";
import { Errors } from "@/lib/errors";
import * as sectionRepo from "@/repositories/projectSection.repository";
import { revalidatePath } from "next/cache";

export const createSectionSchema = z.object({
  title: z.string().min(1).max(100),
  projectId: z.string(),
  order: z.number().int().optional(),
});

export async function createSection(input: z.infer<typeof createSectionSchema>) {
  const parsed = createSectionSchema.safeParse(input);
  if (!parsed.success) throw Errors.INVALID_INPUT(parsed.error.message);

  const order =
    parsed.data.order ?? (await sectionRepo.getMaxSectionOrder(parsed.data.projectId)) + 1;

  return sectionRepo.createSection({ ...parsed.data, order });
}

export async function updateSection(
  id: string,
  data: Partial<{ title: string; order: number }>,
  projectSlug: string
) {
  const section = await sectionRepo.findSectionById(id);
  if (!section) throw Errors.NOT_FOUND("ProjectSection", id);

  await sectionRepo.updateSection(id, data);
  revalidatePath(`/projects/${projectSlug}`);
}

export async function deleteSection(id: string, projectSlug: string) {
  const section = await sectionRepo.findSectionById(id);
  if (!section) throw Errors.NOT_FOUND("ProjectSection", id);

  await sectionRepo.deleteSection(id);
  revalidatePath(`/projects/${projectSlug}`);
}

export async function getSectionsForProject(projectId: string) {
  return sectionRepo.findSectionsByProject(projectId);
}
