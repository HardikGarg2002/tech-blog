import { NextRequest, NextResponse } from "next/server";
import { listPosts } from "@/services/post.service";
import { AppError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const result = await listPosts({
      page: Number(searchParams.get("page") ?? 1),
      perPage: Number(searchParams.get("perPage") ?? 10),
      categorySlug: searchParams.get("category") ?? undefined,
      tagSlug: searchParams.get("tag") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AppError)
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
    return NextResponse.json({ error: { code: "INTERNAL", message: "Server error" } }, { status: 500 });
  }
}
