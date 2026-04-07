"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PromotePostModal } from "@/components/admin/PromotePostModal";
import {
  Trash2,
  Edit,
  CheckCircle,
  PlusCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import type {
  AdminProjectItemApiRow,
  AdminProjectSummaryFromApi,
  AdminSectionOption,
} from "@/types";
import {
  createProjectDocItem,
  createProjectSection,
  deleteProjectItem,
  deleteProjectSection,
  publishProjectItem,
  refreshProjectSidebarItems,
} from "@/actions/admin-projects";

type Props = {
  projectId: string;
  initialProject: AdminProjectSummaryFromApi;
  initialItems: AdminProjectItemApiRow[];
  initialSections: AdminSectionOption[];
};

export function ProjectDashboardClient({
  projectId,
  initialProject,
  initialItems,
  initialSections,
}: Props) {
  const [project] = useState(initialProject);
  const [items, setItems] = useState(initialItems);
  const [sections, setSections] = useState(initialSections);
  const [promoteOpen, setPromoteOpen] = useState(false);

  const [addDocOpen, setAddDocOpen] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docBody, setDocBody] = useState("");
  const [docSectionId, setDocSectionId] = useState("");
  const [addingDoc, setAddingDoc] = useState(false);

  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");
  const [addingSection, setAddingSection] = useState(false);

  const handlePublish = async (itemId: string) => {
    const result = await publishProjectItem(projectId, itemId);
    if (result.ok) {
      toast.success("Item published");
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, status: "PUBLISHED" } : i)),
      );
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Delete this item?")) return;
    const result = await deleteProjectItem(projectId, itemId);
    if (result.ok) {
      toast.success("Deleted");
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } else {
      toast.error(result.error);
    }
  };

  const handleAddDoc = async () => {
    if (!docTitle.trim() || !docBody.trim()) {
      toast.error("Title and body are required");
      return;
    }
    setAddingDoc(true);
    try {
      const result = await createProjectDocItem(projectId, {
        title: docTitle,
        body: docBody,
        sectionId: docSectionId || undefined,
      });
      if (result.ok) {
        const refreshed = await refreshProjectSidebarItems(projectId);
        if (refreshed.ok) setItems(refreshed.data);
        setDocTitle("");
        setDocBody("");
        setDocSectionId("");
        setAddDocOpen(false);
        toast.success("Doc page added");
      } else {
        toast.error(result.error);
      }
    } finally {
      setAddingDoc(false);
    }
  };

  const handleAddSection = async () => {
    if (!sectionTitle.trim()) {
      toast.error("Section title is required");
      return;
    }
    setAddingSection(true);
    try {
      const result = await createProjectSection(projectId, sectionTitle);
      if (result.ok) {
        setSections((prev) => [...prev, result.data]);
        setSectionTitle("");
        setAddSectionOpen(false);
        toast.success("Section added");
      } else {
        toast.error(result.error);
      }
    } finally {
      setAddingSection(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Delete this section? Items will become unsectioned.")) return;
    const result = await deleteProjectSection(projectId, sectionId);
    if (result.ok) {
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
      setItems((prev) =>
        prev.map((i) =>
          i.sectionId === sectionId ? { ...i, sectionId: null, section: null } : i,
        ),
      );
      toast.success("Section deleted");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm text-muted-foreground">/projects/{project.slug}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/projects/${project.slug}`} target="_blank">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Site
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Sidebar / Content</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setAddSectionOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Section
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAddDocOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Doc Page
              </Button>
              <Button size="sm" onClick={() => setPromoteOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-1" />
                Promote Post
              </Button>
            </div>
          </div>

          {sections.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sections
              </p>
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-3 border rounded-md bg-muted/30"
                >
                  <span className="font-medium text-sm">{section.title}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive"
                    onClick={() => handleDeleteSection(section.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">#</th>
                  <th className="text-left px-4 py-2.5 font-medium">Title</th>
                  <th className="text-left px-4 py-2.5 font-medium">Type</th>
                  <th className="text-left px-4 py-2.5 font-medium">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium">Section</th>
                  <th className="text-right px-4 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5 text-muted-foreground">{item.order}</td>
                    <td className="px-4 py-2.5 font-medium max-w-[180px] truncate">
                      {item.title ?? item.post?.title}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={item.type === "DOC" ? "default" : "secondary"} className="text-[10px]">
                        {item.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge
                        variant={item.status === "PUBLISHED" ? "default" : "outline"}
                        className="text-[10px]"
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">
                      {item.section?.title ?? "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1 justify-end">
                        {item.type === "DOC" && (
                          <>
                            <Button asChild size="icon" variant="ghost" className="h-7 w-7">
                              <Link href={`/admin/projects/${projectId}/items/${item.id}/edit`}>
                                <Edit className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                            {item.status !== "PUBLISHED" ? (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-green-600"
                                onClick={() => handlePublish(item.id)}
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                              </Button>
                            ) : null}
                          </>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      No content yet. Add a doc page or promote a post.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {addDocOpen && (
            <div className="border rounded-lg p-4 flex flex-col gap-3 bg-muted/20">
              <h3 className="font-medium text-sm">New Doc Page</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Title *</Label>
                  <Input
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="Page title"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Section (optional)</Label>
                  <select
                    className="border rounded px-2 py-2 text-sm bg-background"
                    value={docSectionId}
                    onChange={(e) => setDocSectionId(e.target.value)}
                  >
                    <option value="">No section</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Body (MDX) *</Label>
                <textarea
                  className="border rounded px-3 py-2 text-sm bg-background min-h-[100px] font-mono resize-y"
                  value={docBody}
                  onChange={(e) => setDocBody(e.target.value)}
                  placeholder="# Page content"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddDoc} disabled={addingDoc}>
                  {addingDoc && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setAddDocOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {addSectionOpen && (
            <div className="border rounded-lg p-4 flex flex-col gap-3 bg-muted/20">
              <h3 className="font-medium text-sm">New Section</h3>
              <div className="flex gap-3">
                <Input
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  placeholder="Section title"
                />
                <Button size="sm" onClick={handleAddSection} disabled={addingSection}>
                  {addingSection && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setAddSectionOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Project Info</h2>
          <div className="border rounded-lg p-4 flex flex-col gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant={project.status === "ACTIVE" ? "default" : "secondary"}>
                {project.status}
              </Badge>
            </div>
            {project.description && (
              <div>
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="mt-0.5">{project.description}</p>
              </div>
            )}
            {project.techStack.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tech Stack</p>
                <div className="flex flex-wrap gap-1">
                  {project.techStack.map((t) => (
                    <Badge key={t} variant="outline" className="font-mono text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {project.categories.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Categories</p>
                <div className="flex flex-wrap gap-1">
                  {project.categories.map(({ category }) => (
                    <Badge key={category.id} variant="secondary" className="text-[10px]">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {project.repoUrl && (
              <div>
                <p className="text-xs text-muted-foreground">Repo</p>
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline text-xs truncate block"
                >
                  {project.repoUrl}
                </a>
              </div>
            )}
            {project.liveUrl && (
              <div>
                <p className="text-xs text-muted-foreground">Live URL</p>
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline text-xs truncate block"
                >
                  {project.liveUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <PromotePostModal
        open={promoteOpen}
        onClose={() => setPromoteOpen(false)}
        projectId={projectId}
        sections={sections}
        onSuccess={async () => {
          const r = await refreshProjectSidebarItems(projectId);
          if (r.ok) setItems(r.data);
        }}
      />
    </div>
  );
}
