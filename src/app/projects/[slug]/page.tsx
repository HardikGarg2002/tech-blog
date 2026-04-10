import { notFound } from "next/navigation";
import { getProject } from "@/services/project.service";
import { getProjectSidebar } from "@/services/projectItem.service";
import { AppError } from "@/lib/errors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, FileText, BookOpen } from "lucide-react";
import Link from "next/link";
export const revalidate = 60;

export default async function ProjectOverviewPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  let project;
  let items;
  try {
    project = await getProject(slug);
    items = await getProjectSidebar(project.id);
  } catch (err) {
    if (err instanceof AppError && err.code === "NOT_FOUND") notFound();
    throw err;
  }

  const docCount = items.filter((i) => i.type === "DOC").length;
  const postCount = items.filter((i) => i.type === "POST").length;

  return (
    <article className="max-w-3xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        <Badge variant={project.status === "ACTIVE" ? "default" : "secondary"}>
          {project.status}
        </Badge>
      </div>

      {project.description && (
        <p className="text-lg text-muted-foreground mb-6">{project.description}</p>
      )}

      <div className="flex gap-3 mb-8">
        {project.repoUrl && (
          <Button asChild variant="outline" size="sm">
            <a href={project.repoUrl} target="_blank" rel="noreferrer">
              <Github className="h-4 w-4 mr-2" />
              Repository
            </a>
          </Button>
        )}
        {project.liveUrl && (
          <Button asChild variant="outline" size="sm">
            <a href={project.liveUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Live Demo
            </a>
          </Button>
        )}
      </div>

      {project.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {project.categories.map(({ category }) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <Badge variant="secondary">{category.name}</Badge>
            </Link>
          ))}
        </div>
      )}

      {project.techStack.length > 0 && (
        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground mb-2">Tech Stack</p>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <Badge key={tech} variant="outline" className="font-mono text-[11px]">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-6 p-4 rounded-lg bg-muted/50 border mb-8">
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{docCount}</span>
          <span className="text-muted-foreground">doc {docCount === 1 ? "page" : "pages"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{postCount}</span>
          <span className="text-muted-foreground">
            related {postCount === 1 ? "post" : "posts"}
          </span>
        </div>
      </div>

      {items.length > 0 && (
        <p className="text-muted-foreground text-sm">
          Use the sidebar to navigate through documentation pages and related posts.
        </p>
      )}
    </article>
  );
}
