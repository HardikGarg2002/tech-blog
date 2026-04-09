import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllProjects, createProject } from "@/services/project.service";
import { AppError } from "@/lib/errors";

export const GET = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
  }

  try {
    const projects = await getAllProjects();
    return NextResponse.json({ data: projects });
  } catch (err) {
    if (err instanceof AppError)
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
    return NextResponse.json({ error: { code: "INTERNAL", message: "Server error" } }, { status: 500 });
  }
});

export const POST = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const project = await createProject(body);
    return NextResponse.json({ data: project });
  } catch (err) {
    if (err instanceof AppError)
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
    return NextResponse.json({ error: { code: "INTERNAL", message: "Failed to create project" } }, { status: 500 });
  }
});
