import { NextResponse } from "next/server";
import { getAllProjects } from "@/services/project.service";
import { AppError } from "@/lib/errors";

export async function GET() {
  try {
    const projects = await getAllProjects();
    return NextResponse.json({ data: projects });
  } catch (err) {
    if (err instanceof AppError)
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
    return NextResponse.json({ error: { code: "INTERNAL", message: "Server error" } }, { status: 500 });
  }
}
