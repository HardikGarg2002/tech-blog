"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Save, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { DocItemEditorPayload } from "@/actions/admin-projects";
import {
  publishDocItemFromEditor,
  updateDocItemFields,
} from "@/actions/admin-projects";

type Props = {
  projectId: string;
  itemId: string;
  initial: DocItemEditorPayload;
};

export function DocItemEditorClient({ projectId, itemId, initial }: Props) {
  const { item: initItem, sections: initialSections } = initial;

  const [title, setTitle] = useState(initItem.title);
  const [slug, setSlug] = useState(initItem.slug);
  const [body, setBody] = useState(initItem.body);
  const [sectionId, setSectionId] = useState(initItem.sectionId);
  const [order, setOrder] = useState(initItem.order);
  const [status, setStatus] = useState(initItem.status);
  const [sections] = useState(initialSections);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const titleBodyRef = useRef({ title: initItem.title, body: initItem.body });

  useEffect(() => {
    titleBodyRef.current = { title, body };
  }, [title, body]);

  const handleSave = useCallback(
    async (silent = false) => {
      const { title: t, body: b } = titleBodyRef.current;
      if (!t.trim() || !b.trim()) return;

      setSaving(true);
      try {
        const res = await updateDocItemFields(projectId, itemId, {
          title: t,
          slug,
          body: b,
          sectionId: sectionId || null,
          order: order ? Number(order) : undefined,
        });

        if (res.ok) {
          if (!silent) toast.success("Saved");
        } else {
          toast.error(res.error);
        }
      } finally {
        setSaving(false);
      }
    },
    [projectId, itemId, slug, sectionId, order],
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
      const res = await publishDocItemFromEditor(projectId, itemId);
      if (res.ok) {
        setStatus("PUBLISHED");
        toast.success("Published");
      } else {
        toast.error(res.error);
      }
    } finally {
      setPublishing(false);
    }
  };

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
            {publishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-1" />
            )}
            Publish
          </Button>
        )}
      </div>

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
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className="grid grid-cols-2 gap-4 flex-1 min-h-0"
        style={{ height: "calc(100vh - 240px)" }}
      >
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
