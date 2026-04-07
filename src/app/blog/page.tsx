import { PostType } from "@prisma/client";
import { listPosts } from "@/services/post.service";
import { PostCard } from "@/components/blog/PostCard";
import { ProjectBadge } from "@/components/project/ProjectBadge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PostWithRelations } from "@/types";

export const revalidate = 60;

const POST_TYPES = ["CONCEPT", "TOOL", "PROJECT_WRITEUP"] as const;

function parsePostType(value: string | undefined): PostType | undefined {
  if (!value) return undefined;
  return (Object.values(PostType) as string[]).includes(value)
    ? (value as PostType)
    : undefined;
}

export default async function BlogPage(props: {
  searchParams: Promise<{ type?: string; linked?: string }>;
}) {
  const searchParams = await props.searchParams;
  const typeFilter = parsePostType(searchParams.type);
  const linkedFilter = searchParams.linked;

  const result = await listPosts({
    perPage: 100,
    type: typeFilter,
  });
  const allPosts = result.data as PostWithRelations[];

  const posts = allPosts.filter((post) => {
    if (linkedFilter === "standalone") return !post.linkedProjectId;
    if (linkedFilter === "project") return !!post.linkedProjectId;
    return true;
  });

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight">Writing Archive</h1>
          <p className="text-muted-foreground text-lg max-w-[800px]">
            Technical notes, deep dives, and documented learnings.
          </p>
        </div>

        <div className="flex flex-wrap gap-6">
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "All", linked: undefined, type: undefined },
              { label: "Standalone only", linked: "standalone", type: undefined },
              { label: "Project posts only", linked: "project", type: undefined },
            ].map((f) => (
              <Link
                key={f.label}
                href={{
                  pathname: "/blog",
                  query: {
                    ...(f.linked ? { linked: f.linked } : {}),
                    ...(typeFilter ? { type: typeFilter } : {}),
                  },
                }}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-sm transition-colors",
                  linkedFilter === f.linked
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted"
                )}
              >
                {f.label}
              </Link>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            {(["All types", ...POST_TYPES] as const).map((t) => {
              const val = t === "All types" ? undefined : t;
              return (
                <Link
                  key={t}
                  href={{
                    pathname: "/blog",
                    query: {
                      ...(linkedFilter ? { linked: linkedFilter } : {}),
                      ...(val ? { type: val } : {}),
                    },
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-sm transition-colors",
                    typeFilter === val
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-muted"
                  )}
                >
                  {t === "PROJECT_WRITEUP"
                    ? "Project Writeup"
                    : t === "All types"
                      ? t
                      : t.charAt(0) + t.slice(1).toLowerCase()}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="flex flex-col gap-2">
                {post.linkedProject && (
                  <ProjectBadge
                    projectName={post.linkedProject.name}
                    projectSlug={post.linkedProject.slug}
                  />
                )}
                <PostCard post={post} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
              <p className="text-muted-foreground">No posts match the current filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
