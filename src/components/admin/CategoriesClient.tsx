"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { Loader2, Edit, Trash2, PlusCircle, Check, X } from "lucide-react";
import {
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from "@/actions/admin-categories";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  parent: { id: string; name: string } | null;
  _count: { posts: number; projects: number };
};

type Props = {
  initialCategories: CategoryRow[];
  allForParent: { id: string; name: string }[];
};

export function CategoriesClient({ initialCategories, allForParent }: Props) {
  const [categories, setCategories] = useState(initialCategories);
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Create form state
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState("#6366f1");
  const [newParent, setNewParent] = useState("");

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editColor, setEditColor] = useState("");

  const startEdit = (cat: CategoryRow) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description ?? "");
    setEditColor(cat.color ?? "#6366f1");
  };

  const cancelEdit = () => setEditingId(null);

  const handleCreate = () => {
    if (!newName.trim()) { toast.error("Name is required"); return; }
    startTransition(async () => {
      const result = await createAdminCategory({
        name: newName.trim(),
        slug: newSlug.trim() || undefined,
        description: newDesc.trim() || undefined,
        color: newColor || undefined,
        parentId: newParent || undefined,
      });
      if (result.ok) {
        toast.success("Category created");
        // Refresh by adding a placeholder row; user can refresh to get full data
        setCategories((prev) => [
          ...prev,
          {
            id: result.data.id,
            name: result.data.name,
            slug: result.data.slug,
            description: newDesc.trim() || null,
            color: newColor || null,
            parent: newParent ? (allForParent.find((p) => p.id === newParent) ?? null) : null,
            _count: { posts: 0, projects: 0 },
          },
        ]);
        setNewName(""); setNewSlug(""); setNewDesc(""); setNewColor("#6366f1"); setNewParent("");
        setCreateOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleUpdate = (id: string) => {
    if (!editName.trim()) { toast.error("Name is required"); return; }
    startTransition(async () => {
      const result = await updateAdminCategory(id, {
        name: editName.trim(),
        description: editDesc.trim() || undefined,
        color: editColor || undefined,
      });
      if (result.ok) {
        toast.success("Category updated");
        setCategories((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, name: editName, description: editDesc || null, color: editColor || null } : c
          )
        );
        setEditingId(null);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This will detach it from all posts and projects.`)) return;
    startTransition(async () => {
      const result = await deleteAdminCategory(id);
      if (result.ok) {
        toast.success("Category deleted");
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Create button */}
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCreateOpen((o) => !o)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Category
        </Button>
      </div>

      {/* Create form */}
      {createOpen && (
        <div className="border rounded-xl p-5 bg-muted/20 flex flex-col gap-4">
          <p className="font-semibold text-sm">New Category</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cat-name">Name *</Label>
              <Input id="cat-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Next.js" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cat-slug">Slug <span className="text-xs text-muted-foreground">(auto)</span></Label>
              <Input id="cat-slug" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="nextjs" className="font-mono text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cat-desc">Description</Label>
              <Input id="cat-desc" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Optional" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cat-parent">Parent Category</Label>
              <select
                id="cat-parent"
                className="border rounded-md px-3 py-2 text-sm bg-background"
                value={newParent}
                onChange={(e) => setNewParent(e.target.value)}
              >
                <option value="">None (top-level)</option>
                {allForParent.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cat-color">Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  id="cat-color"
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="h-9 w-12 rounded-md cursor-pointer border"
                />
                <span className="text-sm font-mono text-muted-foreground">{newColor}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Slug</th>
              <th className="text-left px-4 py-3 font-medium">Parent</th>
              <th className="text-left px-4 py-3 font-medium">Posts</th>
              <th className="text-left px-4 py-3 font-medium">Projects</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                {editingId === cat.id ? (
                  // Edit row
                  <>
                    <td className="px-4 py-2" colSpan={3}>
                      <div className="flex gap-2 items-center">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8 text-sm"
                          placeholder="Name"
                        />
                        <Input
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="h-8 text-sm"
                          placeholder="Description"
                        />
                        <input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="h-8 w-10 rounded cursor-pointer border"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2" colSpan={2} />
                    <td className="px-4 py-2">
                      <div className="flex gap-1 justify-end">
                        <Button size="icon" className="h-7 w-7" variant="ghost" onClick={() => handleUpdate(cat.id)} disabled={isPending}>
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        </Button>
                        <Button size="icon" className="h-7 w-7" variant="ghost" onClick={cancelEdit}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </>
                ) : (
                  // Normal row
                  <>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {cat.color && (
                          <span
                            className="h-3 w-3 rounded-full inline-block flex-shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                        )}
                        <span className="font-medium">{cat.name}</span>
                        {cat.description && (
                          <span className="text-xs text-muted-foreground truncate max-w-[140px]">{cat.description}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{cat.slug}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {cat.parent ? (
                        <Badge variant="outline" className="text-[10px]">{cat.parent.name}</Badge>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{cat._count.posts}</td>
                    <td className="px-4 py-3 text-muted-foreground">{cat._count.projects}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(cat)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(cat.id, cat.name)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No categories yet. Create one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
