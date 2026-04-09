"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, X, Plus } from "lucide-react";
import { createAdminPost, updateAdminPost } from "@/actions/admin-posts";

type Category = { id: string; name: string };

type InitialPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  type: string;
  status: string;
  seoTitle: string | null;
  seoDesc: string | null;
  featuredImage: string | null;
  imageAlt: string | null;
  categories: { category: Category }[];
  tags: { tag: { id: string; name: string } }[];
};

type Props = {
  categories: Category[];
  initialPost?: InitialPost;
};

const POST_TYPES = [
  { value: "CONCEPT", label: "Concept" },
  { value: "TOOL", label: "Tool" },
  { value: "PROJECT_WRITEUP", label: "Project Writeup" },
];

export function PostFormClient({ categories, initialPost }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "");
  const [body, setBody] = useState(initialPost?.body ?? "");
  const [type, setType] = useState(initialPost?.type ?? "CONCEPT");
  const [seoTitle, setSeoTitle] = useState(initialPost?.seoTitle ?? "");
  const [seoDesc, setSeoDesc] = useState(initialPost?.seoDesc ?? "");
  const [featuredImage, setFeaturedImage] = useState(initialPost?.featuredImage ?? "");
  const [imageAlt, setImageAlt] = useState(initialPost?.imageAlt ?? "");

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialPost?.categories.map((c) => c.category.id) ?? []
  );
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(
    initialPost?.tags.map((t) => t.tag.name) ?? []
  );

  const isEditing = !!initialPost;

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!body.trim()) { toast.error("Body is required"); return; }
    if (selectedCategories.length === 0) { toast.error("Select at least one category"); return; }

    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      excerpt: excerpt.trim() || undefined,
      body: body.trim(),
      type: type as "CONCEPT" | "TOOL" | "PROJECT_WRITEUP",
      categories: selectedCategories,
      tags,
      seoTitle: seoTitle.trim() || undefined,
      seoDesc: seoDesc.trim() || undefined,
      featuredImage: featuredImage.trim() || undefined,
      imageAlt: imageAlt.trim() || undefined,
    };

    startTransition(async () => {
      if (isEditing) {
        const result = await updateAdminPost(initialPost.id, payload);
        if (result.ok) {
          toast.success("Post updated");
          router.push("/admin/posts");
          router.refresh();
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await createAdminPost(payload);
        if (result.ok) {
          toast.success("Post created as draft");
          router.push("/admin/posts");
          router.refresh();
        } else {
          toast.error(result.error);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Core fields */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-title">Title *</Label>
            <Input
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="text-base"
            />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-slug">
              Slug <span className="text-muted-foreground text-xs">(auto-generated if empty)</span>
            </Label>
            <Input
              id="post-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-post-slug"
              className="font-mono text-sm"
            />
          </div>

          {/* Excerpt */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-excerpt">Excerpt</Label>
            <Textarea
              id="post-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short summary shown in post listings"
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Body — Write/Preview tabs */}
          <div className="flex flex-col gap-1.5">
            <Label>Body (MDX) *</Label>
            <Tabs defaultValue="write">
              <TabsList>
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="write">
                <Textarea
                  id="post-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={"# Start writing your post\n\nUse MDX here..."}
                  className="font-mono text-sm min-h-[360px] resize-y"
                />
              </TabsContent>
              <TabsContent value="preview">
                <div className="border rounded-md p-4 min-h-[360px] bg-muted/20">
                  {body ? (
                    <pre className="text-sm whitespace-pre-wrap font-sans text-foreground/80">
                      {body}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">Nothing to preview yet.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-5">
          {/* Post type */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-type">Post Type</Label>
            <select
              id="post-type"
              className="border rounded-md px-3 py-2 text-sm bg-background w-full"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {POST_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-1.5">
            <Label>Categories * <span className="text-xs text-muted-foreground">({selectedCategories.length} selected)</span></Label>
            <div className="border rounded-md p-3 flex flex-wrap gap-2 max-h-48 overflow-y-auto bg-muted/10">
              {categories.map((cat) => {
                const selected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted hover:bg-muted/80 border-border"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                placeholder="Add tag..."
                className="text-sm"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Featured image */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-image">Featured Image URL</Label>
            <Input
              id="post-image"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://..."
              className="text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-image-alt">Image Alt Text</Label>
            <Input
              id="post-image-alt"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Describe the image"
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* SEO section */}
      <div className="border rounded-xl p-5 flex flex-col gap-4">
        <p className="text-sm font-semibold">SEO</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-seo-title">SEO Title <span className="text-xs text-muted-foreground">(max 60)</span></Label>
            <Input
              id="post-seo-title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Overrides the title in search results"
              maxLength={60}
              className="text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-seo-desc">Meta Description <span className="text-xs text-muted-foreground">(max 160)</span></Label>
            <Input
              id="post-seo-desc"
              value={seoDesc}
              onChange={(e) => setSeoDesc(e.target.value)}
              placeholder="Shown in search results"
              maxLength={160}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? "Save Changes" : "Create Post (Draft)"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/posts")}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
