import { redirect } from "next/navigation";
import { loadDocItemEditor } from "@/actions/admin-projects";
import { DocItemEditorClient } from "@/components/admin/DocItemEditorClient";

export default async function DocItemEditorPage(props: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const { id, itemId } = await props.params;
  const res = await loadDocItemEditor(id, itemId);
  if (!res.ok) {
    if (res.code === "UNAUTHORIZED") redirect("/admin/login");
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">{res.error}</div>
    );
  }

  return <DocItemEditorClient projectId={id} itemId={itemId} initial={res.data} />;
}
