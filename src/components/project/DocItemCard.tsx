import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { ProjectItemWithRelations, ProjectWithRelations } from "@/types";

interface DocItemCardProps {
  item: ProjectItemWithRelations & {
    project: Pick<ProjectWithRelations, "id" | "name" | "slug">;
  };
}

export function DocItemCard({ item }: DocItemCardProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:border-primary transition-colors">
      <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <Link
          href={`/projects/${item.project.slug}/${item.slug}`}
          className="font-medium hover:text-primary transition-colors line-clamp-1"
        >
          {item.title}
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <Link
            href={`/projects/${item.project.slug}`}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {item.project.name}
          </Link>
          {item.section && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{item.section.title}</span>
            </>
          )}
        </div>
      </div>
      <Badge
        variant={item.status === "PUBLISHED" ? "default" : "secondary"}
        className="text-[10px] shrink-0"
      >
        {item.status}
      </Badge>
    </div>
  );
}
