import { prisma } from "@/lib/prisma";

export async function createMediaRecord(data: {
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  linkedTo?: string;
}) {
  return prisma.media.create({ data });
}

export async function findAllMedia() {
  return prisma.media.findMany({ orderBy: { createdAt: "desc" } });
}

export async function findMediaById(id: string) {
  return prisma.media.findUnique({ where: { id } });
}

export async function deleteMedia(id: string) {
  return prisma.media.delete({ where: { id } });
}

export async function deleteOrphanedMedia(olderThanDays = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);
  return prisma.media.deleteMany({
    where: { linkedTo: null, createdAt: { lt: cutoff } },
  });
}

