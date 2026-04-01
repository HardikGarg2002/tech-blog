import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { publishPost } from "@/services/post.service";
import { AppError } from "@/lib/errors";

export const POST = auth(
  async (
    req,
    props: { params: Promise<{ id: string }> }
  ) => {
    if (!req.auth) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
    }
    const { id } = await props.params;

    try {
      const updated = await publishPost(id);
      return NextResponse.json({ data: updated });
    } catch (err) {
      if (err instanceof AppError)
        return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
      return NextResponse.json({ error: { code: "INTERNAL", message: "Publish failed" } }, { status: 500 });
    }
  }
);
