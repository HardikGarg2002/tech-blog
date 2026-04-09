import { z } from "zod";
import { uniqueSlug } from "@/lib/slugify";
import { Errors } from "@/lib/errors";
import * as categoryRepo from "@/repositories/category.repository";

export async function getAllCategorySlugs() {
  return categoryRepo.findAllCategories(); // Can filter for slugs in caller
}

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().optional(),
  parentId: z.string().optional(),
});

export async function createCategory(input: z.infer<typeof createCategorySchema>) {
  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) throw Errors.INVALID_INPUT(parsed.error.message);

  const slug = await uniqueSlug(
    parsed.data.slug ?? parsed.data.name,
    (s) => categoryRepo.categorySlugExists(s)
  );

  return categoryRepo.createCategory({ ...parsed.data, slug });
}

export async function updateCategory(id: string, input: Partial<z.infer<typeof createCategorySchema>>) {
  const cat = await categoryRepo.findCategoryById(id);
  if (!cat) throw Errors.NOT_FOUND("Category", id);

  return categoryRepo.updateCategory(id, input);
}

export async function deleteCategory(id: string) {
  const cat = await categoryRepo.findCategoryById(id);
  if (!cat) throw Errors.NOT_FOUND("Category", id);

  await categoryRepo.deleteCategory(id);
  return { orphanedPosts: cat._count.posts };
}

export async function getAllCategories() {
  return categoryRepo.findAllCategories();
}

export async function getCategoryWithPosts(slug: string) {
  const cat = await categoryRepo.findCategoryBySlug(slug);
  if (!cat) throw Errors.NOT_FOUND("Category", slug);
  return cat;
}

export async function getDocItemsForCategory(categoryId: string) {
  return categoryRepo.findPublishedDocItemsByCategory(categoryId);
}

export async function getAllCategoriesWithCounts() {
  return categoryRepo.findAllCategoriesWithCounts();
}

