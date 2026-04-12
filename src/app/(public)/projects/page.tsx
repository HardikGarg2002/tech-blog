import { getListedProjects } from "@/services/project.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";

export const revalidate = 60;

export default async function ProjectsPage() {
  await connection();
  const projects = await getListedProjects();

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-lg max-w-[800px]">
            A showcase of systems, tools, and experiments I&apos;ve built. Most
            are open-source and documented here.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {projects.length > 0 ? (
            projects.map((project) => (
              <Card
                key={project.id}
                className="flex flex-col h-full hover:border-primary transition-all"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {project.categories.map(({ category }) => (
                        <Badge key={category.id} variant="secondary">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                    <Badge
                      variant={
                        project.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <Badge
                        key={tech}
                        variant="outline"
                        className="font-mono text-[10px]"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/projects/${project.slug}`}>Case Study</Link>
                  </Button>
                  {project.repoUrl && (
                    <Button asChild variant="ghost" size="icon">
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {project.liveUrl && (
                    <Button asChild variant="ghost" size="icon">
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
              <p className="text-muted-foreground">
                No projects documented yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
