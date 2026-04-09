import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateProject, archiveProject } from "@/services/project.service";
import { AppError } from "@/lib/errors";

export const PUT = auth(
  async (req, props: { params: Promise<{ id: string }> }) => {
    if (!req.auth) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
    }

    const { id } = await props.params;

    try {
      const body = await req.json();
      const project = await updateProject(id, body);
      return NextResponse.json({ data: project });
    } catch (err) {
      if (err instanceof AppError)
        return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
      return NextResponse.json({ error: { code: "INTERNAL", message: "Failed to update project" } }, { status: 500 });
    }
  }
);

export const DELETE = auth(
  async (req, props: { params: Promise<{ id: string }> }) => {
    if (!req.auth) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
    }

    const { id } = await props.params;

    try {
      await archiveProject(id);
      return NextResponse.json({ success: true });
    } catch (err) {
      if (err instanceof AppError)
        return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
      return NextResponse.json({ error: { code: "INTERNAL", message: "Archival failed" } }, { status: 500 });
    }
  }
);
