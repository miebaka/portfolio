export function createAbuseGuard({ rateLimiter } = {}) {
  if (typeof rateLimiter !== "function") throw new TypeError("rateLimiter must be a function");
  return async function guard({ req, contact, now, requestId, signal }) {
    if (contact.website) return { ok: false, silent: true };
    const result = await rateLimiter({ req, now, requestId, signal });
    if (!result.allowed) return { ok: false, rateLimited: true, retryAfter: result.retryAfter };
    return { ok: true };
  };
}
