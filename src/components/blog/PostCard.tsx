import Link from "next/link";
import { format } from "date-fns";
import { PostWithRelations } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Clock, FolderOpen } from "lucide-react";

function formatPostTypeLabel(type: PostWithRelations["type"]) {
  if (type === "PROJECT_WRITEUP") return "Project writeup";
  return type.charAt(0) + type.slice(1).toLowerCase();
}

export function PostCard({ post }: { post: PostWithRelations }) {
  const publishedAt = post.publishedAt || post.createdAt;
  const tags = post.tags.slice(0, 3);

  return (
    <Card className="flex h-full flex-col border border-border/70 bg-card/90 transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {formatPostTypeLabel(post.type)}
          </Badge>
          <span className="rounded-full border border-border/70 px-3 py-1 text-muted-foreground">
            {post.linkedProject ? "Project-linked" : "Standalone"}
          </span>
        </div>

        {post.linkedProject && (
          <Link
            href={`/projects/${post.linkedProject.slug}`}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            Part of {post.linkedProject.name}
          </Link>
        )}

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{format(new Date(publishedAt), "MMM dd, yyyy")}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readingTime || 5} min read
            </span>
          </div>

          <CardTitle className="text-2xl leading-tight tracking-tight text-balance">
            <Link
              href={`/blog/${post.slug}`}
              className="transition-colors hover:text-primary"
            >
              {post.title}
            </Link>
          </CardTitle>

          <CardDescription className="text-sm leading-7">
            {post.excerpt || "Open the post to read the full note and implementation details."}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="flex flex-wrap gap-2">
          {post.categories.map(({ category }) => (
            <Badge key={category.id} variant="outline" className="rounded-full">
              {category.name}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {tags.length > 0 ? (
            tags.map(({ tag }) => (
              <span key={tag.id} className="rounded-full bg-muted px-2.5 py-1">
                #{tag.name}
              </span>
            ))
          ) : (
            <span>No tags</span>
          )}
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
        >
          Read post
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
