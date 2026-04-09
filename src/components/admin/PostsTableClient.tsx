"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Edit, CheckCircle, Trash2, Loader2, Eye } from "lucide-react";
import { publishAdminPost, deleteAdminPost } from "@/actions/admin-posts";
import { format } from "date-fns";

type PostRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  type: string;
  createdAt: Date;
  publishedAt: Date | null;
  categories: { category: { id: string; name: string } }[];
};

type Props = {
  initialPosts: PostRow[];
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  ARCHIVED: "outline",
};

const TYPE_LABELS: Record<string, string> = {
  CONCEPT: "Concept",
  TOOL: "Tool",
  PROJECT_WRITEUP: "Writeup",
};

export function PostsTableClient({ initialPosts }: Props) {
  const [posts, setPosts] = useState(initialPosts);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handlePublish = async (id: string) => {
    setLoadingId(id);
    try {
      const result = await publishAdminPost(id);
      if (result.ok) {
        toast.success("Post published");
        setPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: "PUBLISHED" } : p))
        );
      } else {
        toast.error(result.error);
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setLoadingId(id);
    try {
      const result = await deleteAdminPost(id);
      if (result.ok) {
        toast.success("Post deleted");
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        toast.error(result.error);
      }
    } finally {
      setLoadingId(null);
    }
  };

  if (posts.length === 0) {
    return (
      <div className="border rounded-xl p-12 text-center text-muted-foreground">
        No posts yet.{" "}
        <Link href="/admin/posts/new" className="text-primary hover:underline">
          Create your first post →
        </Link>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Title</th>
            <th className="text-left px-4 py-3 font-medium">Type</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-left px-4 py-3 font-medium">Categories</th>
            <th className="text-left px-4 py-3 font-medium">Created</th>
            <th className="text-right px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {posts.map((post) => {
            const isLoading = loadingId === post.id;
            return (
              <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 max-w-[220px]">
                  <p className="font-medium truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">/blog/{post.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {TYPE_LABELS[post.type] ?? post.type}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[post.status] ?? "outline"} className="text-[10px]">
                    {post.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {post.categories.slice(0, 2).map(({ category }) => (
                      <Badge key={category.id} variant="secondary" className="text-[10px]">
                        {category.name}
                      </Badge>
                    ))}
                    {post.categories.length > 2 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{post.categories.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {format(new Date(post.createdAt), "MMM d, yyyy")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 items-center justify-end">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        {post.status === "PUBLISHED" && (
                          <Button asChild size="icon" variant="ghost" className="h-7 w-7">
                            <Link href={`/blog/${post.slug}`} target="_blank">
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        )}
                        <Button asChild size="icon" variant="ghost" className="h-7 w-7">
                          <Link href={`/admin/posts/${post.id}/edit`}>
                            <Edit className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        {post.status !== "PUBLISHED" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-green-600"
                            onClick={() => handlePublish(post.id)}
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => handleDelete(post.id, post.title)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
