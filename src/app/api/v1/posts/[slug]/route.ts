import { NextRequest, NextResponse } from "next/server";
import { getPublishedPost } from "@/services/post.service";
import { AppError } from "@/lib/errors";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;

  try {
    const post = await getPublishedPost(slug);
    return NextResponse.json({ data: post });
  } catch (err) {
    if (err instanceof AppError)
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
    return NextResponse.json({ error: { code: "INTERNAL", message: "Server error" } }, { status: 500 });
  }
}
