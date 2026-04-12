import { listPosts } from "@/services/post.service";
import { PostCard } from "@/components/blog/PostCard";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PostCardModel } from "@/types";
import { POST_TYPES, parsePostType } from "@/types/domain";

export const revalidate = 60;

const TYPE_COPY: Record<(typeof POST_TYPES)[number], string> = {
  CONCEPT: "Ideas, architecture, and mental models.",
  TOOL: "Practical workflows, utilities, and implementation guides.",
  PROJECT_WRITEUP: "Narratives and lessons from shipped work.",
};

function formatPostTypeLabel(type: (typeof POST_TYPES)[number]) {
  if (type === "PROJECT_WRITEUP") return "Project writeup";
  return type.charAt(0) + type.slice(1).toLowerCase();
}

export default async function BlogPage(props: PageProps<"/blog">) {
  const searchParams = await props.searchParams;
  const typeParam = searchParams.type;
  const typeFilter = parsePostType(
    Array.isArray(typeParam) ? typeParam[0] : typeParam
  );
  const result = await listPosts({
    perPage: 100,
    type: typeFilter,
    forCard: true,
  });
  const allPosts = result.data as PostCardModel[];

  const standaloneCount = allPosts.filter((post) => !post.linkedProjectId).length;
  const projectCount = allPosts.length - standaloneCount;

  const activeTypeLabel = typeFilter ? formatPostTypeLabel(typeFilter) : "All formats";

  return (
    <div className="container py-10 sm:py-12">
      <div className="flex flex-col gap-8 sm:gap-10">
        <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-br from-primary/[0.08] via-background to-background">
          <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)] lg:items-end">
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Blog Archive
                </p>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                  Engineering notes that are easy to scan by topic and by project.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Browse standalone ideas, tool guides, and project-linked writing
                  without guessing what each filter means or where a post belongs.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
                  <p className="text-sm text-muted-foreground">Published posts</p>
                  <p className="mt-2 text-3xl font-semibold">{allPosts.length}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
                  <p className="text-sm text-muted-foreground">Standalone notes</p>
                  <p className="mt-2 text-3xl font-semibold">{standaloneCount}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
                  <p className="text-sm text-muted-foreground">Project-linked posts</p>
                  <p className="mt-2 text-3xl font-semibold">{projectCount}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-border/70 bg-background/85 p-5 backdrop-blur">
              <p className="text-sm font-medium">How to read the archive</p>
              <div className="mt-4 space-y-4">
                {POST_TYPES.map((type) => (
                  <div
                    key={type}
                    className="grid gap-1 border-b border-border/60 pb-4 last:border-b-0 last:pb-0"
                  >
                    <p className="text-sm font-medium">{formatPostTypeLabel(type)}</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {TYPE_COPY[type]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-border/70 bg-muted/20 p-5 sm:p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">Browse the archive</h2>
                <p className="text-sm text-muted-foreground">
                  Narrow by format when you want a specific kind of writing.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{allPosts.length}</span>{" "}
                result{allPosts.length === 1 ? "" : "s"} for{" "}
                <span className="font-medium text-foreground">{activeTypeLabel}</span>
              </p>
            </div>

            <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Format</p>
                  <p className="text-sm text-muted-foreground">
                    Filter by the kind of writing you want to read next.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["All formats", ...POST_TYPES] as const).map((type) => {
                    const value = type === "All formats" ? undefined : type;
                    const label = value ? formatPostTypeLabel(value) : type;

                    return (
                      <Link
                        key={type}
                        href={{
                          pathname: "/blog",
                          query: value ? { type: value } : {},
                        }}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm transition-colors",
                          typeFilter === value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background hover:border-primary/40 hover:bg-primary/[0.06]"
                        )}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {typeFilter ? TYPE_COPY[typeFilter] : "Show every post format together."}
                </p>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Latest posts</h2>
            <p className="text-sm text-muted-foreground">
              Every entry follows the same layout, with project context shown inline when relevant.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {allPosts.length > 0 ? (
            allPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="col-span-full rounded-[1.75rem] border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
              <p className="text-lg font-medium">No posts match this combination yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try switching the format filter to widen the archive.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
