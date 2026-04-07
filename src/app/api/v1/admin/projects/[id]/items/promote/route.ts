import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPostItem } from "@/services/projectItem.service";
import { AppError } from "@/lib/errors";

export const POST = auth(
  async (req, props: { params: Promise<{ id: string }> }) => {
    if (!req.auth) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
    }

    const { id } = await props.params;

    try {
      const body = await req.json();
      const item = await createPostItem({ ...body, projectId: id });
      return NextResponse.json({ data: item }, { status: 201 });
    } catch (err) {
      if (err instanceof AppError)
        return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
      return NextResponse.json({ error: { code: "INTERNAL", message: "Failed to promote post" } }, { status: 500 });
    }
  }
);
