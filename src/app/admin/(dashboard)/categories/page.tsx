import { getAllCategoriesWithCounts } from "@/services/category.service";
import { CategoriesClient } from "@/components/admin/CategoriesClient";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesWithCounts();

  const allForParent = categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {categories.length} {categories.length === 1 ? "category" : "categories"}
        </p>
      </div>

      <CategoriesClient
        initialCategories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          color: c.color,
          parent: c.parent,
          _count: c._count,
        }))}
        allForParent={allForParent}
      />
    </div>
  );
}
