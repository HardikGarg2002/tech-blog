import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FolderTree, Layers3, Sparkles } from "lucide-react";
import { getAllCategoriesWithCounts } from "@/services/category.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CategoryWithChildren } from "@/types";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse the full category map for posts, project documentation, and engineering notes.",
  alternates: {
    canonical: "/categories",
  },
};

export const revalidate = 300;

type CategoryListItem = CategoryWithChildren & {
  parent: { id: string; name: string } | null;
  _count: {
    posts: number;
    projects: number;
  };
};

function getCategoryTone(color?: string | null) {
  if (!color) return undefined;

  return {
    borderColor: `${color}40`,
    background: `linear-gradient(135deg, ${color}14, transparent 65%)`,
  };
}

export default async function CategoriesPage() {
  const categories = (await getAllCategoriesWithCounts()) as CategoryListItem[];

  const rootCategories = categories
    .filter((category) => !category.parent)
    .map((category) => ({
      ...category,
      children: categories.filter((candidate) => candidate.parent?.id === category.id),
    }));

  const nestedCategoryCount = categories.length - rootCategories.length;
  const branchesWithChildren = rootCategories.filter((category) => category.children.length > 0)
    .length;

  return (
    <div className="container py-10 sm:py-12">
      <div className="flex flex-col gap-8 sm:gap-10">
        <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-br from-primary/[0.08] via-background to-background">
          <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)] lg:items-end">
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Category Map
                </p>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                  Browse the taxonomy behind the blog, docs, and project notes.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Start with a broader theme, then drill into focused subcategories to find
                  the exact slice of engineering work you want to read.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
                  <p className="text-sm text-muted-foreground">Total categories</p>
                  <p className="mt-2 text-3xl font-semibold">{categories.length}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
                  <p className="text-sm text-muted-foreground">Top-level themes</p>
                  <p className="mt-2 text-3xl font-semibold">{rootCategories.length}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
                  <p className="text-sm text-muted-foreground">Nested tracks</p>
                  <p className="mt-2 text-3xl font-semibold">{nestedCategoryCount}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-border/70 bg-background/85 p-5 backdrop-blur">
              <p className="text-sm font-medium">How the map is organized</p>
              <div className="mt-4 space-y-4">
                <div className="grid gap-1 border-b border-border/60 pb-4">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Layers3 className="h-4 w-4 text-primary" />
                    Parent categories
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Broad themes that group related posts, projects, and documentation.
                  </p>
                </div>
                <div className="grid gap-1 border-b border-border/60 pb-4">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <FolderTree className="h-4 w-4 text-primary" />
                    Nested branches
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Subcategories that narrow the topic when a theme needs more structure.
                  </p>
                </div>
                <div className="grid gap-1">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Detail pages
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Every category links to its own page with posts, projects, and docs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">All categories</h2>
              <p className="text-sm text-muted-foreground">
                {branchesWithChildren} {branchesWithChildren === 1 ? "theme has" : "themes have"}{" "}
                nested branches. Open any category to see the full content inside it.
              </p>
            </div>
            <Button asChild variant="outline" className="w-fit">
              <Link href="/blog">
                Explore latest posts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {rootCategories.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {rootCategories.map((category) => (
                <article
                  key={category.id}
                  className="rounded-[1.75rem] border border-border/70 bg-card/80 p-6 shadow-sm"
                  style={getCategoryTone(category.color)}
                >
                  <div className="flex h-full flex-col gap-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{category.icon || "*"}</span>
                          <div>
                            <h3 className="text-2xl font-semibold tracking-tight">
                              {category.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">/{category.slug}</p>
                          </div>
                        </div>

                        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                          {category.description ||
                            `Browse notes, implementations, and related work under ${category.name}.`}
                        </p>
                      </div>

                      <Button asChild variant="ghost" size="sm" className="shrink-0">
                        <Link href={`/category/${category.slug}`}>Open</Link>
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="rounded-full px-3 py-1">
                        {category._count.posts} post{category._count.posts === 1 ? "" : "s"}
                      </Badge>
                      <Badge variant="secondary" className="rounded-full px-3 py-1">
                        {category._count.projects} project
                        {category._count.projects === 1 ? "" : "s"}
                      </Badge>
                      <Badge variant="outline" className="rounded-full px-3 py-1">
                        {category.children.length} subcategor
                        {category.children.length === 1 ? "y" : "ies"}
                      </Badge>
                    </div>

                    {category.children.length > 0 ? (
                      <div className="space-y-3 rounded-2xl border border-border/60 bg-background/80 p-4">
                        <p className="text-sm font-medium">Subcategories</p>
                        <div className="flex flex-wrap gap-2">
                          {category.children.map((child) => (
                            <Link
                              key={child.id}
                              href={`/category/${child.slug}`}
                              className="rounded-full border border-border/70 bg-background px-3 py-1.5 text-sm transition-colors hover:border-primary/40 hover:bg-primary/[0.06]"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 px-4 py-5 text-sm text-muted-foreground">
                        No subcategories yet. This category works as a focused topic page on its
                        own.
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
              <p className="text-lg font-medium">No categories are available yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Add categories from the admin dashboard to organize posts and projects.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
