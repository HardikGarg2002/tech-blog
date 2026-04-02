import { getProject, getAllProjectSlugs } from "@/services/project.service";
import { notFound } from "next/navigation";
import { processMDX } from "@/lib/mdx";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Github, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppError } from "@/lib/errors";

export const revalidate = 60;

export async function generateStaticParams() {
  const projects = await getAllProjectSlugs();
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  try {
    const project = await getProject(slug);
    const { content } = await processMDX(project.body);

    return (
      <article className="container max-w-4xl py-10">
        <Link
          href="/projects"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to projects
        </Link>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {project.categories.map(({ category }: any) => (
                <Badge key={category.id} variant="secondary">
                  {category.name}
                </Badge>
              ))}
              <Badge
                variant={project.status === "ACTIVE" ? "default" : "secondary"}
              >
                {project.status}
              </Badge>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              {project.name}
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-3 py-4">
              {project.repoUrl && (
                <Button asChild>
                  <a href={project.repoUrl} target="_blank" rel="noreferrer">
                    <Github className="mr-2 h-4 w-4" /> GitHub Repository
                  </a>
                </Button>
              )}
              {project.liveUrl && (
                <Button asChild variant="outline">
                  <a href={project.liveUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Demo Application
                  </a>
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech: any) => (
                <Badge key={tech} variant="outline" className="font-mono">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {content}
          </div>
        </div>
      </article>
    );
  } catch (err) {
    if (err instanceof AppError && err.code === "NOT_FOUND") {
      notFound();
    }
    throw err;
  }
}
