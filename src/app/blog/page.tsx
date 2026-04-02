import { listPosts } from "@/services/post.service";
import { PostCard } from "@/components/blog/PostCard";

export const revalidate = 60;

export default async function BlogPage() {
  const result = await listPosts({ perPage: 100 });
  const posts = result.data;

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight">Writing Archive</h1>
          <p className="text-muted-foreground text-lg max-w-[800px]">
            Technical notes, deep dives, and documented learnings. Search through
            all posts or browse by category.
          </p>
        </div>

        {/* Post Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post as any} />)
          ) : (
            <div className="col-span-full py-24 text-center">
              <p className="text-muted-foreground">
                No posts have been published yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
