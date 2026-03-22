interface RateLimitEntry {
  count:     number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();

export async function checkRateLimit(
  uid: string,
  action: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const key   = `${uid}:${action}`;
  const now   = Date.now();

  // Lazy cleanup to avoid zombie intervals in serverless/HMR
  if (now - lastCleanup > 10 * 60 * 1000) {
    for (const [k, e] of store.entries()) {
      if (now - e.windowStart > 10 * 60 * 1000) store.delete(k);
    }
    lastCleanup = now;
  }

  const entry = store.get(key);

  if (!entry || now - entry.windowStart > windowSeconds * 1000) {
    store.set(key, { count: 1, windowStart: now });
    return false; // Not limited
  }

  if (entry.count >= maxRequests) {
    return true; // Limited
  }

  entry.count++;
  return false; // Not limited
}


