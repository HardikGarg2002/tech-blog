import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProjectItemWithRelations } from "@/types";

interface ProjectItemNavProps {
  prev: ProjectItemWithRelations | null;
  next: ProjectItemWithRelations | null;
  projectSlug: string;
}

export function ProjectItemNav({ prev, next, projectSlug }: ProjectItemNavProps) {
  if (!prev && !next) return null;

  return (
    <div className="flex items-center justify-between border-t pt-8 mt-12">
      {prev ? (
        <Link
          href={`/projects/${projectSlug}/${prev.slug}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group max-w-[45%]"
        >
          <ChevronLeft className="h-4 w-4 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
          <div className="flex flex-col items-start">
            <span className="text-[10px] uppercase tracking-wider">Previous</span>
            <span className="font-medium text-foreground truncate">
              {prev.title ?? prev.post?.title}
            </span>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/projects/${projectSlug}/${next.slug}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group max-w-[45%] text-right"
        >
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-wider">Next</span>
            <span className="font-medium text-foreground truncate">
              {next.title ?? next.post?.title}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
