import { NextRequest, NextResponse } from "next/server";
import { listPosts } from "@/services/post.service";
import { getAllProjects } from "@/services/project.service";
import { AppError } from "@/lib/errors";
import Fuse from "fuse.js";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize rate limiter only if env vars are present
let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 requests per minute
  });
}

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q");

    if (!q) {
      return NextResponse.json({ data: [] });
    }

    // Handle rate limiting
    if (ratelimit) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: { code: "TOO_MANY_REQUESTS", message: "Too many requests" } },
          { status: 429 }
        );
      }
    }

    const [postsData, projects] = await Promise.all([
      listPosts({ perPage: 100 }), // Get some recent posts for search
      getAllProjects(),
    ]);

    const formattedPosts = postsData.data.map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      type: "post" as const,
      categories: p.categories.map((cp: any) => cp.category.name),
      tags: p.tags.map((tp: any) => tp.tag.name),
    }));

    const formattedProjects = projects.map((p: any) => ({
      id: p.id,
      title: p.name,
      slug: p.slug,
      excerpt: p.description,
      type: "project" as const,
      categories: p.categories.map((cp: any) => cp.category.name),
      tags: p.techStack,
    }));

    const searchData = [...formattedPosts, ...formattedProjects];

    const fuse = new Fuse(searchData, {
      keys: ["title", "excerpt", "categories", "tags"],
      threshold: 0.3,
    });

    const results = fuse.search(q).slice(0, 20).map((r) => r.item);

    return NextResponse.json({ data: results });
  } catch (err) {
    if (err instanceof AppError)
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
    return NextResponse.json({ error: { code: "INTERNAL", message: "Search failed" } }, { status: 500 });
  }
}
