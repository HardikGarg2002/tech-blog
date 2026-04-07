import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/errors";
import { performSiteSearch } from "@/services/search.service";
import { tryConsumeSearchBudget } from "@/lib/search-ratelimit";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q");

    if (!q) {
      return NextResponse.json({ data: [] });
    }

    if (!(await tryConsumeSearchBudget(req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1"))) {
      return NextResponse.json(
        { error: { code: "TOO_MANY_REQUESTS", message: "Too many requests" } },
        { status: 429 }
      );
    }

    const results = await performSiteSearch(q);
    return NextResponse.json({ data: results });
  } catch (err) {
    if (err instanceof AppError)
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
    return NextResponse.json({ error: { code: "INTERNAL", message: "Search failed" } }, { status: 500 });
  }
}
