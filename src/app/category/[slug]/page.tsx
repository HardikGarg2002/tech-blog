import {
  getCategoryWithPosts,
  getDocItemsForCategory,
} from "@/services/category.service";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/blog/PostCard";
import { ProjectCard } from "@/components/project/ProjectCard";
import { DocItemCard } from "@/components/project/DocItemCard";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppError } from "@/lib/errors";
import type { ProjectItemType } from "@/types/domain";
import { PostWithRelations } from "@/types";
import { ProjectWithRelations } from "@/types";
import { ProjectItemWithRelations } from "@/types";

export const revalidate = 300;

type CategoryPayload = Awaited<ReturnType<typeof getCategoryWithPosts>>;

type ProjectForCategory = ProjectWithRelations & {
  items: { id: string; type: ProjectItemType }[];
  docCount: number;
  postCount: number;
};

export default async function CategoryPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  let category: CategoryPayload;
  try {
    category = await getCategoryWithPosts(slug);
  } catch (err) {
    if (err instanceof AppError && err.code === "NOT_FOUND") {
      notFound();
    }
    throw err;
  }

  const posts = category.posts
    .map((cp) => cp.post)
    .filter((p) => p.status === "PUBLISHED") as PostWithRelations[];

  const projects: ProjectForCategory[] = (category.projects ?? []).map((cp) => {
    const p = cp.project;
    const items = p.items ?? [];
    const docCount = items.filter((i) => i.type === "DOC").length;
    const postCount = items.filter((i) => i.type === "POST").length;
    return { ...p, items, docCount, postCount };
  });

  const docItems = await getDocItemsForCategory(category.id);
  const docItemsForCards = docItems as (ProjectItemWithRelations & {
    project: ProjectWithRelations;
  })[];

  return (
    <div className="container py-10">
      <Link
        href="/blog"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> All posts
      </Link>

      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            {category.icon && <span className="text-4xl">{category.icon}</span>}
            <h1 className="text-4xl font-bold tracking-tight">{category.name}</h1>
          </div>
          {category.description && (
            <p className="text-muted-foreground text-lg max-w-[800px]">
              {category.description}
            </p>
          )}
        </div>

        {category.children.length > 0 && (
          <div className="flex flex-wrap gap-4 py-4">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/category/${child.slug}`}
                className="px-4 py-2 rounded-full border bg-muted/50 hover:bg-muted text-sm transition-colors"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Projects</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        )}

        {docItemsForCards.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Documentation</h2>
            <div className="flex flex-col gap-3">
              {docItemsForCards.map((item) => (
                <DocItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-semibold mb-4">Posts</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.length > 0 ? (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-muted-foreground">No posts found in this category.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
