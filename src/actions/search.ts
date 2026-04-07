"use server";

import { headers } from "next/headers";
import { performSiteSearch } from "@/services/search.service";
import { tryConsumeSearchBudget } from "@/lib/search-ratelimit";
import type { SearchResult } from "@/types";
import { actionError, type ActionResult } from "./action-result";

export async function runSiteSearch(query: string): Promise<ActionResult<SearchResult[]>> {
  try {
    const q = query.trim();
    if (!q) return { ok: true, data: [] };

    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
    const allowed = await tryConsumeSearchBudget(ip);
    if (!allowed) {
      return { ok: false, error: "Too many requests", code: "TOO_MANY_REQUESTS" };
    }

    const data = await performSiteSearch(q);
    return { ok: true, data };
  } catch (err) {
    return actionError(err);
  }
}
