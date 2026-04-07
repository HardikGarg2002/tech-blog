"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Save, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Section {
  id: string;
  title: string;
}

interface ProjectListEntry {
  id: string;
  slug: string;
}

interface ProjectItemListEntry {
  id: string;
  title: string | null;
  slug: string;
  body: string | null;
  sectionId: string | null;
  order: number;
  status: string;
  section?: { title: string } | null;
}

export default function DocItemEditorPage() {
  const params = useParams<{ id: string; itemId: string }>();
  const { id: projectId, itemId } = params;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [order, setOrder] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const titleBodyRef = useRef({ title: "", body: "" });

  useEffect(() => {
    titleBodyRef.current = { title, body };
  }, [title, body]);

  useEffect(() => {
    const load = async () => {
      try {
        const projectsRes = await fetch("/api/v1/projects").then((r) => r.json());
        const project = (projectsRes.data ?? []).find(
          (p: ProjectListEntry) => p.id === projectId
        );

        if (project) {
          const itemsRes = await fetch(`/api/v1/projects/${project.slug}/items`).then((r) => r.json());
          const allItems = (itemsRes.data ?? []) as ProjectItemListEntry[];

          const item = allItems.find((i) => i.id === itemId);
          if (item) {
            setTitle(item.title ?? "");
            setSlug(item.slug ?? "");
            setBody(item.body ?? "");
            setSectionId(item.sectionId ?? "");
            setOrder(String(item.order ?? ""));
            setStatus(item.status ?? "DRAFT");
          }

          // Extract sections
          const sectionMap = new Map<string, Section>();
          for (const i of allItems) {
            if (i.section && i.sectionId) {
              sectionMap.set(i.sectionId, { id: i.sectionId, title: i.section.title });
            }
          }
          setSections(Array.from(sectionMap.values()));
        }
      } catch {
        toast.error("Failed to load item");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId, itemId]);

  const handleSave = useCallback(
    async (silent = false) => {
      const { title: t, body: b } = titleBodyRef.current;
      if (!t.trim() || !b.trim()) return;

      setSaving(true);
      try {
        const res = await fetch(`/api/v1/admin/projects/${projectId}/items/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: t,
            slug,
            body: b,
            sectionId: sectionId || null,
            order: order ? Number(order) : undefined,
          }),
        });

        if (res.ok) {
          if (!silent) toast.success("Saved");
        } else {
          const err = await res.json();
          toast.error(err.error?.message ?? "Failed to save");
        }
      } finally {
        setSaving(false);
      }
    },
    [projectId, itemId, slug, sectionId, order]
  );

  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      const { title: t, body: b } = titleBodyRef.current;
      if (t && b) handleSave(true);
    }, 30000);
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [handleSave]);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(
        `/api/v1/admin/projects/${projectId}/items/${itemId}/publish`,
        { method: "POST" }
      );
      if (res.ok) {
        setStatus("PUBLISHED");
        toast.success("Published");
      } else {
        toast.error("Failed to publish");
      }
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/admin/projects/${projectId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold flex-1">Edit Doc Page</h1>
        <Badge variant={status === "PUBLISHED" ? "default" : "secondary"}>{status}</Badge>
        <Button size="sm" variant="outline" onClick={() => handleSave()} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          Save
        </Button>
        {status !== "PUBLISHED" && (
          <Button size="sm" onClick={handlePublish} disabled={publishing}>
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
            Publish
          </Button>
        )}
      </div>

      {/* Metadata row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page title" />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Slug</Label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated" />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Order</Label>
          <Input type="number" value={order} onChange={(e) => setOrder(e.target.value)} placeholder="Auto" />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Section</Label>
          <select
            className="border rounded px-2 py-2 text-sm bg-background"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
          >
            <option value="">No section</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Split-pane editor */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0" style={{ height: "calc(100vh - 240px)" }}>
        <div className="flex flex-col gap-1 h-full">
          <Label className="text-xs">MDX Content</Label>
          <textarea
            className="flex-1 border rounded px-3 py-2 text-sm font-mono bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="# Your documentation content..."
          />
        </div>
        <div className="flex flex-col gap-1 h-full">
          <Label className="text-xs">Preview</Label>
          <div className="flex-1 border rounded px-4 py-3 overflow-auto bg-muted/20 prose prose-sm dark:prose-invert max-w-none text-sm">
            <pre className="whitespace-pre-wrap text-xs text-muted-foreground font-mono">{body}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
