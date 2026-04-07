import { z } from "zod";
import { uniqueSlug } from "@/lib/slugify";
import { Errors } from "@/lib/errors";
import * as projectRepo from "@/repositories/project.repository";

export async function getAllProjectSlugs() {
  return projectRepo.findAllProjectSlugs();
}

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).default("ACTIVE"),
  repoUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  techStack: z.array(z.string()).default([]),
  body: z.string().min(1),
  categories: z.array(z.string()).min(1),
});

export async function createProject(input: z.infer<typeof createProjectSchema>) {
  const parsed = createProjectSchema.safeParse(input);
  if (!parsed.success) throw Errors.INVALID_INPUT(parsed.error.message);

  const { name, categories, ...rest } = parsed.data;
  const slug = await uniqueSlug(name, async (s) => !!(await projectRepo.findProjectBySlug(s)));

  return projectRepo.createProject({
    ...rest,
    name,
    slug,
    categories: {
      create: categories.map((categoryId) => ({ categoryId })),
    },
  });
}

export async function getAllProjects() {
  return projectRepo.findAllProjects();
}

export async function getProject(slug: string) {
  const project = await projectRepo.findProjectBySlug(slug);
  if (!project) throw Errors.NOT_FOUND("Project", slug);
  return project;
}

export async function getProjectById(id: string) {
  const project = await projectRepo.findProjectById(id);
  if (!project) throw Errors.NOT_FOUND("Project", id);
  return project;
}

export async function updateProject(id: string, input: Partial<z.infer<typeof createProjectSchema>>) {
  const project = await projectRepo.findProjectById(id);
  if (!project) throw Errors.NOT_FOUND("Project", id);

  const { categories, ...rest } = input;

  await projectRepo.updateProject(id, {
    ...rest,
    ...(categories && {
      categories: {
        deleteMany: {},
        create: categories.map((categoryId) => ({ categoryId })),
      },
    }),
  });

  return projectRepo.findProjectById(id);
}

export async function deleteProject(id: string) {
  const project = await projectRepo.findProjectById(id);
  if (!project) throw Errors.NOT_FOUND("Project", id);
  await projectRepo.deleteProject(id);
}
