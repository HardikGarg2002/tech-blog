import { getAllCategories } from "@/services/category.service";
import { PostFormClient } from "@/components/admin/PostFormClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewPostPage() {
  const categories = await getAllCategories();

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <Link
          href="/admin/posts"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Posts
        </Link>
        <h1 className="text-2xl font-bold">New Post</h1>
      </div>

      <PostFormClient
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
