// Build-time boolean only. Never serialize provider credentials into HTML.
export const REQUIRED_CONTACT_ENV = ["RESEND_API_KEY", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL", "RATE_LIMIT_SECRET", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"];
export function contactServiceConfigured(env) {
  return REQUIRED_CONTACT_ENV.every(key => typeof env[key] === "string" && env[key].trim().length > 0);
}
