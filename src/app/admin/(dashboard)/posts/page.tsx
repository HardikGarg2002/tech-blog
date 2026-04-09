import { getAdminAllPosts } from "@/services/post.service";
import { PostsTableClient } from "@/components/admin/PostsTableClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default async function AdminPostsPage() {
  const { posts } = await getAdminAllPosts({ perPage: 100 });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{posts.length} total</p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Post
          </Link>
        </Button>
      </div>

      <PostsTableClient initialPosts={posts} />
    </div>
  );
}
