import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateSection, deleteSection } from "@/services/projectSection.service";
import { getProjectById } from "@/services/project.service";
import { AppError } from "@/lib/errors";

export const PUT = auth(
  async (req, props: { params: Promise<{ id: string; sectionId: string }> }) => {
    if (!req.auth) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
    }

    const { id, sectionId } = await props.params;

    try {
      const project = await getProjectById(id);
      const body = await req.json();
      await updateSection(sectionId, body, project.slug);
      return NextResponse.json({ success: true });
    } catch (err) {
      if (err instanceof AppError)
        return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
      return NextResponse.json({ error: { code: "INTERNAL", message: "Failed to update section" } }, { status: 500 });
    }
  }
);

export const DELETE = auth(
  async (req, props: { params: Promise<{ id: string; sectionId: string }> }) => {
    if (!req.auth) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
    }

    const { id, sectionId } = await props.params;

    try {
      const project = await getProjectById(id);
      await deleteSection(sectionId, project.slug);
      return NextResponse.json({ success: true });
    } catch (err) {
      if (err instanceof AppError)
        return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
      return NextResponse.json({ error: { code: "INTERNAL", message: "Failed to delete section" } }, { status: 500 });
    }
  }
);
