import { NextRequest, NextResponse } from "next/server";
import { listPosts } from "@/services/post.service";
import { AppError } from "@/lib/errors";
import { parsePostType } from "@/types/domain";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const linkedProjectIdParam = searchParams.get("linkedProjectId");
    const result = await listPosts({
      page: Number(searchParams.get("page") ?? 1),
      perPage: Number(searchParams.get("perPage") ?? 10),
      categorySlug: searchParams.get("category") ?? undefined,
      tagSlug: searchParams.get("tag") ?? undefined,
      type: parsePostType(searchParams.get("type")),
      linkedProjectId: linkedProjectIdParam === "null" ? null : linkedProjectIdParam ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AppError)
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
    return NextResponse.json({ error: { code: "INTERNAL", message: "Server error" } }, { status: 500 });
  }
}
