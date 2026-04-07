import { prisma } from "@/lib/prisma";

export async function findSectionsByProject(projectId: string) {
  return prisma.projectSection.findMany({
    where: { projectId },
    include: { items: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });
}

export async function findSectionById(id: string) {
  return prisma.projectSection.findUnique({
    where: { id },
    include: { items: true },
  });
}

export async function createSection(data: {
  title: string;
  order: number;
  projectId: string;
}) {
  return prisma.projectSection.create({ data });
}

export async function updateSection(
  id: string,
  data: Partial<{ title: string; order: number }>
) {
  return prisma.projectSection.update({ where: { id }, data });
}

export async function deleteSection(id: string) {
  await prisma.projectItem.updateMany({
    where: { sectionId: id },
    data: { sectionId: null },
  });
  return prisma.projectSection.delete({ where: { id } });
}

export async function getMaxSectionOrder(projectId: string) {
  const result = await prisma.projectSection.aggregate({
    where: { projectId },
    _max: { order: true },
  });
  return result._max.order ?? 0;
}
