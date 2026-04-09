import { prisma } from "@/lib/prisma";
import { Prisma, ProjectStatus } from "@prisma/client";

export async function findAllProjects() {
  return prisma.project.findMany({
    include: { categories: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });
}

/** Projects shown on /projects, search, and public API — archived are hidden but URLs stay valid. */
export async function findListedProjects() {
  return prisma.project.findMany({
    where: { status: { not: ProjectStatus.ARCHIVED } },
    include: { categories: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function findProjectBySlug(slug: string) {
  return prisma.project.findUnique({
    where: { slug },
    include: { categories: { include: { category: true } } },
  });
}

export async function findProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: { categories: { include: { category: true } } },
  });
}

export async function createProject(data: Prisma.ProjectUncheckedCreateInput) {
  return prisma.project.create({ data });
}

export async function updateProject(id: string, data: Prisma.ProjectUncheckedUpdateInput) {
  return prisma.project.update({ where: { id }, data });
}

export async function archiveProject(id: string) {
  return prisma.project.update({
    where: { id },
    data: { status: ProjectStatus.ARCHIVED },
  });
}

export async function findAllProjectSlugs() {
  return prisma.project.findMany({ select: { slug: true, updatedAt: true } });
}

export async function countProjects() {
  return prisma.project.groupBy({ by: ["status"], _count: { _all: true } });
}

export async function findRecentProjects(limit = 5) {
  return prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, name: true, slug: true, status: true, createdAt: true },
  });
}
