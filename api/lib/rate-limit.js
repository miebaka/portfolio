import { createHmac } from "node:crypto";

const WINDOW_MS = 15 * 60 * 1_000;
const LIMIT = 5;
const SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]
redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
local count = redis.call('ZCARD', key)
if count >= limit then
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  local retry = window
  if oldest[2] then retry = math.max(1000, window - (now - tonumber(oldest[2]))) end
  return {0, count, retry}
end
redis.call('ZADD', key, now, member)
redis.call('PEXPIRE', key, window)
return {1, count + 1, 0}
`;

export function privacyKey(value, secret) {
  if (!secret) throw new Error("RATE_LIMIT_SECRET is required");
  return createHmac("sha256", secret).update(String(value || "unknown")).digest("hex");
}

export function requestAddress(req) {
  const forwarded = req?.headers?.["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : String(forwarded || "").split(",")[0].trim();
  return first || req?.socket?.remoteAddress || "unknown";
}

export function createUpstashRateLimiter({
  url = process.env.UPSTASH_REDIS_REST_URL,
  token = process.env.UPSTASH_REDIS_REST_TOKEN,
  secret = process.env.RATE_LIMIT_SECRET,
  fetchImpl = fetch,
  windowMs = WINDOW_MS,
  limit = LIMIT
} = {}) {
  return async function checkRateLimit({ req, now, requestId, signal }) {
    if (!url || !token || !secret) throw new Error("Rate-limit service is not configured");
    const key = `contact:${privacyKey(requestAddress(req), secret)}`;
    const response = await fetchImpl(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["EVAL", SCRIPT, "1", key, String(now), String(windowMs), String(limit), requestId]),
      signal
    });
    if (!response.ok) throw new Error("Rate-limit service unavailable");
    const payload = await response.json();
    if (payload.error || !Array.isArray(payload.result)) throw new Error("Invalid rate-limit response");
    const [allowed, , retryMs] = payload.result.map(Number);
    return { allowed: allowed === 1, retryAfter: allowed === 1 ? 0 : Math.max(1, Math.ceil(retryMs / 1_000)) };
  };
}

export { LIMIT, WINDOW_MS };
