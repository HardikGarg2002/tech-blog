import Link from "next/link";
import { listPosts } from "@/services/post.service";
import { getAllCategories } from "@/services/category.service";
import { PostCard } from "@/components/blog/PostCard";
import type { PostCardModel } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Code } from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const [postsResult, categories] = await Promise.all([
    listPosts({ perPage: 3, forCard: true }),
    getAllCategories(),
  ]);

  const posts = postsResult.data as PostCardModel[];

  return (
    <div className="flex flex-col gap-16 py-10">
      <section className="container flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          Notes on{" "}
          <span className="font-serif italic text-primary">Engineering</span> &
          Development
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          A personal collection of technical documentation, architectural
          patterns, and project learnings.
        </p>
        <div className="flex flex-wrap justify-center gap-4 py-4">
          <Button asChild size="lg">
            <Link href="/blog">
              Read Blog <BookOpen className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/projects">
              View Projects <Code className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="container">
        <div className="flex items-center justify-between pb-8">
          <h2 className="text-3xl font-bold tracking-tight">Recent Posts</h2>
          <Button asChild variant="ghost">
            <Link href="/blog">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No posts published yet.
            </div>
          )}
        </div>
      </section>

      <section className="container -mx-4 bg-muted/50 px-4 py-16 sm:-mx-8 sm:px-8 md:rounded-3xl">
        <div className="pb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Browse by Category
          </h2>
          <p className="text-muted-foreground">
            Focused documentation across key domains.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative flex flex-col gap-2 rounded-xl border bg-background p-6 transition-all hover:border-primary hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium text-muted-foreground">
                  {cat._count.posts} posts
                </span>
              </div>
              <h3 className="font-bold group-hover:text-primary">{cat.name}</h3>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {cat.description ||
                  `Explore ${cat.name} related notes and projects.`}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
