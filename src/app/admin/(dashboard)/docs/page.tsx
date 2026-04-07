import { getAllDocItems } from "@/services/projectItem.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit } from "lucide-react";
import { format } from "date-fns";

type DocItemRow = Awaited<ReturnType<typeof getAllDocItems>>[number];

export default async function AdminDocsPage() {
  const docs = await getAllDocItems();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Documentation Pages</h1>
        <p className="text-sm text-muted-foreground">{docs.length} total doc pages</p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium">Project</th>
              <th className="text-left px-4 py-3 font-medium">Section</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Order</th>
              <th className="text-left px-4 py-3 font-medium">Updated</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {docs.map((doc) => (
              <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium truncate max-w-[200px]">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">{doc.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/projects/${doc.project.id}`}
                    className="text-primary hover:underline text-xs"
                  >
                    {doc.project.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {doc.section?.title ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={doc.status === "PUBLISHED" ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {doc.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{doc.order}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {format(new Date(doc.updatedAt), "MMM d, yyyy")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end">
                    <Button asChild size="icon" variant="ghost" className="h-7 w-7">
                      <Link href={`/admin/projects/${doc.project.id}/items/${doc.id}/edit`}>
                        <Edit className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {docs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No doc pages yet. Create one from a project dashboard.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
