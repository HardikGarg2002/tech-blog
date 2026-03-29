import { Errors } from "@/lib/errors";
import * as mediaRepo from "@/repositories/media.repository";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export async function uploadMedia(file: File): Promise<{ url: string }> {
  if (!ALLOWED_TYPES.includes(file.type))
    throw Errors.UPLOAD_REJECTED(`File type not allowed: ${file.type}`);
  if (file.size > MAX_BYTES)
    throw Errors.UPLOAD_REJECTED(`File too large: ${file.size} bytes (max 5MB)`);

  // Upload to S3-compatible storage
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const client = new S3Client({
    region: "auto",
    endpoint: process.env.STORAGE_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY!,
      secretAccessKey: process.env.STORAGE_SECRET_KEY!,
    },
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET!,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    })
  );

  const url = `${process.env.STORAGE_ENDPOINT}/${process.env.STORAGE_BUCKET}/${filename}`;

  await mediaRepo.createMediaRecord({
    url,
    filename,
    mimeType: file.type,
    sizeBytes: file.size,
  });

  return { url };
}
