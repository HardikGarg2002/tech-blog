import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createDocItem } from "@/services/projectItem.service";
import { AppError } from "@/lib/errors";

export const POST = auth(async (req, props: { params: Promise<{ id: string }> }) => {
  if (!req.auth) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
  }

  try {
    const { id } = await props.params;
    const body = await req.json();
    const item = await createDocItem({ ...body, projectId: id });
    return NextResponse.json({ data: item }, { status: 201 });
  } catch (err) {
    if (err instanceof AppError)
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
    return NextResponse.json({ error: { code: "INTERNAL", message: "Failed to create doc item" } }, { status: 500 });
  }
});
