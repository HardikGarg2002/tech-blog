import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/services/project.service";
import { getProjectSidebar } from "@/services/projectItem.service";
import { AppError } from "@/lib/errors";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await props.params;
    const project = await getProject(slug);
    const items = await getProjectSidebar(project.id);
    return NextResponse.json({ data: items });
  } catch (err) {
    if (err instanceof AppError)
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
    return NextResponse.json({ error: { code: "INTERNAL", message: "Server error" } }, { status: 500 });
  }
}
