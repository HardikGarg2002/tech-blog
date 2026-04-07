import { getAllProjects } from "@/services/project.service";
import { findItemsByProject } from "@/repositories/projectItem.repository";
import { findSectionsByProject } from "@/repositories/projectSection.repository";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Settings, PlusCircle } from "lucide-react";
import { ProjectItemType } from "@prisma/client";

export default async function AdminProjectsPage() {
  const projects = await getAllProjects();

  const projectsWithStats = await Promise.all(
    projects.map(async (project) => {
      const [items, sections] = await Promise.all([
        findItemsByProject(project.id),
        findSectionsByProject(project.id),
      ]);
      const docCount = items.filter((i) => i.type === ProjectItemType.DOC).length;
      const postCount = items.filter((i) => i.type === ProjectItemType.POST).length;
      return { ...project, docCount, postCount, sectionCount: sections.length };
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button asChild>
          <Link href="/admin/projects/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Project</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Docs</th>
              <th className="text-left px-4 py-3 font-medium">Posts</th>
              <th className="text-left px-4 py-3 font-medium">Sections</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {projectsWithStats.map((project) => (
              <tr key={project.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">/projects/{project.slug}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={project.status === "ACTIVE" ? "default" : "secondary"}>
                    {project.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{project.docCount}</td>
                <td className="px-4 py-3 text-muted-foreground">{project.postCount}</td>
                <td className="px-4 py-3 text-muted-foreground">{project.sectionCount}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/projects/${project.id}`}>
                        <Settings className="h-4 w-4 mr-1" />
                        Dashboard
                      </Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {projectsWithStats.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No projects yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
