"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Upload, Trash2, Copy, Loader2, Image as ImageIcon, FileText, File } from "lucide-react";
import { format } from "date-fns";

type MediaItem = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
};

type Props = {
  initialMedia: MediaItem[];
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-blue-400" />;
  if (mimeType.startsWith("text/") || mimeType.includes("pdf")) return <FileText className="h-5 w-5 text-amber-400" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
}

export function MediaClient({ initialMedia }: Props) {
  const [media, setMedia] = useState(initialMedia);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    fetch("/api/v1/admin/upload", { method: "POST", body: formData })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message ?? "Upload failed");
        toast.success("File uploaded");
        setMedia((prev) => [json.data, ...prev]);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setUploading(false));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const handleDelete = (id: string, filename: string) => {
    if (!confirm(`Delete "${filename}"?`)) return;
    startTransition(async () => {
      const res = await fetch(`/api/v1/admin/upload/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deleted");
        setMedia((prev) => prev.filter((m) => m.id !== id));
      } else {
        toast.error("Failed to delete");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          accept="image/*,video/*,.pdf,.txt,.md"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Upload className="h-8 w-8" />
            <div>
              <p className="font-medium text-foreground">Drop a file here or click to upload</p>
              <p className="text-xs mt-1">Images, PDFs, and text files supported</p>
            </div>
          </div>
        )}
      </div>

      {/* Media grid */}
      {media.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 text-sm">
          No files uploaded yet.
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium w-12"></th>
                <th className="text-left px-4 py-3 font-medium">Filename</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Size</th>
                <th className="text-left px-4 py-3 font-medium">Uploaded</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {media.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3">
                    {item.mimeType.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.filename}
                        className="h-9 w-9 rounded object-cover border"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded border bg-muted flex items-center justify-center">
                        <MediaIcon mimeType={item.mimeType} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium truncate max-w-[200px]">{item.filename}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">{item.url}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{item.mimeType}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatBytes(item.sizeBytes)}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {format(new Date(item.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleCopy(item.url)}
                        title="Copy URL"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDelete(item.id, item.filename)}
                        disabled={isPending}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
