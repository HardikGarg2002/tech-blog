import Link from "next/link";
import { ExternalLink, Github, FileText, BookOpen } from "lucide-react";
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
import { ProjectWithRelations } from "@/types";

interface ProjectCardProps {
  project: ProjectWithRelations & {
    _count?: { items?: number; sections?: number };
    docCount?: number;
    postCount?: number;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="flex flex-col h-full hover:border-primary transition-all">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex flex-wrap gap-2 mb-2">
            {project.categories.map(({ category }) => (
              <Badge key={category.id} variant="secondary">
                {category.name}
              </Badge>
            ))}
          </div>
          <Badge variant={project.status === "ACTIVE" ? "default" : "secondary"}>
            {project.status}
          </Badge>
        </div>
        <CardTitle className="text-xl">{project.name}</CardTitle>
        {project.description && (
          <CardDescription className="line-clamp-2">{project.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <Badge key={tech} variant="outline" className="font-mono text-[10px]">
              {tech}
            </Badge>
          ))}
        </div>

        {(project.docCount !== undefined || project.postCount !== undefined) && (
          <div className="flex gap-4 text-xs text-muted-foreground">
            {project.docCount !== undefined && (
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {project.docCount} doc{project.docCount !== 1 ? "s" : ""}
              </span>
            )}
            {project.postCount !== undefined && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {project.postCount} post{project.postCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/projects/${project.slug}`}>View Project</Link>
        </Button>
        {project.repoUrl && (
          <Button asChild variant="ghost" size="icon">
            <a href={project.repoUrl} target="_blank" rel="noreferrer">
              <Github className="h-4 w-4" />
            </a>
          </Button>
        )}
        {project.liveUrl && (
          <Button asChild variant="ghost" size="icon">
            <a href={project.liveUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
