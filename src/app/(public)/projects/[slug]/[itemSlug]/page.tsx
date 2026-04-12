import { notFound } from "next/navigation";
import { getProject } from "@/services/project.service";
import {
  getProjectItemBySlug,
  getProjectSidebar,
} from "@/services/projectItem.service";
import { getSectionsForProject } from "@/services/projectSection.service";
import { AppError } from "@/lib/errors";
import { processMDX } from "@/lib/mdx";
import { buildSidebarTree, flattenSidebarItems } from "@/lib/sidebar";
import { ProjectItemNav } from "@/components/project/ProjectItemNav";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectItemWithRelations, ProjectSectionWithItems } from "@/types";

export const revalidate = 60;

export default async function ProjectItemPage(props: {
  params: Promise<{ slug: string; itemSlug: string }>;
}) {
  const { slug, itemSlug } = await props.params;

  let project;
  let item: ProjectItemWithRelations;
  try {
    project = await getProject(slug);
    item = (await getProjectItemBySlug(
      project.id,
      itemSlug,
    )) as ProjectItemWithRelations;
  } catch (err) {
    if (err instanceof AppError && err.code === "NOT_FOUND") notFound();
    throw err;
  }

  const [allItems, sections] = await Promise.all([
    getProjectSidebar(project.id) as Promise<ProjectItemWithRelations[]>,
    getSectionsForProject(project.id) as Promise<ProjectSectionWithItems[]>,
  ]);

  const tree = buildSidebarTree(allItems, sections);
  const flat = flattenSidebarItems(tree);
  const currentIdx = flat.findIndex((i) => i.id === item.id);
  const prev = currentIdx > 0 ? flat[currentIdx - 1] : null;
  const next = currentIdx < flat.length - 1 ? flat[currentIdx + 1] : null;

  if (item.type === "DOC") {
    const { content } = await processMDX(item.body ?? "");

    return (
      <article className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">{item.title}</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {content}
        </div>
        <ProjectItemNav prev={prev} next={next} projectSlug={slug} />
      </article>
    );
  }

  const post = item.post!;
  const { content } = await processMDX(post.body);

  return (
    <article className="max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href={`/projects/${slug}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          {project.name}
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {post.categories.map(({ category }) => (
          <Link key={category.id} href={`/categories/${category.slug}`}>
            <Badge variant="secondary">{category.name}</Badge>
          </Link>
        ))}
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-2">{post.title}</h1>

      {post.excerpt && (
        <p className="text-lg text-muted-foreground mb-8">{post.excerpt}</p>
      )}

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        {content}
      </div>

      <ProjectItemNav prev={prev} next={next} projectSlug={slug} />
    </article>
  );
}
