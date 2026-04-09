import { listMedia } from "@/services/upload.service";
import { MediaClient } from "@/components/admin/MediaClient";

export default async function AdminMediaPage() {
  const media = await listMedia();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Media Library</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {media.length} {media.length === 1 ? "file" : "files"} uploaded
        </p>
      </div>

      <MediaClient
        initialMedia={media.map((m) => ({
          id: m.id,
          url: m.url,
          filename: m.filename,
          mimeType: m.mimeType,
          sizeBytes: m.sizeBytes,
          createdAt: m.createdAt,
        }))}
      />
    </div>
  );
}
