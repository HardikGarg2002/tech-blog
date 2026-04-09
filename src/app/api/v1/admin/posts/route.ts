import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPost, getAdminAllPosts } from "@/services/post.service";
import { AppError } from "@/lib/errors";

export const GET = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const perPage = Number(url.searchParams.get("perPage") ?? "50");
    const result = await getAdminAllPosts({ page, perPage });
    return NextResponse.json({ data: result.posts, meta: result });
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
    const post = await createPost(body);
    return NextResponse.json({ data: post });
  } catch (err) {
    if (err instanceof AppError)
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
    return NextResponse.json({ error: { code: "INTERNAL", message: "Failed to create post" } }, { status: 500 });
  }
});

