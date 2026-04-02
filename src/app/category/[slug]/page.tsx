import { getCategoryWithPosts, getAllCategorySlugs } from "@/services/category.service";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/blog/PostCard";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppError } from "@/lib/errors";

export const revalidate = 300;

export async function generateStaticParams() {
  const categories = await getAllCategorySlugs();
  return categories.map((cat) => ({ slug: cat.slug }));
}

export default async function CategoryPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  
  try {
    const category: any = await getCategoryWithPosts(slug);
    const posts = category.posts.map((cp: any) => cp.post);

    return (
      <div className="container py-10">
        <Link
          href="/blog"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> All posts
        </Link>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{category.icon}</span>
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
              {category.children.map((child: any) => (
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

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-4">
            {posts.length > 0 ? (
              posts.map((post: any) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="col-span-full py-24 text-center">
                <p className="text-muted-foreground">
                  No posts found in this category.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (err) {
    if (err instanceof AppError && err.code === "NOT_FOUND") {
      notFound();
    }
    throw err;
  }
}
