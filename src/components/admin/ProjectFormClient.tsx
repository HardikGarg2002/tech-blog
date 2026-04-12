"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { Loader2, X, Plus } from "lucide-react";
import { createAdminProject, updateAdminProject } from "@/actions/admin-projects";

type Category = { id: string; name: string };

type InitialProject = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  repoUrl: string | null;
  liveUrl: string | null;
  techStack: string[];
  body: string;
  categories: { category: Category }[];
};

type Props = {
  categories: Category[];
  initialProject?: InitialProject;
};

const PROJECT_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ARCHIVED", label: "Archived" },
];

export function ProjectFormClient({ categories, initialProject }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState(initialProject?.name ?? "");
  const [description, setDescription] = useState(initialProject?.description ?? "");
  const [status, setStatus] = useState(initialProject?.status ?? "ACTIVE");
  const [repoUrl, setRepoUrl] = useState(initialProject?.repoUrl ?? "");
  const [liveUrl, setLiveUrl] = useState(initialProject?.liveUrl ?? "");
  const [body, setBody] = useState(initialProject?.body ?? "");

  const [techInput, setTechInput] = useState("");
  const [techStack, setTechStack] = useState<string[]>(initialProject?.techStack ?? []);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialProject?.categories.map((c) => c.category.id) ?? []
  );

  const isEditing = !!initialProject;

  const handleAddTech = () => {
    const t = techInput.trim();
    if (t && !techStack.includes(t)) {
      setTechStack((prev) => [...prev, t]);
    }
    setTechInput("");
  };

  const removeTech = (t: string) => setTechStack((prev) => prev.filter((x) => x !== t));

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (!body.trim()) { toast.error("Overview body is required"); return; }
    if (selectedCategories.length === 0) { toast.error("Select at least one category"); return; }

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      status: status as "ACTIVE" | "COMPLETED" | "ARCHIVED",
      repoUrl: repoUrl.trim() || undefined,
      liveUrl: liveUrl.trim() || undefined,
      techStack,
      body: body.trim(),
      categories: selectedCategories,
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        const result = await updateAdminProject(initialProject.id, payload);
        if (result.ok) {
          toast.success("Project updated");
          router.push(`/admin/projects/${initialProject.id}`);
          router.refresh();
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await createAdminProject(payload);
        if (result.ok) {
          toast.success("Project created");
          router.push(`/admin/projects/${result.data.id}`);
          router.refresh();
        } else {
          toast.error(result.error);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="proj-name">Project Name *</Label>
            <Input
              id="proj-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Project"
              className="text-base"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="proj-desc">Short Description</Label>
            <Input
              id="proj-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="One-liner about this project"
            />
          </div>

          {/* Body */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="proj-body">Overview Body (MDX) *</Label>
            <Textarea
              id="proj-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={"# About this project\n\nWhat it does, why I built it..."}
              className="font-mono text-sm min-h-[280px] resize-y"
            />
          </div>

          {/* URLs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proj-repo">Repo URL</Label>
              <Input
                id="proj-repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proj-live">Live URL</Label>
              <Input
                id="proj-live"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://..."
                className="text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="proj-status">Status</Label>
            <select
              id="proj-status"
              className="border rounded-md px-3 py-2 text-sm bg-background w-full"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-1.5">
            <Label>Categories * <span className="text-xs text-muted-foreground">({selectedCategories.length})</span></Label>
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

          {/* Tech Stack */}
          <div className="flex flex-col gap-1.5">
            <Label>Tech Stack</Label>
            <div className="flex gap-2">
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTech(); } }}
                placeholder="Next.js, Prisma..."
                className="text-sm"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddTech}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {techStack.map((t) => (
                  <Badge key={t} variant="outline" className="font-mono text-xs gap-1">
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTech(t)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? "Save Changes" : "Create Project"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/projects")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
