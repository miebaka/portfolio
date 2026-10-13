export function createAbuseGuard({ rateLimiter, minimumFillMs = 3_000 } = {}) {
  if (typeof rateLimiter !== "function") throw new TypeError("rateLimiter must be a function");
  return async function guard({ req, contact, now, requestId, signal }) {
    if (contact.website) return { ok: false, silent: true };
    if (now - contact.startedAt < minimumFillMs) return { ok: false, silent: false };
    const result = await rateLimiter({ req, now, requestId, signal });
    if (!result.allowed) return { ok: false, rateLimited: true, retryAfter: result.retryAfter };
    return { ok: true };
  };
}
