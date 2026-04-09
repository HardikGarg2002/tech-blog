import { getAllCategories } from "@/services/category.service";
import { ProjectFormClient } from "@/components/admin/ProjectFormClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewProjectPage() {
  const categories = await getAllCategories();

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <Link
          href="/admin/projects"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Projects
        </Link>
        <h1 className="text-2xl font-bold">New Project</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Create a new project with its own documentation space
        </p>
      </div>

      <ProjectFormClient
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
