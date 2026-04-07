import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadMedia } from "@/services/upload.service";
import { AppError } from "@/lib/errors";

export const POST = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: { code: "INVALID_INPUT", message: "No file provided" } }, { status: 400 });
    }

    const result = await uploadMedia(file);
    return NextResponse.json({ data: result });
  } catch (err) {
    if (err instanceof AppError)
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
    return NextResponse.json({ error: { code: "INTERNAL", message: "Upload failed" } }, { status: 500 });
  }
});
