/**
 * Simple in-memory rate limiter.
 * Tracks request counts per key within a time window.
 * Note: This is process-local and resets on server restart.
 * For production with multiple instances, use a Redis-based solution.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

export interface RateLimitOptions {
  /** Maximum number of requests allowed within the window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

/**
 * Check and increment rate limit for a given key.
 * @returns `{ allowed: boolean, remaining: number, retryAfterMs: number }`
 */
export function rateLimit(
  key: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowMs })
    return { allowed: true, remaining: options.limit - 1, retryAfterMs: 0 }
  }

  entry.count++
  if (entry.count > options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: entry.resetAt - now,
    }
  }

  return {
    allowed: true,
    remaining: options.limit - entry.count,
    retryAfterMs: 0,
  }
}
