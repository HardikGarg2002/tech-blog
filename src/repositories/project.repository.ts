import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function findAllProjects() {
  return prisma.project.findMany({
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

export async function createProject(data: Prisma.ProjectUncheckedCreateInput) {
  return prisma.project.create({ data });
}

export async function updateProject(id: string, data: Prisma.ProjectUncheckedUpdateInput) {
  return prisma.project.update({ where: { id }, data });
}

export async function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
}

export async function findAllProjectSlugs() {
  return prisma.project.findMany({ select: { slug: true, updatedAt: true } });
}
