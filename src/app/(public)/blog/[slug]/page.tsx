import { getPublishedPost } from "@/services/post.service";
import { notFound } from "next/navigation";
import { ArticleMarkdown } from "@/components/mdx/ArticleMarkdown";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppError } from "@/lib/errors";
import { PostWithRelations } from "@/types";

export const revalidate = 60;

export default async function BlogPostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  let post: PostWithRelations;
  try {
    post = await getPublishedPost(slug);
  } catch (err) {
    if (err instanceof AppError && err.code === "NOT_FOUND") {
      notFound();
    }
    throw err;
  }

  return (
    <article className="container max-w-3xl py-10">
      <Link
        href="/blog"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to blog
      </Link>

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          {post.categories.map(({ category }) => (
            <Badge key={category.id} variant="secondary">
              {category.name}
            </Badge>
          ))}
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-xl text-muted-foreground leading-relaxed">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center gap-6 text-sm text-muted-foreground py-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {format(
              new Date(post.publishedAt || post.createdAt),
              "MMMM dd, yyyy"
            )}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {post.readingTime || 5} min read
          </div>
        </div>

        {post.featuredImage && (
          <div className="relative aspect-video overflow-hidden rounded-xl border mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- external/CMS URLs; no fixed dimensions for Image */}
            <img
              src={post.featuredImage}
              alt={post.imageAlt || post.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <Separator className="my-8" />

        <ArticleMarkdown source={post.body} size="article" />

        <Separator className="my-12" />

        <div className="flex flex-wrap gap-2">
          {post.tags.map(({ tag }) => (
            <Badge key={tag.id} variant="outline" className="font-mono text-[10px]">
              #{tag.name}
            </Badge>
          ))}
        </div>
      </div>
    </article>
  );
}
