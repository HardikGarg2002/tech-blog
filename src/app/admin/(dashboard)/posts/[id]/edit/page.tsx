import { getAdminPost } from "@/services/post.service";
import { getAllCategories } from "@/services/category.service";
import { PostFormClient } from "@/components/admin/PostFormClient";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;

  const [categories, post] = await Promise.all([
    getAllCategories(),
    getAdminPost(id).catch(() => null),
  ]);

  if (!post) notFound();

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
        <h1 className="text-2xl font-bold">Edit Post</h1>
        <p className="text-sm text-muted-foreground font-mono mt-0.5">/blog/{post.slug}</p>
      </div>

      <PostFormClient
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        initialPost={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          body: post.body,
          type: post.type,
          status: post.status,
          seoTitle: post.seoTitle,
          seoDesc: post.seoDesc,
          featuredImage: post.featuredImage,
          imageAlt: post.imageAlt,
          categories: post.categories,
          tags: post.tags,
        }}
      />
    </div>
  );
}
