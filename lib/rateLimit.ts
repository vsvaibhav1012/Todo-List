interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true, remaining: opts.max - 1, resetAt: now + opts.windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, opts.max - entry.count);
  return { allowed: entry.count <= opts.max, remaining, resetAt: entry.resetAt };
}

// Auth: 5 attempts per 15 minutes per key
export const AUTH_LIMIT: RateLimitOptions = { windowMs: 15 * 60 * 1000, max: 5 };
// General mutations: 100 per minute
export const MUTATION_LIMIT: RateLimitOptions = { windowMs: 60 * 1000, max: 100 };
