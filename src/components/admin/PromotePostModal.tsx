"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";

interface UnlinkedPost {
  id: string;
  title: string;
  slug: string;
  type: string;
}

interface Section {
  id: string;
  title: string;
}

interface PromotePostModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  sections: Section[];
  onSuccess: () => void;
}

export function PromotePostModal({
  open,
  onClose,
  projectId,
  sections,
  onSuccess,
}: PromotePostModalProps) {
  const [posts, setPosts] = useState<UnlinkedPost[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPost, setSelectedPost] = useState<UnlinkedPost | null>(null);
  const [sectionId, setSectionId] = useState("");
  const [order, setOrder] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFetching(true);
    fetch("/api/v1/posts?linkedProjectId=null&perPage=100")
      .then((r) => r.json())
      .then((d) => setPosts(d.data ?? []))
      .catch(() => toast.error("Failed to load posts"))
      .finally(() => setFetching(false));
  }, [open]);

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!selectedPost) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/projects/${projectId}/items/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: selectedPost.id,
          sectionId: sectionId || undefined,
          order: order ? Number(order) : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? "Failed to promote post");
      }

      toast.success("Post added to project");
      onSuccess();
      onClose();
      setSelectedPost(null);
      setSearch("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to promote post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Promote Existing Post</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="border rounded-md max-h-56 overflow-y-auto">
            {fetching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No unlinked published posts found.
              </p>
            ) : (
              filtered.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => setSelectedPost(post)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-muted transition-colors border-b last:border-0 ${
                    selectedPost?.id === post.id ? "bg-primary/10" : ""
                  }`}
                >
                  <span className="truncate">{post.title}</span>
                  <Badge variant="outline" className="text-[10px] shrink-0 ml-2">
                    {post.type}
                  </Badge>
                </button>
              ))
            )}
          </div>

          {selectedPost && (
            <div className="flex flex-col gap-3 p-3 bg-muted/50 rounded-md">
              <p className="text-sm font-medium">Selected: {selectedPost.title}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Section (optional)</Label>
                  <select
                    className="border rounded px-2 py-1.5 text-sm bg-background"
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                  >
                    <option value="">No section</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Order (optional)</Label>
                  <Input
                    type="number"
                    placeholder="Auto"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedPost || loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add to Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
