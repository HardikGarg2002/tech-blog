import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/services/project.service";
import { getProjectItemBySlug } from "@/services/projectItem.service";
import { AppError } from "@/lib/errors";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ slug: string; itemSlug: string }> }
) {
  try {
    const { slug, itemSlug } = await props.params;
    const project = await getProject(slug);
    const item = await getProjectItemBySlug(project.id, itemSlug);
    return NextResponse.json({ data: item });
  } catch (err) {
    if (err instanceof AppError)
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
    return NextResponse.json({ error: { code: "INTERNAL", message: "Server error" } }, { status: 500 });
  }
}
