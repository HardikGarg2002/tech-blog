import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteMedia } from "@/services/upload.service";
import { AppError } from "@/lib/errors";

export const DELETE = auth(
  async (req, props: { params: Promise<{ id: string }> }) => {
    if (!req.auth) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
    }

    const { id } = await props.params;

    try {
      await deleteMedia(id);
      return NextResponse.json({ success: true });
    } catch (err) {
      if (err instanceof AppError)
        return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
      return NextResponse.json({ error: { code: "INTERNAL", message: "Deletion failed" } }, { status: 500 });
    }
  }
);
