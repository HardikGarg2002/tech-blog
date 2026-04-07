import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null = null;

function getLimiter(): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(60, "1 m"),
    });
  }
  return ratelimit;
}

/** Returns false when over limit (only when Upstash is configured). */
export async function tryConsumeSearchBudget(identifier: string): Promise<boolean> {
  const limiter = getLimiter();
  if (!limiter) return true;
  const { success } = await limiter.limit(identifier);
  return success;
}
