import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getProject } from "@/services/project.service";
import { getProjectSidebar } from "@/services/projectItem.service";
import { getSectionsForProject } from "@/services/projectSection.service";
import { ProjectSidebar } from "@/components/project/ProjectSidebar";
import { AppError } from "@/lib/errors";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ProjectItemWithRelations, ProjectSectionWithItems } from "@/types";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let project;
  let items: ProjectItemWithRelations[];
  let sections: ProjectSectionWithItems[];

  try {
    project = await getProject(slug);
    items = (await getProjectSidebar(project.id)) as ProjectItemWithRelations[];
    sections = (await getSectionsForProject(project.id)) as ProjectSectionWithItems[];
  } catch (err) {
    if (err instanceof AppError && err.code === "NOT_FOUND") {
      notFound();
    }
    throw err;
  }

  const sidebar = (
    <ProjectSidebar
      items={items}
      sections={sections}
      projectSlug={slug}
    />
  );

  return (
    <div className="container py-6">
      {/* Mobile header */}
      <div className="flex items-center gap-3 mb-4 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 pt-10">
            <div className="px-4 pb-4 font-semibold text-lg border-b">{project.name}</div>
            <div className="px-2 overflow-y-auto">{sidebar}</div>
          </SheetContent>
        </Sheet>
        <span className="font-semibold text-sm text-muted-foreground">{project.name}</span>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0">
          <div className="sticky top-20">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {project.name}
            </p>
            {sidebar}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
