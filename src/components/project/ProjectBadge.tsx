import Link from "next/link";
import { FolderOpen } from "lucide-react";

interface ProjectBadgeProps {
  projectName: string;
  projectSlug: string;
}

export function ProjectBadge({ projectName, projectSlug }: ProjectBadgeProps) {
  return (
    <Link
      href={`/projects/${projectSlug}`}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
    >
      <FolderOpen className="h-3 w-3" />
      {projectName}
    </Link>
  );
}
