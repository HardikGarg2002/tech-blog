"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buildSidebarTree } from "@/lib/sidebar";
import type { ProjectItemWithRelations, ProjectSectionWithItems } from "@/types";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  items: ProjectItemWithRelations[];
  sections: ProjectSectionWithItems[];
  projectSlug: string;
  /** When set, overrides URL-derived active item (e.g. Storybook). Otherwise derived from `usePathname`. */
  activeSlug?: string;
}

function activeSlugFromPathname(pathname: string | null, projectSlug: string): string | undefined {
  if (!pathname) return undefined;
  const base = `/projects/${projectSlug}`;
  if (pathname === base || pathname === `${base}/`) return undefined;
  if (!pathname.startsWith(`${base}/`)) return undefined;
  const rest = pathname.slice(base.length + 1);
  const segment = rest.split("/")[0];
  return segment || undefined;
}

export function ProjectSidebar({ items, sections, projectSlug, activeSlug: activeSlugProp }: ProjectSidebarProps) {
  const pathname = usePathname();
  const activeSlug = activeSlugProp ?? activeSlugFromPathname(pathname, projectSlug);

  const tree = buildSidebarTree(items, sections);

  return (
    <nav className="flex flex-col gap-1 py-4">
      <Link
        href={`/projects/${projectSlug}`}
        className={cn(
          "flex items-center px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted",
          !activeSlug && "bg-muted font-medium border-l-2 border-primary pl-[10px]",
        )}
      >
        Overview
      </Link>

      {tree.map((entry) => {
        if (entry.kind === "item") {
          const isActive = activeSlug === entry.item.slug;
          return (
            <Link
              key={entry.item.id}
              href={`/projects/${projectSlug}/${entry.item.slug}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted",
                isActive && "bg-muted font-medium border-l-2 border-primary pl-[10px]",
              )}
            >
              <span className="flex-1 truncate">{entry.item.title ?? entry.item.post?.title}</span>
              {entry.item.type === "POST" && (
                <Badge variant="secondary" className="text-[10px] h-4 px-1 shrink-0">
                  Post
                </Badge>
              )}
            </Link>
          );
        }

        return (
          <div key={entry.section.id} className="mt-3">
            <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {entry.section.title}
            </p>
            {entry.items.map((item) => {
              const isActive = activeSlug === item.slug;
              return (
                <Link
                  key={item.id}
                  href={`/projects/${projectSlug}/${item.slug}`}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 pl-5 pr-3 py-2 text-sm rounded-md transition-colors hover:bg-muted",
                    isActive && "bg-muted font-medium border-l-2 border-primary pl-[18px]",
                  )}
                >
                  <span className="flex-1 truncate">{item.title ?? item.post?.title}</span>
                  {item.type === "POST" && (
                    <Badge variant="secondary" className="text-[10px] h-4 px-1 shrink-0">
                      Post
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
