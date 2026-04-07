import { redirect } from "next/navigation";
import { loadAdminProjectDashboard } from "@/actions/admin-projects";
import { ProjectDashboardClient } from "@/components/admin/ProjectDashboardClient";
import type { AdminProjectItemApiRow, AdminSectionOption } from "@/types";

function sectionsFromItems(rows: AdminProjectItemApiRow[]): AdminSectionOption[] {
  const sectionById = new Map<string, AdminSectionOption>();
  for (const item of rows) {
    if (item.sectionId && item.section) {
      sectionById.set(item.sectionId, {
        id: item.sectionId,
        title: item.section.title,
        order: item.section.order ?? 0,
      });
    }
  }
  return Array.from(sectionById.values());
}

export default async function ProjectDashboardPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const result = await loadAdminProjectDashboard(id);
  if (!result.ok) {
    if (result.code === "UNAUTHORIZED") redirect("/admin/login");
    return <div className="py-20 text-center text-muted-foreground">{result.error}</div>;
  }

  const { project, items } = result.data;
  const sections = sectionsFromItems(items);

  return (
    <ProjectDashboardClient
      projectId={id}
      initialProject={project}
      initialItems={items}
      initialSections={sections}
    />
  );
}
