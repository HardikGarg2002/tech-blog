import Link from "next/link";
import { format } from "date-fns";
import { PostWithRelations } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

export function PostCard({ post }: { post: PostWithRelations }) {
  const publishedAt = post.publishedAt || post.createdAt;

  return (
    <Card className="flex flex-col h-full transition-all hover:border-primary hover:shadow-lg">
      <Link href={`/blog/${post.slug}`} className="cursor-pointer">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {post.categories.map(({ category }) => (
              <Badge key={category.id} variant="secondary">
                {category.name}
              </Badge>
            ))}
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl line-clamp-2">{post.title}</CardTitle>
            <CardDescription className="flex items-center gap-4 text-xs">
              <span>{format(new Date(publishedAt), "MMM dd, yyyy")}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.readingTime || 5} min read
              </span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {post.excerpt || "No summary available for this post. Click to read more."}
          </p>
        </CardContent>
      </Link>
      <CardFooter className="mt-auto">
        <div className="flex flex-wrap gap-1">
          {post.tags.map(({ tag }) => (
            <span key={tag.id} className="text-[10px] text-muted-foreground">
              #{tag.name}
            </span>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
